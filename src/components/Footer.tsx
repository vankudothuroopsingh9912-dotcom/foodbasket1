import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShoppingBasket,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Send,
  Heart,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setSubscribed(true);
      showToast('Thank you for subscribing! Check your inbox for ₹50 off coupon.', 'success');
      setNewsletterEmail('');
    } else {
      showToast('Please enter a valid email address', 'error');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-emerald-950">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Farm Fresh</h4>
              <p className="text-xs text-slate-400">Hand-sorted daily from verified local farms</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express 30-Min Delivery</h4>
              <p className="text-xs text-slate-400">Real-time GPS tracking to your doorstep</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">No-Questions Return</h4>
              <p className="text-xs text-slate-400">Instant doorstep return or 100% refund</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Razorpay Payments</h4>
              <p className="text-xs text-slate-400">Encrypted UPI, Cards, NetBanking & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white">
                <ShoppingBasket className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Food<span className="text-emerald-400">Basket</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Food Basket is India’s premier fresh grocery delivery platform. From morning farm-plucked apples and leafy spinach to stone-ground atta and cold-pressed juices, we bring nature’s bounty to your kitchen with zero compromise on quality.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Get Weekly Farm Deals & Secret Coupons
              </h5>
              {subscribed ? (
                <div className="bg-emerald-950/80 border border-emerald-700/60 p-3 rounded-xl text-xs text-emerald-300">
                  🎉 You are subscribed! Check your email for code <strong>WELCOME50</strong>.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-slate-800 text-white placeholder-slate-500 text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Join</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Popular Aisles</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-fruits' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Fresh Fruits & Berries
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-veggies' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Daily Green Vegetables
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-dairy' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Dairy, Milk & Farm Eggs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-staples' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Basmati Rice & Atta
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-bakery' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Artisanal Sourdough & Breads
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { category: 'cat-organic' })}
                  className="hover:text-emerald-400 transition-colors"
                >
                  100% Certified Organics
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Information */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Customer Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('order-history')} className="hover:text-emerald-400 transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('faq')} className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-emerald-400 transition-colors">
                  Contact Us & Grievances
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('refund-policy')} className="hover:text-emerald-400 transition-colors">
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-emerald-400 transition-colors">
                  Privacy Policy & Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-wide">Get in Touch</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Food Basket Fulfillment Center #4, Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1800-419-BASKET (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@foodbasket.com</span>
              </div>
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-1">Accepted Payment Partners</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">Razorpay</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">UPI / GPay</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">RuPay</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">Visa / Master</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © {new Date().getFullYear()} Food Basket Grocery Technologies Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for fresh & wholesome living</span>
        </div>
      </div>
    </footer>
  );
};
