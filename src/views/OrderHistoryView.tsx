import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Order } from '../types/index.ts';
import {
  Package,
  Truck,
  Calendar,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
  Clock,
  Printer,
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const { user, token, navigateTo, addToCart, showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Please Sign In</h3>
        <p className="text-xs text-slate-500 mb-4">Log in to view your past and active grocery orders.</p>
      </div>
    );
  }

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.productId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          category: 'cat-staples',
          price: item.price,
          originalPrice: item.price,
          discountPercentage: 0,
          unit: item.unit,
          stock: 50,
          rating: 4.8,
          reviewCount: 10,
          images: [item.image],
          description: item.name,
        },
        item.quantity
      );
    });
    showToast(`Items from order #${order.orderNumber} re-added to basket!`);
    navigateTo('cart');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500">Track current grocery shipments and view your previous receipts</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No orders yet</h3>
          <p className="text-xs text-slate-500 mb-6">
            When you purchase fresh fruits, vegetables, and daily staples, your tracking history will appear here.
          </p>
          <button
            onClick={() => navigateTo('products')}
            className="bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isDelivered = ord.orderStatus === 'Delivered';
            const isCancelled = ord.orderStatus === 'Cancelled';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-700'
                          : isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {ord.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="relative shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                    {ord.items.length > 4 && (
                      <span className="text-xs text-slate-400 font-bold shrink-0">
                        +{ord.items.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Total Amount</span>
                    <span className="text-base font-black text-slate-900">₹{ord.total}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Delivered to: <strong>{ord.shippingAddress.name}</strong> ({ord.shippingAddress.pincode})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(ord)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder Basket</span>
                    </button>
                    <button
                      onClick={() => navigateTo('order-tracking', { id: ord.id })}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track / View Memo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
