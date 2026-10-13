import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Droplets,
  Award,
  Sparkles,
  ArrowRight,
  ZoomIn,
} from 'lucide-react';
import { Product, Review } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const { products, addToCart, toggleWishlist, isInWishlist, settings, showToast, setIsCartOpen } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'shipping'>('desc');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // New review form
  const [rating, setRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerEmail, setReviewerEmail] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const found = products.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      setSelectedImage(0);
      setSelectedColor(found.color);
      setSelectedSize(found.size || '');
      setQuantity(1);
      // Fetch reviews
      fetch(`/api/reviews?productId=${found.id}`)
        .then((res) => res.json())
        .then((data) => setReviews(data))
        .catch(console.error);
    }
  }, [slug, products]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Product not found</h2>
        <p className="text-xs text-stone-500">The requested jewelry piece may be retired or unavailable.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice || product.price;
  const discountPercent =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Please enter your name and review message');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewerName.trim(),
          customerEmail: reviewerEmail.trim(),
          rating,
          comment: reviewComment.trim(),
        }),
      });

      if (res.ok) {
        const newRev = await res.json();
        setReviews([newRev, ...reviews]);
        showToast('Thank you! Your verified review has been published.');
        setReviewerName('');
        setReviewerEmail('');
        setReviewComment('');
      } else {
        showToast('Failed to post review. Please try again.');
      }
    } catch {
      showToast('An error occurred. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400">
        <button onClick={() => navigate('/')} className="hover:text-stone-800">
          Home
        </button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/shop')} className="hover:text-stone-800">
          Shop
        </button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-stone-800 capitalize">
          {product.category}
        </button>
        <span className="mx-2">/</span>
        <span className="text-stone-800 truncate">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[1/1] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-stone-200/80 group">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-md backdrop-blur-sm transition-all"
              aria-label="Zoom image"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {product.isAntiTarnish && (
              <div className="absolute top-4 left-4 bg-[#1C1917]/90 text-white text-xs font-semibold px-3 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Anti-Tarnish Guarantee</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx ? 'border-stone-900 shadow-sm' : 'border-stone-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & Sticky Purchase Module (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3 pb-6 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
                {product.collection || 'Zariya Luxe Collection'}
              </span>
              <span className="text-xs text-stone-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium leading-snug">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'stroke-current fill-none'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800 tabular-nums">{product.rating}</span>
              <span className="text-xs text-stone-400">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-semibold text-stone-950 tabular-nums">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-base text-stone-400 line-through tabular-nums">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold bg-[#8C6D46] text-white px-2 py-0.5 rounded">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Stock Alert */}
            <div className="pt-1">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <p className="text-xs text-amber-700 font-medium">
                    ⚡ Hurry! Only {product.stock} pieces remaining in stock.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock — Ready for Same-Day Dispatch</span>
                  </p>
                )
              ) : (
                <p className="text-xs text-red-600 font-semibold">Currently Out of Stock</p>
              )}
            </div>
          </div>

          {/* Variants: Color & Size */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block mb-2">
                Color / Finish: <span className="font-normal text-stone-900">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {[product.color, 'Silver / Rhodium'].filter(Boolean).map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      selectedColor === col
                        ? 'border-stone-900 bg-stone-900 text-white font-medium'
                        : 'border-stone-300 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {product.size && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 block mb-2">
                  Dimensions / Sizing: <span className="font-normal text-stone-900">{selectedSize}</span>
                </label>
                <div className="inline-block px-3 py-1.5 text-xs rounded bg-stone-100 text-stone-800 border border-stone-200">
                  {product.size}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-lg px-2 py-2.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-stone-600 hover:text-stone-900"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold tabular-nums text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1 text-stone-600 hover:text-stone-900"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  wishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 text-stone-600 hover:text-stone-900'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-3 px-6 bg-[#D4AF37] hover:bg-[#C29D2F] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Instant Buy with Cash on Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Value props */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8C6D46]" />
              <span>COD Available Across Pakistan</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#8C6D46]" />
              <span>100% Shower & Sweatproof</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#8C6D46]" />
              <span>7-Day Easy Exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#8C6D46]" />
              <span>Velvet Luxury Box Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="pt-8 border-t border-stone-200">
        <div className="flex border-b border-stone-200 overflow-x-auto gap-8">
          {[
            { id: 'desc', label: 'Description & Styling' },
            { id: 'specs', label: 'Specifications' },
            { id: 'care', label: 'Anti-Tarnish Care Guide' },
            { id: 'shipping', label: 'Shipping & Exchanges' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-4xl text-xs sm:text-sm text-stone-700 leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-2 mt-4">
                <h4 className="font-serif text-base text-stone-900 font-medium">How To Style</h4>
                <p className="text-xs text-stone-600">
                  Pair this standalone piece with a crisp white button-down for day chic, or stack with complementary chains and earrings for evening weddings and dinners.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-stone-50 rounded-lg flex justify-between border border-stone-200/60">
                  <span className="font-medium text-stone-500">{key}:</span>
                  <span className="font-semibold text-stone-900">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4">
              <p>{product.careInstructions}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <h5 className="font-semibold text-stone-900 text-xs">Shower & Gym Safe</h5>
                  <p className="text-xs text-stone-500">
                    Our 18k PVD vacuum plating is molecularly bonded. Water and sweat won't cause tarnishing.
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <h5 className="font-semibold text-stone-900 text-xs">Perfumes & Lotions</h5>
                  <p className="text-xs text-stone-500">
                    Apply perfumes and body sprays before putting on organic pearls to protect delicate luster.
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <h5 className="font-semibold text-stone-900 text-xs">Storage</h5>
                  <p className="text-xs text-stone-500">
                    Keep inside our signature velvet pouch when not in use to avoid accidental scratching.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>
                <strong>Delivery Timeline:</strong> Major cities (Karachi, Lahore, Islamabad, Rawalpindi) arrive within 2–4 business days via TCS & Trax Express. Other cities take 3–5 days.
              </p>
              <p>
                <strong>Free Delivery:</strong> Orders over Rs. {settings?.freeShippingThreshold.toLocaleString() || '3,000'} qualify for complimentary free delivery.
              </p>
              <p>
                <strong>Cash on Delivery (COD):</strong> Available nationwide. You can pay cash upon receiving the package.
              </p>
              <p>
                <strong>7-Day Exchange Policy:</strong> If sizing doesn't fit or you wish to exchange, contact our WhatsApp concierge within 7 days of delivery.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Submission */}
      <section className="pt-12 border-t border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-stone-900 font-medium">Customer Reviews</h3>
            <p className="text-xs text-stone-500 mt-1">
              Read verified testimonials or share your experience with this design.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-stone-900 tabular-nums">{product.rating}</span>
            <span className="text-xs text-stone-500">({reviews.length} reviews)</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 bg-white rounded-xl border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900">{rev.customerName}</span>
                <span className="text-[11px] text-stone-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'stroke-current fill-none'}`}
                    />
                  ))}
                </div>
                {rev.isVerifiedPurchase && (
                  <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>

        {/* Review Submission Form */}
        <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-stone-200/80 max-w-2xl">
          <h4 className="font-serif text-lg text-stone-900 font-medium mb-1">Leave A Review</h4>
          <p className="text-xs text-stone-500 mb-4">
            Only genuine feedback is published to help other women shop confidently.
          </p>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Your Rating</label>
              <div className="flex gap-1 text-amber-400 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'stroke-current fill-none'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Maham Tariq"
                  className="w-full bg-white border border-stone-300 text-xs rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white border border-stone-300 text-xs rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Your Review *</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience regarding the quality, anti-tarnish shine, and delivery..."
                className="w-full bg-white border border-stone-300 text-xs rounded-lg p-3 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-stone-900 font-medium">You May Also Admire</h3>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46] hover:text-stone-900"
            >
              View More
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomOpen(false)}
        >
          <img
            src={product.images[selectedImage] || product.images[0]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
