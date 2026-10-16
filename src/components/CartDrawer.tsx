import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Coupon } from '../types/index.ts';
import {
  X,
  ShoppingBasket,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTotalCount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
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
      .catch((err) => console.error('Failed to load coupons', err));
  }, []);

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = 299;
  const deliveryFee = cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0 ? 0 : 30;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const tax = Math.round((cartSubtotal - couponDiscount) * 0.05);
  const total = Math.max(0, cartSubtotal - couponDiscount + deliveryFee + tax);

  const handleApplyCustomCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <ShoppingBasket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Your Grocery Basket</h3>
                <p className="text-xs text-slate-500">{cartTotalCount} items</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Goal Bar */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100/70 text-xs">
              {remainingForFreeDelivery > 0 ? (
                <>
                  <div className="flex justify-between items-center text-emerald-900 font-semibold mb-1.5">
                    <span>
                      Add <strong>₹{remainingForFreeDelivery}</strong> more for <strong>FREE Delivery</strong>!
                    </span>
                    <span>₹{cartSubtotal} / ₹{freeDeliveryThreshold}</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Yay! You've unlocked FREE Express Delivery on this order.</span>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <ShoppingBasket className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Your basket is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Fill your basket with crisp farm-fresh fruits, daily veggies, and fresh grocery essentials!
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('products');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors shadow-md shadow-emerald-700/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="pt-3.5 first:pt-0 flex gap-3 items-center">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-slate-500 mb-1">
                      {item.product.unit} • ₹{item.product.price}
                    </p>
                    <div className="text-xs font-black text-slate-800">
                      ₹{item.product.price * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Coupon Section & Price Breakdown (if not empty) */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/70 space-y-4">
              {/* Coupon Bar */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      <span>Coupon '{appliedCoupon.code}' applied</span>
                      <span className="text-emerald-700 font-black">(-₹{couponDiscount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCustomCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Have a coupon code? (e.g. FRESH10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 uppercase font-semibold"
                      />
                      <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Quick select coupons */}
                {!appliedCoupon && couponsList.length > 0 && (
                  <div className="mt-2 flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
                    {couponsList.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => applyCouponCode(c.code)}
                        className="text-[10px] bg-white border border-dashed border-emerald-400 text-emerald-800 font-bold px-2 py-1 rounded-lg shrink-0 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {c.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Basket Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-800">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (GST 5%)</span>
                  <span className="font-semibold text-slate-800">₹{tax}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-black text-slate-900">
                  <span>To Pay</span>
                  <span className="text-base text-emerald-800">₹{total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure 256-bit Encrypted Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
