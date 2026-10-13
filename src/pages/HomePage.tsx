import React from 'react';
import { ArrowRight, Sparkles, Shield, Droplets, Sun, Award, CheckCircle2, Star, Instagram } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { products, categories, settings } = useStore();

  const newArrivals = products.slice(0, 4);
  const bestSellers = products
    .slice()
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4);
  const antiTarnishPicks = products.filter((p) => p.isAntiTarnish).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO CAMPAIGN SECTION */}
      <section className="relative overflow-hidden bg-[#F6F3EE] border-b border-[#EBE6DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#8C6D46] uppercase bg-white/70 px-3 py-1.5 rounded-full border border-[#E3DCcf]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>18K PVD Anti-Tarnish Fine Fashion Jewelry</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-stone-900 leading-[1.12]">
              {settings?.heroHeadline || 'Timeless Shine. Everyday Elegance.'}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {settings?.heroSubheading ||
                'Discover elegant artificial & anti-tarnish jewelry designed to elevate every look. Waterproof, perfume-proof, and crafted for daily wear across Pakistan.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>{settings?.heroButtonPrimary || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/shop?collection=anti-tarnish')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded text-xs font-semibold tracking-widest uppercase transition-all shadow-sm"
              >
                {settings?.heroButtonSecondary || 'Explore Anti-Tarnish'}
              </button>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8C6D46]" />
                <span>Zero Fading Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#8C6D46]" />
                <span>100% Shower Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8C6D46]" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-200">
              <img
                src={settings?.heroImage || '/src/assets/images/hero_jewelry_campaign_1791811748777.jpg'}
                alt="Zariya Luxe Campaign"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-xs backdrop-blur-md bg-stone-900/60 p-4 rounded-xl border border-white/20">
                <p className="font-serif text-sm font-semibold tracking-wider text-[#EBDBC9] uppercase">
                  Signature Essentials
                </p>
                <p className="text-[11px] text-stone-200 mt-0.5">
                  Hand-finished vacuum PVD coating with 2+ years lustre durability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
            Curated Collections
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl text-stone-900 font-medium">
            Explore By Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            From understated everyday hoops to showstopping wedding jewelry sets.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.slug}`)}
              className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-[#EBE6DE] hover:border-[#8C6D46] transition-all duration-300 hover:shadow-md flex flex-col"
            >
              <div className="aspect-square overflow-hidden bg-[#FAF8F5] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="p-3.5 text-center flex-1 flex flex-col justify-center">
                <h3 className="font-serif text-base sm:text-lg text-stone-900 group-hover:text-[#8C6D46] font-medium transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-400 mt-0.5">
                  {cat.itemCount ? `${cat.itemCount} Designs` : 'View Collection'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ANTI-TARNISH SPOTLIGHT SECTION */}
      <section className="bg-[#1C1917] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800">
                <Shield className="w-3.5 h-3.5" />
                <span>The Science of Anti-Tarnish</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
                {settings?.antiTarnishHeadline || 'Made for Everyday Shine: 100% Anti-Tarnish Guarantee'}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {settings?.antiTarnishDescription ||
                  'Engineered with advanced vacuum PVD (Physical Vapor Deposition) technology over medical-grade 316L stainless steel. Our jewelry will never turn your skin green, fade, or rust — even when exposed to water, sweat, heat, and coastal air.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
                    <Droplets className="w-4 h-4" />
                    <span>Waterproof & Sweatproof</span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Wear in the shower, gym, or swimming pool without worry.
                  </p>
                </div>

                <div className="p-4 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
                    <Sun className="w-4 h-4" />
                    <span>Hypoallergenic Core</span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Lead-free, nickel-free, and guaranteed safe for sensitive ears & skin.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/shop?collection=anti-tarnish')}
                  className="px-7 py-3.5 bg-[#D4AF37] hover:bg-[#C29D2F] text-stone-950 font-semibold text-xs tracking-widest uppercase rounded transition-colors flex items-center gap-2"
                >
                  <span>Shop Anti-Tarnish Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {antiTarnishPicks.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/product/${prod.slug}`)}
                  className="group cursor-pointer bg-stone-900 border border-stone-800 rounded-xl p-3 hover:border-[#D4AF37] transition-all"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-stone-950">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-medium text-white truncate group-hover:text-[#D4AF37] transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-stone-400 font-semibold mt-1 tabular-nums">
                    Rs. {(prod.salePrice || prod.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
              Fresh Off The Bench
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?sort=newest')}
            className="text-xs font-semibold tracking-wider uppercase text-stone-900 hover:text-[#8C6D46] flex items-center gap-1.5 transition-colors"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F2ECE3] rounded-2xl p-8 sm:p-12 border border-[#E5DDD2] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8C6D46]">
              Nationwide Delivery
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl text-stone-900 font-medium">
              Elegant Pieces. Effortless Style.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md">
              Order today with nationwide Cash on Delivery across Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad, and all cities. Free express courier delivery on orders above Rs. {settings?.freeShippingThreshold.toLocaleString() || '3,000'}.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Shop The Range
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/80 text-center space-y-1">
              <span className="text-2xl font-serif text-stone-900 font-semibold">100%</span>
              <p className="text-xs font-medium text-stone-600">Anti-Tarnish Assurance</p>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/80 text-center space-y-1">
              <span className="text-2xl font-serif text-stone-900 font-semibold">2-4</span>
              <p className="text-xs font-medium text-stone-600">Days Fast Delivery</p>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/80 text-center space-y-1">
              <span className="text-2xl font-serif text-stone-900 font-semibold">COD</span>
              <p className="text-xs font-medium text-stone-600">Available Nationwide</p>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/80 text-center space-y-1">
              <span className="text-2xl font-serif text-stone-900 font-semibold">4.9★</span>
              <p className="text-xs font-medium text-stone-600">Over 5,000 Happy Clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
              Most Loved By Women
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?sort=bestseller')}
            className="text-xs font-semibold tracking-wider uppercase text-stone-900 hover:text-[#8C6D46] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="bg-white py-16 sm:py-20 border-y border-[#EBE6DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <p className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold">
              Real Experiences
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl text-stone-900 font-medium">
              Loved By Our Patrons
            </h2>
            <div className="flex items-center justify-center gap-1 pt-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs font-semibold text-stone-700 ml-2">
                4.9 / 5 Rating from 2,400+ Verified Orders
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "I ordered the chunky gold hoops and baroque pearl necklace. I wear them daily while cooking, showering, and at work. It has been a month and they look as radiant as day one! So thrilled with this brand."
              </p>
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Aiman Siddiqui</h4>
                  <span className="text-[11px] text-stone-400">Karachi</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "Finding genuine anti-tarnish jewelry in Pakistan was so difficult before Zariya Luxe. The tennis bracelet has diamond-like shine, and the COD was verified quickly. Delivered in 2 days to Islamabad."
              </p>
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Dr. Rabia Tahir</h4>
                  <span className="text-[11px] text-stone-400">Islamabad</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "The packaging is pure luxury. Beautiful champagne velvet box with certificate of authenticity. Gave the celestial starburst set to my sister for Eid and she cried happy tears."
              </p>
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Zahra Mansoor</h4>
                  <span className="text-[11px] text-stone-400">Lahore</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INSTAGRAM & SOCIAL GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#8C6D46] uppercase tracking-widest">
            <Instagram className="w-4 h-4" />
            <span>@zariyaluxe</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">
            Styled By You #ZariyaLuxe
          </h2>
          <p className="text-xs text-stone-500">
            Tag us in your daily jewelry stacks to be featured in our seasonal lookbook.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { img: '/src/assets/images/hero_jewelry_campaign_1791811748777.jpg', tag: '@fatima.style' },
            { img: '/src/assets/images/product_pearl_necklace_1791811765012.jpg', tag: '@noor_aesthetic' },
            { img: '/src/assets/images/product_gold_hoops_1791811785683.jpg', tag: '@zoha_wardrobe' },
            { img: '/src/assets/images/product_tennis_bracelet_1791811809037.jpg', tag: '@anmol_khann' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden group bg-stone-100 border border-stone-200"
            >
              <img
                src={item.img}
                alt="Instagram look"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <span className="text-white text-xs font-medium tracking-wide">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
