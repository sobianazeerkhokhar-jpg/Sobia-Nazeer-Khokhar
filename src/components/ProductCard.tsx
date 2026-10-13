import React from 'react';
import { Heart, Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();
  const wishlisted = isInWishlist(product.id);

  const discountPercent =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col bg-white border border-[#EBE6DE] rounded-xl overflow-hidden hover:border-[#D6CEBF] transition-all duration-300 hover:shadow-md">
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#F6F4EF]">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Anti-Tarnish / Discount markers (Refined, no ugly candy pills) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isAntiTarnish && (
            <span className="bg-[#1C1917]/90 text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              Anti-Tarnish
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#8C6D46] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow'
              : 'bg-white/85 text-stone-700 hover:text-stone-950 hover:bg-white shadow-sm'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden sm:flex">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="flex-1 py-2 bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold rounded shadow-md flex items-center justify-center gap-1.5 backdrop-blur-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>Quick View</span>
          </button>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded shadow-md flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Add to cart directly"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#EBDBC9]" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="uppercase tracking-wider text-[11px] font-medium text-[#8C6D46]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-stone-700 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums text-[11px]">{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="text-sm font-medium text-stone-900 hover:text-[#8C6D46] cursor-pointer line-clamp-2 transition-colors"
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing & Stock Indicator */}
        <div className="flex items-end justify-between pt-1 border-t border-stone-100">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-semibold text-stone-950 tabular-nums">
                Rs. {(product.salePrice || product.price).toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[11px] text-amber-700 font-medium">
                Only {product.stock} pieces left
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-[11px] text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Mobile Direct Add Button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="sm:hidden p-2 bg-stone-900 text-white rounded-md text-xs disabled:opacity-40"
            aria-label="Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
