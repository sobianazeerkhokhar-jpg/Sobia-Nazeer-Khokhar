import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, X, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { cartCount, wishlist, settings, user, setIsCartOpen, products } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  // Search suggestions
  const filteredSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.material.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Anti-Tarnish', path: '/shop?collection=anti-tarnish' },
    { label: 'New Arrivals', path: '/shop?sort=newest' },
    { label: 'Best Sellers', path: '/shop?sort=bestseller' },
    { label: 'Track Order', path: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
      {/* Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="bg-[#1C1917] text-[#FAF8F5] text-[12px] font-medium tracking-wide py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 text-center truncate flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{settings?.announcementText || 'Free Delivery on Orders Above Rs. 3,000 | Cash on Delivery Nationwide'}</span>
            </div>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="text-[#A8A29E] hover:text-white ml-2 text-xs p-1"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-stone-800 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-stone-400 rounded-md"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-left font-serif text-2xl sm:text-3xl tracking-[0.12em] font-medium text-stone-900 uppercase whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            {settings?.storeName || 'ZARIYA LUXE'}
          </button>
        </div>

        {/* Zone 2: Clean 4-5 Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium tracking-wider uppercase text-stone-600">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                currentPath === link.path ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              {link.label}
              {currentPath === link.path && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-stone-700 hover:text-stone-950 transition-colors rounded-full hover:bg-stone-100/60"
            aria-label="Search jewelry catalog"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="p-2 text-stone-700 hover:text-stone-950 transition-colors rounded-full hover:bg-stone-100/60 relative hidden sm:block"
            aria-label="View saved pieces"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C6D46] text-white text-[10px] font-semibold flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Customer / Admin Account */}
          <button
            onClick={() => navigate(user ? '/account' : '/login')}
            className="p-2 text-stone-700 hover:text-stone-950 transition-colors rounded-full hover:bg-stone-100/60 relative"
            aria-label="Customer account portal"
          >
            <User className="w-4.5 h-4.5" />
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0"
            aria-label="Open shopping cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#EBDBC9]" />
            <span className="hidden sm:inline">Bag</span>
            <span className="bg-stone-800 px-1.5 py-0.5 rounded text-[11px] tabular-nums font-semibold border border-stone-700">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
                <Search className="w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rings, pearl necklaces, chunky hoops, anti-tarnish bracelets..."
                  className="w-full text-base focus:outline-none text-stone-900 placeholder:text-stone-400"
                  autoFocus
                />
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search tags & suggestions */}
            <div className="p-4 bg-stone-50/50">
              <div className="text-xs uppercase tracking-wider text-stone-400 font-medium mb-2.5">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {['Anti-Tarnish', 'Gold Hoops', 'Pearl Necklace', 'Tennis Bracelet', 'Bangles', 'Rings'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/shop?search=${encodeURIComponent(tag)}`);
                      }}
                      className="text-xs text-stone-700 hover:text-stone-950 bg-white border border-stone-200 px-2.5 py-1 rounded hover:border-stone-400 transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>

              {/* Live search results preview */}
              {filteredSuggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-200/60">
                  <div className="text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
                    Matching Products
                  </div>
                  <div className="divide-y divide-stone-100">
                    {filteredSuggestions.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/product/${prod.slug}`);
                        }}
                        className="w-full py-2.5 flex items-center gap-3 text-left hover:bg-white px-2 rounded-lg transition-colors group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate group-hover:text-[#8C6D46]">
                            {prod.name}
                          </p>
                          <p className="text-xs text-stone-500 tabular-nums">
                            Rs. {(prod.salePrice || prod.price).toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 flex">
          <div className="w-4/5 max-w-sm bg-white h-full flex flex-col p-6 shadow-2xl justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                <span className="font-serif text-xl tracking-wider text-stone-900 font-semibold">
                  {settings?.storeName || 'ZARIYA LUXE'}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(link.path);
                    }}
                    className="text-left text-base font-medium text-stone-800 hover:text-stone-950 py-1 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/wishlist');
                    }}
                    className="text-left text-sm text-stone-600 hover:text-stone-900 flex items-center justify-between"
                  >
                    <span>My Wishlist ({wishlist.length})</span>
                    <Heart className="w-4 h-4 text-stone-400" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(user ? '/account' : '/login');
                    }}
                    className="text-left text-sm text-stone-600 hover:text-stone-950 flex items-center justify-between"
                  >
                    <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
                    <User className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 text-xs text-stone-500 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Anti-Tarnish Guaranteed</span>
              </div>
              <p>Cash on Delivery across Pakistan</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
