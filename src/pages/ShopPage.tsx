import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Search, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
  initialSearch?: string;
  initialCollection?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  navigate,
  initialCategory,
  initialSearch,
  initialCollection,
}) => {
  const { products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [antiTarnishOnly, setAntiTarnishOnly] = useState<boolean>(
    initialCollection === 'anti-tarnish' || false
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCollection === 'anti-tarnish') setAntiTarnishOnly(true);
  }, [initialCategory, initialSearch, initialCollection]);

  const materialsList = [
    { label: 'All Materials', value: 'all' },
    { label: '18K Gold PVD Stainless Steel', value: 'stainless steel' },
    { label: 'Freshwater Baroque Pearl', value: 'pearl' },
    { label: 'AAAAA Cubic Zirconia', value: 'zirconia' },
    { label: 'Titanium Steel', value: 'titanium' },
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category
      if (selectedCategory !== 'all' && prod.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Anti-Tarnish
      if (antiTarnishOnly && !prod.isAntiTarnish) {
        return false;
      }

      // Material
      if (selectedMaterial !== 'all' && !prod.material.toLowerCase().includes(selectedMaterial.toLowerCase())) {
        return false;
      }

      // In stock
      if (inStockOnly && prod.stock <= 0) {
        return false;
      }

      // Price Range
      const effectivePrice = prod.salePrice || prod.price;
      if (priceRange === 'under-1500' && effectivePrice >= 1500) return false;
      if (priceRange === '1500-2500' && (effectivePrice < 1500 || effectivePrice > 2500)) return false;
      if (priceRange === '2500-4000' && (effectivePrice < 2500 || effectivePrice > 4000)) return false;
      if (priceRange === 'above-4000' && effectivePrice <= 4000) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesCat = prod.category.toLowerCase().includes(q);
        const matchesTag = prod.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesTag) return false;
      }

      return true;
    });
  }, [products, selectedCategory, antiTarnishOnly, selectedMaterial, priceRange, searchQuery, inStockOnly]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'bestseller') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [filteredProducts, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setAntiTarnishOnly(false);
    setSelectedMaterial('all');
    setPriceRange('all');
    setSearchQuery('');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    antiTarnishOnly ||
    selectedMaterial !== 'all' ||
    priceRange !== 'all' ||
    Boolean(searchQuery.trim()) ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <nav className="text-xs text-stone-400 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-stone-800">
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Shop Catalog</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">
              {selectedCategory !== 'all'
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection`
                : antiTarnishOnly
                ? 'Anti-Tarnish Jewelry'
                : 'All Jewelry & Accessories'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Showing {sortedProducts.length} of {products.length} elegant handcrafted designs
            </p>
          </div>

          {/* Quick Search & Sort on Desktop */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-60">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces..."
                className="w-full bg-white border border-stone-200 text-xs rounded-lg pl-9 pr-3 py-2 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-stone-200 text-xs rounded-lg pl-3 pr-8 py-2 text-stone-900 focus:outline-none focus:border-stone-800 font-medium cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="bestseller">Sort: Best Sellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-xl border border-stone-200/80 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-serif text-lg font-medium text-stone-900">Refine By</h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#8C6D46] hover:text-stone-900 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Anti-Tarnish Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-lg border border-stone-200/80 cursor-pointer hover:border-stone-400 transition-colors">
              <input
                type="checkbox"
                checked={antiTarnishOnly}
                onChange={(e) => setAntiTarnishOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Anti-Tarnish Only
                </span>
                <span className="text-[11px] text-stone-500 block">100% Waterproof & Non-Fading</span>
              </div>
            </label>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>All Jewelry</span>
                <span className="tabular-nums text-[11px] opacity-75">{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.slug).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="tabular-nums text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Presets */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Price Range
            </h4>
            <div className="space-y-1">
              {[
                { label: 'All Prices', value: 'all' },
                { label: 'Under Rs. 1,500', value: 'under-1500' },
                { label: 'Rs. 1,500 – Rs. 2,500', value: '1500-2500' },
                { label: 'Rs. 2,500 – Rs. 4,000', value: '2500-4000' },
                { label: 'Rs. 4,000 & Above', value: 'above-4000' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(range.value)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                    priceRange === range.value
                      ? 'bg-stone-100 font-semibold text-stone-950'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Material & Metal
            </h4>
            <div className="space-y-1">
              {materialsList.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMaterial(m.value)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors truncate ${
                    selectedMaterial === m.value
                      ? 'bg-stone-100 font-semibold text-stone-950'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only */}
          <div className="pt-4 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>In-Stock Ready to Ship</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-8 h-8 stroke-[1.2]" />
              </div>
              <h3 className="font-serif text-xl text-stone-900 font-medium">
                We couldn't find what you're looking for.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No jewelry matching your current combination of filters was found. Try removing filters or searching a different term.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-stone-900 text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {sortedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 flex">
          <div className="w-4/5 max-w-xs bg-white h-full flex flex-col justify-between p-6 shadow-2xl">
            <div className="overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <h3 className="font-serif text-lg font-medium text-stone-900">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Anti-Tarnish */}
              <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={antiTarnishOnly}
                  onChange={(e) => setAntiTarnishOnly(e.target.checked)}
                  className="rounded w-4 h-4 text-stone-900"
                />
                <span className="text-xs font-semibold text-stone-900">Anti-Tarnish Only</span>
              </label>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-semibold text-stone-400">Categories</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                      selectedCategory === 'all' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700'
                    }`}
                  >
                    All Jewelry
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                        selectedCategory === cat.slug ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-semibold text-stone-400">Price</span>
                <div className="space-y-1">
                  {[
                    { label: 'All Prices', value: 'all' },
                    { label: 'Under Rs. 1,500', value: 'under-1500' },
                    { label: 'Rs. 1,500 – Rs. 2,500', value: '1500-2500' },
                    { label: 'Rs. 2,500 – Rs. 4,000', value: '2500-4000' },
                    { label: 'Rs. 4,000 & Above', value: 'above-4000' },
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value)}
                      className={`w-full text-left text-xs py-1 px-2 rounded ${
                        priceRange === range.value ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded"
              >
                Apply ({sortedProducts.length})
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)} />
        </div>
      )}
    </div>
  );
};
