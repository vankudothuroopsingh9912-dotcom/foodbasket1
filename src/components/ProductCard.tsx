import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { Product } from '../types/index.ts';
import { Heart, Plus, Minus, Eye, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const {
    navigateTo,
    cart,
    addToCart,
    updateCartQuantity,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useApp();

  const cartItem = cart.find((item) => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleCardClick = () => {
    navigateTo('product-detail', { id: product.id });
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setQuickViewProduct(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart < product.stock) {
      updateCartQuantity(product.id, quantityInCart + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, quantityInCart - 1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400/80 shadow-xs hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Badges & Actions */}
      <div className="relative pt-[80%] bg-slate-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isOrganic && (
            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              Organic
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 shadow-xs'
                : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white shadow-xs'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleOpenQuickView}
            className="w-8 h-8 rounded-full bg-white/90 text-slate-500 hover:text-emerald-700 hover:bg-white shadow-xs flex items-center justify-center transition-all"
            title="Quick Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unit & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600">
              {product.unit}
            </span>
            <div className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors mb-1">
            {product.name}
          </h3>

          {/* Subcategory / Origin */}
          <p className="text-[11px] text-slate-400 truncate mb-2">
            {product.origin ? `From ${product.origin}` : product.subcategory}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {product.stock <= 10 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-amber-700 block">
                Only {product.stock} left!
              </span>
            )}
          </div>

          {/* Cart Quantity Stepper / Add Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantityInCart === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden"
            >
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 transition-colors active:bg-emerald-900"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-extrabold">{quantityInCart}</span>
              <button
                onClick={handleIncrement}
                disabled={quantityInCart >= product.stock}
                className={`w-7 h-7 flex items-center justify-center hover:bg-emerald-800 transition-colors active:bg-emerald-900 ${
                  quantityInCart >= product.stock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
