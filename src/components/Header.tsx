import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShoppingBasket,
  Search,
  Heart,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Package,
  Layers,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import type { Category } from '../types/index.ts';

export const Header: React.FC = () => {
  const {
    navigateTo,
    currentView,
    cartTotalCount,
    cartSubtotal,
    setIsCartDrawerOpen,
    wishlist,
    user,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
    deliveryLocation,
    setIsLocationModalOpen,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('products', { search: searchQuery.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner / Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Flash Deal
            </span>
            <span>Get 10% OFF on all fresh fruits & veggies! Use code: <strong className="text-emerald-200">FRESH10</strong></span>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="hidden md:inline">Free Delivery on orders above ₹299</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-emerald-100">
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">24x7 Support: 1800-419-BASKET</span>
            </button>
            {user?.role === 'admin' ? (
              <button
                onClick={() => navigateTo('admin')}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBasket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 font-sans">
                  Food<span className="text-emerald-600">Basket</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-wider font-semibold text-emerald-700 uppercase -mt-1">
                  100% Farm Fresh
                </span>
              </div>
            </button>

            {/* Delivery Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  Deliver in 25 mins
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="font-semibold text-slate-800 max-w-[130px] truncate">
                  {deliveryLocation.area}, {deliveryLocation.pincode}
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search fresh fruits, veggies, milk, snacks, atta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-11 pr-24 py-2.5 rounded-full border border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => navigateTo('wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-full font-semibold text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-95"
            >
              <div className="relative">
                <ShoppingBasket className="w-5 h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div>{cartTotalCount} items</div>
                <div className="font-bold text-emerald-100">₹{cartSubtotal}</div>
              </div>
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="hidden md:inline w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {user && isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-emerald-700 font-medium truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigateTo('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Account & Addresses
                      </button>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigateTo('order-history');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        Order History & Tracking
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            navigateTo('admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-amber-800 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search groceries, fruits, veggies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 text-sm pl-10 pr-20 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Quick Navigation Bar */}
      <div className="bg-emerald-50/50 border-t border-b border-emerald-100/60 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 overflow-x-auto py-2 no-scrollbar text-xs font-semibold text-slate-700">
            <button
              onClick={() => navigateTo('products')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                currentView === 'products' ? 'bg-emerald-700 text-white' : 'hover:text-emerald-700 hover:bg-emerald-100/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateTo('products', { category: cat.id })}
                className="hover:text-emerald-700 whitespace-nowrap px-2.5 py-1 rounded-full hover:bg-emerald-100/50 transition-colors"
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => navigateTo('products', { isDailyDeal: 'true' })}
              className="flex items-center gap-1 text-amber-700 font-bold px-2.5 py-1 rounded-full hover:bg-amber-100/60 whitespace-nowrap transition-colors ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Special Deals
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-slate-700"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Deliver to: {deliveryLocation.area} ({deliveryLocation.pincode})</span>
            </button>
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Browse Categories</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('products');
              }}
              className="text-left p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold"
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('products', { category: cat.id });
                }}
                className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium truncate"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('order-history');
              }}
              className="text-left py-1 text-slate-600 hover:text-emerald-700"
            >
              Track Orders
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('about');
              }}
              className="text-left py-1 text-slate-600 hover:text-emerald-700"
            >
              About Food Basket
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('contact');
              }}
              className="text-left py-1 text-slate-600 hover:text-emerald-700"
            >
              Customer Care & FAQs
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
