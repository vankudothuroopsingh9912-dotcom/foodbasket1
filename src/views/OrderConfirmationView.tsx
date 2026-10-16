import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Order } from '../types/index.ts';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  ShoppingBag,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { viewParams, navigateTo, activeOrderId } = useApp();
  const orderId = viewParams.orderId || activeOrderId;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#166534', '#22c55e', '#f59e0b', '#3b82f6'],
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }

    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .catch((err) => console.error(err));
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed & Received
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Thank You for Shopping Fresh!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your grocery basket has been forwarded to our local fulfillment center. Our fresh produce pickers are preparing your order right now.
          </p>
        </div>

        {/* Order Quick Details */}
        {order && (
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 text-left space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Order Number</span>
                <span className="font-mono font-black text-slate-900 text-sm">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Payment</span>
                <span className="font-bold text-emerald-800 capitalize">
                  {order.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Estimated Delivery</span>
                <span className="font-bold text-slate-900">{order.estimatedDeliveryTime || 'In 25-35 mins'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px] mb-1">Delivering To:</span>
                <p className="font-bold text-slate-900">{order.shippingAddress.name}</p>
                <p className="text-slate-600 leading-snug">
                  {order.shippingAddress.street}, {order.shippingAddress.pincode}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">📞 {order.shippingAddress.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[11px] mb-1">Items in Basket ({order.items.length}):</span>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-slate-700 truncate max-w-[160px]">{item.name}</span>
                      <span className="font-semibold text-slate-900">{item.quantity} × ₹{item.price}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-[10px] text-slate-400 italic">
                      + {order.items.length - 3} more grocery items
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between font-black text-slate-900 text-xs">
                  <span>Grand Total:</span>
                  <span className="text-emerald-800 text-sm">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {order && (
            <button
              onClick={() => navigateTo('order-tracking', { id: order.id })}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Progress</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
