import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface QuickViewModalProps {
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ navigate }) => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const wishlisted = isInWishlist(product.id);
  const price = product.salePrice || product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuickViewProduct(null);
  };

  const handleViewFullDetails = () => {
    setQuickViewProduct(null);
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 bg-white/80 rounded-full backdrop-blur-sm shadow-sm"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="bg-[#FAF8F5] p-6 flex flex-col justify-between">
            <div className="aspect-square rounded-xl overflow-hidden bg-white border border-stone-200">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                      selectedImageIndex === idx ? 'border-stone-900' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-widest text-[#8C6D46] font-semibold text-[11px]">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-stone-800 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-stone-400 font-normal">({product.reviewCount})</span>
                </div>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-medium leading-snug">
                {product.name}
              </h3>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-stone-950 tabular-nums">
                  Rs. {price.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-stone-400 line-through tabular-nums">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
                {product.isAntiTarnish && (
                  <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Anti-Tarnish Certified
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mt-4 line-clamp-3">
                {product.description}
              </p>

              {/* Specs pill preview */}
              <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Material</span>
                  <span className="font-medium text-stone-900">{product.material}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Color / Finish</span>
                  <span className="font-medium text-stone-900">{product.color}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded px-2 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-1 text-stone-600 hover:text-stone-900"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-1 text-stone-600 hover:text-stone-900"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded border border-stone-300 transition-colors ${
                    wishlisted ? 'text-rose-600 border-rose-300 bg-rose-50' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleViewFullDetails}
                className="w-full text-center text-xs font-semibold text-[#8C6D46] hover:text-stone-900 flex items-center justify-center gap-1 py-1 transition-colors"
              >
                <span>View Full Product Specifications & Care Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
