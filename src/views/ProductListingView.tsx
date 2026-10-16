import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import type { Product, Category } from '../types/index.ts';
import {
  SlidersHorizontal,
  Grid,
  List as ListIcon,
  Search,
  X,
  Star,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ProductListingView: React.FC = () => {
  const { viewParams, navigateTo, searchQuery, setSearchQuery } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(viewParams.category || 'all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category or search query from viewParams
  useEffect(() => {
    if (viewParams.category) {
      setSelectedCategory(viewParams.category);
    }
    if (viewParams.search) {
      setSearchQuery(viewParams.search);
    }
  }, [viewParams]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch filtered products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    if (minPrice > 0) {
      params.append('minPrice', String(minPrice));
    }
    if (maxPrice < 500) {
      params.append('maxPrice', String(maxPrice));
    }
    if (minRating > 0) {
      params.append('rating', String(minRating));
    }
    if (inStockOnly) {
      params.append('inStock', 'true');
    }
    if (organicOnly) {
      params.append('isOrganic', 'true');
    }
    if (sortOption !== 'featured') {
      params.append('sort', sortOption);
    }

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery, minPrice, maxPrice, minRating, inStockOnly, organicOnly, sortOption]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(500);
    setMinRating(0);
    setInStockOnly(false);
    setOrganicOnly(false);
    setSortOption('featured');
    setSearchQuery('');
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={() => navigateTo('home')} className="hover:text-emerald-700">
              Home
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {activeCategoryObj ? activeCategoryObj.name : 'All Grocery Aisles'}
            </span>
            {searchQuery && (
              <>
                <span>/</span>
                <span className="text-emerald-700 font-bold">Search: "{searchQuery}"</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeCategoryObj ? activeCategoryObj.name : searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Fresh Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} farm-fresh items ready for dispatch
          </p>
        </div>

        {/* Toolbar: Sort & View Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured / Best Match</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Refine Produce</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 uppercase tracking-wider">
              Aisles & Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-[10px] ${selectedCategory === cat.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {cat.itemCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-black text-emerald-800">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={30}
              max={500}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹30</span>
              <span>₹250</span>
              <span>₹500</span>
            </div>
          </div>

          {/* Rating */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 uppercase tracking-wider">Customer Rating</h4>
            <div className="space-y-1.5 text-xs">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? 0 : r)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg border transition-all flex items-center justify-between ${
                    minRating === r ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: r }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span>{r}★ & above</span>
                  </div>
                  {minRating === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes: In Stock & Organic */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In-Stock Items Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>100% Certified Organic Only</span>
              </span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS FEED */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No grocery items found</h3>
              <p className="text-xs text-slate-500 mb-6">
                Try widening your price filters, selecting another category, or searching for staples like "Apples", "Milk", or "Atta".
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigateTo('product-detail', { id: product.id })}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 flex items-center gap-4 transition-all cursor-pointer shadow-xs"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-600">
                      {product.unit}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 mb-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">{product.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end">
          <div className="fixed inset-0" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 z-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Filter Groceries</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Categories</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-2 rounded-xl text-left ${selectedCategory === 'all' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50 text-slate-700'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`p-2 rounded-xl text-left truncate ${selectedCategory === c.id ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
