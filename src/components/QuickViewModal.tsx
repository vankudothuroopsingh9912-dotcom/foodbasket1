import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Star, Plus, Minus, ShoppingBasket, Sparkles, Check, Truck } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, navigateTo } = useApp();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [qty, setQty] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    setQuickViewProduct(null);
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/60 shadow-xs mb-4">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage > 0 && (
                <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector if multi-image */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIdx === i ? 'border-emerald-600 scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {product.unit}
                </span>
                {product.isOrganic && (
                  <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    100% Organic
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-tight mb-2">
                {product.name}
              </h2>

              {/* Rating and review count */}
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span>({product.reviewCount} customer reviews)</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Express 25 mins
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-xs text-emerald-600 font-bold">Inclusive of all taxes</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Nutrition & Storage Highlights */}
              {product.nutritionalInfo && (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[11px] mb-4">
                  <span className="font-bold text-emerald-950 block mb-1">Nutritional Values (Approx):</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>Energy: <strong>{product.nutritionalInfo.calories}</strong></div>
                    <div>Protein: <strong>{product.nutritionalInfo.protein}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
                    disabled={qty >= product.stock}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
