import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { wishlist, products } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">My Wishlist</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {wishlistedProducts.length} saved pieces awaiting your adornment.
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Heart className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h2 className="font-serif text-2xl text-stone-900 font-medium">
            Save your favorite pieces here.
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Tap the heart icon on any jewelry piece while browsing to curate your personal wishlist.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors"
          >
            Explore Jewelry Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};
