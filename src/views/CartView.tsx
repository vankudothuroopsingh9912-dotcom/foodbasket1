import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Coupon } from '../types/index.ts';
import {
  ShoppingBasket,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTotalCount,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    couponDiscount,
    applyCouponCode,
    removeCoupon,
    navigateTo,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);

  useEffect(() => {
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => setCouponsList(data.coupons || []))
      .catch((err) => console.error(err));
  }, []);

  const freeDeliveryThreshold = 299;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0 ? 0 : 30;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const tax = Math.round((cartSubtotal - couponDiscount) * 0.05);
  const total = Math.max(0, cartSubtotal - couponDiscount + deliveryFee + tax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim());
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBasket className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your basket is empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Explore our aisles for crisp apples, fresh milk, daily veggies, and artisanal breads!
        </p>
        <button
          onClick={() => navigateTo('products')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-colors shadow-md"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Shopping Basket ({cartTotalCount} items)
      </h1>
      <p className="text-xs text-slate-500 mb-8">
        Review your items, apply discount coupons, and proceed to seamless express delivery.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          {/* Free delivery banner */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs">
            {remainingForFreeDelivery > 0 ? (
              <div className="flex justify-between items-center text-emerald-900 font-semibold">
                <span>Add ₹{remainingForFreeDelivery} more for <strong>FREE Delivery</strong>!</span>
                <span>₹{cartSubtotal} / ₹{freeDeliveryThreshold}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You've unlocked FREE Express Delivery on this basket!</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.productId} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{item.product.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {item.product.unit} • ₹{item.product.price}
                    </p>
                    <span className="font-black text-slate-900 text-xs block mt-1">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bill Details & Coupons (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
            Payment Summary
          </h3>

          {/* Coupon */}
          <div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <span>Coupon '{appliedCoupon.code}' applied</span>
                  <span className="text-emerald-700 font-black">(-₹{couponDiscount})</span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-rose-600 font-semibold hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. FRESH10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 uppercase font-semibold"
                  />
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {!appliedCoupon && couponsList.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {couponsList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => applyCouponCode(c.code)}
                    className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    {c.code} ({c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'} off)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (GST 5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-lg text-emerald-800">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
