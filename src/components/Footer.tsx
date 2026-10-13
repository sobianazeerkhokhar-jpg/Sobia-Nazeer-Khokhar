import React, { useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Send, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        showToast(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        showToast(data.error || 'Subscription failed');
      }
    } catch {
      showToast('Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#171513] text-[#EDE8E1] pt-16 pb-24 md:pb-12 border-t border-stone-800">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-2.5 bg-stone-800 rounded-lg text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">100% Anti-Tarnish Guarantee</h4>
              <p className="text-xs text-stone-400 mt-1">
                Vacuum PVD gold plating. Hypoallergenic, sweatproof & waterproof for daily shine.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-2.5 bg-stone-800 rounded-lg text-[#D4AF37]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">Nationwide Cash on Delivery</h4>
              <p className="text-xs text-stone-400 mt-1">
                Free Express Delivery on orders above Rs. {settings?.freeShippingThreshold.toLocaleString() || '3,000'}.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-2.5 bg-stone-800 rounded-lg text-[#D4AF37]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">7-Day Hassle-Free Exchange</h4>
              <p className="text-xs text-stone-400 mt-1">
                Not the perfect fit? Exchange easily within 7 days with our dedicated care team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand & Bio */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl tracking-[0.14em] text-white uppercase">
            {settings?.storeName || 'ZARIYA LUXE'}
          </h3>
          <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
            Curated artificial and anti-tarnish jewelry for modern women. Designed to withstand sweat, water, and everyday life with luminous elegance.
          </p>
          <div className="pt-2 text-xs text-stone-400 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{settings?.phone || '+92 321 8849201'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{settings?.contactEmail || 'care@zariyaluxe.com'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="truncate">{settings?.storeAddress || 'Gulberg III, Lahore, Pakistan'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Collections */}
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-widest text-[#D4AF37] mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <button onClick={() => navigate('/shop?category=earrings')} className="hover:text-white transition-colors">
                Chunky & Minimal Earrings
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shop?category=necklaces')} className="hover:text-white transition-colors">
                Layered Chains & Pearl Necklaces
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shop?category=rings')} className="hover:text-white transition-colors">
                Stackable Anti-Tarnish Rings
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shop?category=bracelets')} className="hover:text-white transition-colors">
                Crystal Tennis Bracelets & Bangles
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shop?category=jewelry-sets')} className="hover:text-white transition-colors">
                Festive Jewelry Sets
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shop?category=anklets')} className="hover:text-white transition-colors">
                Waterproof Dainty Anklets
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-widest text-[#D4AF37] mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <button onClick={() => navigate('/track-order')} className="hover:text-white transition-colors">
                Track Your Order
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                About Zariya Luxe & Anti-Tarnish Tech
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shipping-policy')} className="hover:text-white transition-colors">
                Shipping & Delivery Rates
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/return-policy')} className="hover:text-white transition-colors">
                Return & 7-Day Exchange Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/faqs')} className="hover:text-white transition-colors">
                Care Instructions & FAQs
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                Contact & Showroom Concierge
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-widest text-[#D4AF37] mb-4">
            Join The Inner Circle
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Subscribe to receive private previews of new anti-tarnish drops and an exclusive 10% coupon code.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-stone-900 border border-stone-800 rounded-md px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#D4AF37] hover:bg-[#C29D2F] text-stone-950 rounded text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {subscribed ? <Check className="w-3.5 h-3.5" /> : subscribing ? '...' : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] text-emerald-400">Welcome! Use coupon code LUXE10 at checkout.</p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar & Admin Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div>
          © {new Date().getFullYear()} {settings?.storeName || 'ZARIYA LUXE'}. All rights reserved. Prices in PKR.
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/privacy-policy')} className="hover:text-stone-300">
            Privacy
          </button>
          <button onClick={() => navigate('/terms')} className="hover:text-stone-300">
            Terms
          </button>
          <span className="text-stone-700">·</span>
          <button
            onClick={() => navigate('/admin')}
            className="text-stone-400 hover:text-[#D4AF37] transition-colors underline underline-offset-2"
          >
            Admin Portal
          </button>
        </div>
      </div>
    </footer>
  );
};
