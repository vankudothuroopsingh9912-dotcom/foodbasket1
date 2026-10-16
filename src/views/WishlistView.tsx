import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, addToCart, navigateTo, showToast } = useApp();

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => {
      addToCart(p, 1);
    });
    showToast(`Moved ${wishlist.length} items to your basket!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>My Wishlist ({wishlist.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            Saved fresh fruits, daily dairy, and favorite organic pantry items
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Basket</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mb-6">
            Tap the heart icon on any crisp vegetable or seasonal fruit to save it for later.
          </p>
          <button
            onClick={() => navigateTo('products')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md"
          >
            Explore Groceries
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
