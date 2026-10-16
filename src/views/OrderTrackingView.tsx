import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Order, OrderStatus } from '../types/index.ts';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Bike,
  ShieldCheck,
  X,
} from 'lucide-react';

const ORDER_STAGES: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', desc: 'Received & verified by store' },
  { status: 'Order Confirmed', label: 'Order Confirmed', desc: 'Inventory locked & picker assigned' },
  { status: 'Preparing Your Basket', label: 'Preparing Basket', desc: 'Selecting fresh farm harvest' },
  { status: 'Packed', label: 'Packed & Sealed', desc: 'Inspected and eco-bagged' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { status: 'Delivered', label: 'Delivered', desc: 'Safely handed over at doorstep' },
];

export const OrderTrackingView: React.FC = () => {
  const { viewParams, navigateTo, showToast } = useApp();
  const orderId = viewParams.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrder = () => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    // Periodic refresh every 6 seconds for simulated live transit
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/advance-status`, {
        method: 'POST',
      });
      const data = await res.json();
      setAdvancing(false);
      if (res.ok) {
        setOrder(data.order);
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Failed to advance status', 'error');
      }
    } catch {
      setAdvancing(false);
      showToast('Network error', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      setCancelling(false);
      if (res.ok) {
        setOrder(data.order);
        showToast('Order cancelled successfully', 'info');
      } else {
        showToast(data.error || 'Cannot cancel order', 'error');
      }
    } catch {
      setCancelling(false);
      showToast('Network error cancelling order', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Connecting to real-time order tracking satellite...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Order Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">We could not locate this order tracking ID.</p>
        <button
          onClick={() => navigateTo('order-history')}
          className="bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.status === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel =
    order.orderStatus === 'Order Placed' || order.orderStatus === 'Order Confirmed';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Order Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400">Tracking Order:</span>
            <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
              {order.orderNumber}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isCancelled
                  ? 'bg-rose-100 text-rose-700'
                  : order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Demo Status Advancer */}
          {!isCancelled && order.orderStatus !== 'Delivered' && (
            <button
              onClick={handleAdvanceStatus}
              disabled={advancing}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Click to simulate next stage in order fulfillment"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{advancing ? 'Updating...' : 'Advance Status (Demo Step)'}</span>
            </button>
          )}

          {/* Invoice Print Button */}
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Invoice</span>
          </button>

          {/* Cancel Order (if eligible) */}
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* 6-STAGE INTERACTIVE TIMELINE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-700" />
          <span>Fulfillment Lifecycle</span>
        </h3>

        {isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 text-xs">
            <h4 className="font-bold text-sm mb-1">Order Cancelled</h4>
            <p>
              This grocery order has been cancelled and any paid amount has been refunded to your original payment method.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:grid grid-cols-6 gap-2 text-center relative">
              {/* Connector line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 z-0" />
              <div
                className="absolute top-5 left-8 h-1 bg-emerald-600 z-0 transition-all duration-500"
                style={{
                  width: `${Math.min(100, (Math.max(0, currentStageIndex) / 5) * 100)}%`,
                }}
              />

              {ORDER_STAGES.map((st, i) => {
                const isPassed = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;

                return (
                  <div key={st.status} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                          : 'bg-white text-slate-400 border-2 border-slate-200'
                      } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-bold mt-2.5 ${
                        isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 max-w-[110px] line-clamp-2">
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-4 relative border-l-2 border-slate-200 ml-4 pl-6">
              {ORDER_STAGES.map((st, i) => {
                const isPassed = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;

                return (
                  <div key={st.status} className="relative">
                    <div
                      className={`absolute -left-[33px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white text-slate-400 border border-slate-300'
                      } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {st.label}
                      </h4>
                      <p className="text-[11px] text-slate-500">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIVE COURIER TRACKING MAP & DELIVERY PARTNER */}
      {!isCancelled && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Simulated Real-Time Map (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bike className="w-5 h-5 text-emerald-700" />
                  <span>Live Courier GPS Location</span>
                </h3>
                <p className="text-xs text-slate-500">Electric delivery scooter tracking in transit</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                ETA: {order.estimatedDeliveryTime || '22 mins'}
              </span>
            </div>

            {/* Simulated Visual Transit Canvas */}
            <div className="relative h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center">
              {/* Map stylized background grid */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#166534_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Road pathway line */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 60 180 Q 200 40 450 120 T 700 80"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeDasharray="6,6"
                />
              </svg>

              {/* Origin Hub Pin */}
              <div className="absolute left-12 bottom-12 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-lg">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow mt-1">
                  Food Basket Hub
                </span>
              </div>

              {/* Moving Courier Icon */}
              <div
                className={`absolute flex flex-col items-center transition-all duration-1000 ${
                  order.orderStatus === 'Delivered'
                    ? 'right-16 top-16'
                    : order.orderStatus === 'Out for Delivery'
                    ? 'left-1/2 top-1/3'
                    : 'left-24 bottom-20'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl ring-4 ring-emerald-400/30 animate-bounce">
                  <Bike className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black bg-emerald-950 text-white px-2 py-0.5 rounded-full shadow mt-1">
                  {order.courierName || 'Ramesh (Courier)'}
                </span>
              </div>

              {/* Customer Destination Pin */}
              <div className="absolute right-12 top-12 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow mt-1">
                  Your Doorstep
                </span>
              </div>
            </div>

            {/* Courier Profile Info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-sm">
                  {order.courierName ? order.courierName.charAt(0) : 'R'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{order.courierName || 'Ramesh Kumar'}</h4>
                  <p className="text-[11px] text-slate-500">
                    Electric Scooter • 4.9 ★ (1,420 deliveries)
                  </p>
                </div>
              </div>
              <a
                href={`tel:${order.courierPhone || '+919845122334'}`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </a>
            </div>
          </div>

          {/* Right Side: Order Summary & Address (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
              Basket Contents ({order.items.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 line-clamp-1">{it.name}</h5>
                      <span className="text-[11px] text-slate-500">
                        {it.quantity} × ₹{it.price} ({it.unit})
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base text-emerald-800">₹{order.total}</span>
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold block mb-1">Shipping Address:</span>
              <p className="font-bold text-slate-900">{order.shippingAddress.name}</p>
              <p className="text-slate-600">{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex justify-between items-start">
              <div>
                <span className="text-xl font-black text-emerald-900">
                  Food<span className="text-emerald-600">Basket</span>
                </span>
                <p className="text-xs text-slate-500">Tax Invoice & Delivery Memo</p>
                <p className="text-[11px] text-slate-400">GSTIN: 29AABCU9603R1ZM</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono font-bold text-slate-800 block">
                  Invoice #{order.orderNumber}
                </span>
                <span className="text-slate-500">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-4 text-xs pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Billed & Delivered To:</span>
                <p className="font-bold text-slate-900">{order.shippingAddress.name}</p>
                <p className="text-slate-600">{order.shippingAddress.street}</p>
                <p className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                <p className="text-slate-500">Phone: {order.shippingAddress.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold block mb-0.5">Payment Details:</span>
                <p className="font-bold text-emerald-800 capitalize">
                  Method: {order.paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                </p>
                <p className="text-slate-600 capitalize">Status: {order.paymentStatus}</p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Unit</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2 text-center text-slate-500">{item.unit}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">₹{item.price}</td>
                    <td className="py-2 text-right font-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 flex flex-col items-end text-xs space-y-1">
              <div className="w-48 flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="w-48 flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold">-₹{order.discount}</span>
                </div>
              )}
              <div className="w-48 flex justify-between">
                <span>Delivery:</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="w-48 flex justify-between">
                <span>Taxes:</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="w-48 flex justify-between text-sm font-black border-t border-slate-200 pt-1 text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-800">₹{order.total}</span>
              </div>
            </div>

            {/* Print Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
