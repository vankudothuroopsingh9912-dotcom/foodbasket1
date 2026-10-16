import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import type { Product, Category } from '../types/index.ts';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Clock,
  Tag,
  Star,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigateTo, applyCouponCode } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dailyDeals, setDailyDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products/featured').then((res) => res.json()),
      fetch('/api/products/daily-deals').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([featData, dealsData, catData]) => {
        setFeaturedProducts(featData.products || []);
        setDailyDeals(dealsData.products || []);
        setCategories(catData.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load home data', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl shadow-emerald-950/20">
        {/* Background decorative shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/60 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Farm-Fresh Harvest Guaranteed</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Fresh Groceries, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-amber-300">
                Delivered to Your Doorstep
              </span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl leading-relaxed">
              Experience hand-picked seasonal fruits, crisp organic greens, pure dairy, stone-ground chakki flours, and gourmet pantry staples delivered in as fast as 25 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigateTo('products')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 group active:scale-95"
              >
                <span>Shop Fresh Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigateTo('products', { isDailyDeal: 'true' })}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-white/20 transition-all backdrop-blur-xs flex items-center gap-2"
              >
                <span>Explore Daily Deals</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-emerald-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-100">25 Min Express</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-100">No Preservatives</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-100">Safe Payments</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh Grocery Basket"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-100 text-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Special Introductory Offer
                    </span>
                    <p className="text-xs font-black text-slate-900">
                      Use code <strong>WELCOME50</strong> for ₹50 OFF
                    </p>
                  </div>
                  <button
                    onClick={() => applyCouponCode('WELCOME50')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aisle Navigation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigateTo('products')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>See All Aisles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateTo('products', { category: cat.id })}
                className="group text-left bg-white rounded-2xl border border-slate-200/70 hover:border-emerald-400 p-3 shadow-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cat.itemCount} items available
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* DAILY DEALS & FLASH OFFERS */}
      <section className="bg-amber-500/10 border-y border-amber-200/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>Limited Time Deals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daily Fresh Deals & Mega Discounts
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Prices refresh in: <strong className="text-slate-900">08h : 34m : 12s</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {dailyDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FRESH PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Hand-Picked Freshness</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Farm Produce & Kitchen Staples
            </h2>
          </div>
          <button
            onClick={() => navigateTo('products')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>Browse All {featuredProducts.length}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* PROMOTIONAL COUPON BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Exclusive Basket Discount
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Save Flat 20% on Your Monthly Grocery Haul
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
              Stock up on premium Basmati rice, chakki fresh whole wheat atta, organic toor dal, and cold-pressed oils.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold mb-1">
              Use Coupon Code
            </p>
            <div className="bg-white text-emerald-900 font-black text-lg px-4 py-2 rounded-xl mb-2 tracking-widest border border-dashed border-emerald-400">
              SUPER20
            </div>
            <button
              onClick={() => {
                applyCouponCode('SUPER20');
                navigateTo('products');
              }}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-2 rounded-xl transition-colors"
            >
              Copy & Shop
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE FOOD BASKET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Why Shop with Food Basket?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            We operate direct farm-to-table networks to cut middlemen, maintain maximum freshness, and deliver unbeatable prices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Direct from Farmers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every apple, tomato, and bunch of spinach is sourced within 24 hours of harvest for unbeatable flavor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Hyperlocal 25-Min Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our neighborhood cold-chain fulfillment hubs ensure milk, eggs, and bread stay at peak chilled condition.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Razorpay Test & Live Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pay seamlessly using UPI, credit/debit cards, net banking, or choose Cash on Delivery at your doorstep.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Guaranteed Wholesale Rates</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Save more every single day with verified low prices, bundle combo discounts, and seasonal coupons.
            </p>
          </div>
        </div>
      </section>

      {/* VERIFIED CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Loved by Over 50,000+ Happy Households
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real feedback from verified Food Basket shoppers across Bangalore and major hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "The Kashmiri apples and organic spinach were as crisp as if I had picked them from an orchard myself. Delivered in 20 minutes flat. Best grocery app in town!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                AS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Aarav Sharma</h4>
                <p className="text-[10px] text-slate-400">Indiranagar • Verified Order</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "The milk was genuinely ice-cold on arrival, and the sourdough bread made our Sunday breakfast extraordinary. Live status updates on map were spot on."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                PR
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pooja Reddy</h4>
                <p className="text-[10px] text-slate-400">Koramangala • Verified Order</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "Smooth Razorpay checkout and applied WELCOME50 for ₹50 off instantly. The packaging was completely plastic-free and reusable!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                VK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Vikram Kulkarni</h4>
                <p className="text-[10px] text-slate-400">HSR Layout • Verified Order</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
