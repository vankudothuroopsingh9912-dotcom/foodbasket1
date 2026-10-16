import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import type { Product, Review } from '../types/index.ts';
import {
  Star,
  Plus,
  Minus,
  ShoppingBasket,
  Heart,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Send,
  Leaf,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    viewParams,
    navigateTo,
    addToCart,
    toggleWishlist,
    isInWishlist,
    user,
    token,
    showToast,
    deliveryLocation,
  } = useApp();

  const productId = viewParams.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'storage' | 'reviews'>('desc');

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
          setSelectedImageIdx(0);
          setQty(1);
        }
      })
      .catch((err) => console.error(err));
  }, [productId]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading fresh product details...</p>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigateTo('checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please log in to leave a verified review', 'info');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      const data = await res.json();
      setSubmittingReview(false);
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setNewComment('');
        showToast('Review submitted successfully! Thank you for your feedback.');
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch {
      setSubmittingReview(false);
      showToast('Network error submitting review', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigateTo('home')} className="hover:text-emerald-700">Home</button>
        <span>/</span>
        <button onClick={() => navigateTo('products')} className="hover:text-emerald-700">Products</button>
        <span>/</span>
        <span className="font-semibold text-slate-800">{product.name}</span>
      </div>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
            <img
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                {product.discountPercentage}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIdx === i ? 'border-emerald-600 scale-105' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info and Purchase Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                {product.unit}
              </span>
              {product.isOrganic && (
                <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  100% Certified Organic
                </span>
              )}
              {product.isDailyDeal && (
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  Daily Deal
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & reviews count */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2.5">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg font-bold border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="font-semibold text-slate-700">
                {product.reviewCount} customer reviews
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">100% Quality Checked</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-bold">
                (Save ₹{product.originalPrice - product.price})
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Inclusive of all taxes</span>
          </div>

          {/* Delivery Estimate */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">
                  Delivering to {deliveryLocation.area} ({deliveryLocation.pincode})
                </span>
                <span className="text-slate-500">Order now for delivery within 25 - 35 minutes!</span>
              </div>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black">{qty}</span>
                <button
                  onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
                  disabled={qty >= product.stock}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {product.stock <= 10 && product.stock > 0 && (
                <span className="text-xs font-bold text-amber-700">
                  Hurry! Only {product.stock} units left in stock.
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <ShoppingBasket className="w-5 h-5" />
                <span>Add to Basket</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span>100% Fresh & Authentic</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span>Doorstep Replacement</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span>Safe Contactless Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Nutrition, Storage, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex border-b border-slate-100 mb-6 gap-6 text-sm font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'desc'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'nutrition'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Nutrition & Origin
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-3 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'storage'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Storage & Shelf Life
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            <p>{product.description}</p>
            <p>
              Every harvest of <strong>{product.name}</strong> undergoes rigorous microbiological, cleanliness, and freshness checks before arriving at your home in breathable biodegradable packaging.
            </p>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-4 max-w-xl text-xs sm:text-sm text-slate-700">
            {product.nutritionalInfo ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 font-bold text-slate-900">
                  Approximate Value per 100g / Serving
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Energy</span>
                  <span className="font-semibold">{product.nutritionalInfo.calories}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Protein</span>
                  <span className="font-semibold">{product.nutritionalInfo.protein}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Carbohydrates</span>
                  <span className="font-semibold">{product.nutritionalInfo.carbs}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Total Fat</span>
                  <span className="font-semibold">{product.nutritionalInfo.fat}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Nutritional values are verified and comply with FSSAI regulations.</p>
            )}
            {product.origin && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <strong>Source Farm Location:</strong> {product.origin}
              </div>
            )}
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 max-w-xl">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-slate-900 mb-1">Storage Instructions:</strong>
              <span>{product.storageInstructions || 'Store in a cool, ventilated dry area.'}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="block text-slate-900 mb-1">Guaranteed Fresh Shelf Life:</strong>
              <span>{product.shelfLife || 'Best consumed within 5 days of delivery.'}</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review */}
            <div className="pt-6 border-t border-slate-100 max-w-lg">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Write a Customer Review</h4>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewRating(s)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          newRating >= s ? 'text-amber-500 border-amber-300 bg-amber-50' : 'text-slate-300 border-slate-200'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the freshness, flavor, and delivery..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Post Verified Review'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
