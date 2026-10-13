import React, { useState } from 'react';
import { ShieldCheck, Truck, Droplets, MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface StaticPageProps {
  type: 'about' | 'contact' | 'faqs' | 'shipping' | 'returns' | 'privacy' | 'terms';
  navigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, navigate }) => {
  const { settings, showToast } = useStore();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    showToast('Your inquiry has been submitted. Our concierge will contact you within 2 hours.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-10">
      {/* 1. ABOUT US */}
      {type === 'about' && (
        <div className="space-y-8 text-stone-800">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#8C6D46]">
              Our Heritage & Philosophy
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-stone-900">
              Everyday Luxury Without The Tarnish
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
              Zariya Luxe was founded with one clear mission: to bring timeless, hypoallergenic, and 100% waterproof anti-tarnish jewelry to modern women across Pakistan.
            </p>
          </div>

          <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-stone-200">
            <img
              src="/src/assets/images/hero_jewelry_campaign_1791811748777.jpg"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-stone text-xs sm:text-sm leading-relaxed space-y-4 max-w-none">
            <h2 className="font-serif text-2xl text-stone-900 font-medium">The Anti-Tarnish Revolution</h2>
            <p>
              Traditional artificial fashion jewelry often oxidizes within weeks when exposed to sweat, humidity, lotions, and perfumes. Our pieces are crafted using <strong>Physical Vapor Deposition (PVD) vacuum coating</strong> — a high-tech process where 18K gold is molecularly bonded to surgical 316L stainless steel in a vacuum chamber.
            </p>
            <p>
              The result is a lustrous, durable finish that is <strong>10 times thicker and harder than conventional flash electroplating</strong>. It resists corrosion, perspiration, salt water, and daily wear without ever losing its golden mirror shine.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 not-prose">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#8C6D46]" />
                <h4 className="font-semibold text-stone-900 text-xs">Hypoallergenic</h4>
                <p className="text-[11px] text-stone-500">100% nickel, lead, and cadmium free. Safe for sensitive ears.</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <Droplets className="w-5 h-5 text-[#8C6D46]" />
                <h4 className="font-semibold text-stone-900 text-xs">100% Waterproof</h4>
                <p className="text-[11px] text-stone-500">Safe for swimming, gym sessions, and daily showers.</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <Truck className="w-5 h-5 text-[#8C6D46]" />
                <h4 className="font-semibold text-stone-900 text-xs">Nationwide Reach</h4>
                <p className="text-[11px] text-stone-500">Reliable Cash on Delivery delivery to all cities and towns.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {type === 'contact' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#8C6D46]">
              Client Support
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
              Get in Touch with Our Concierge
            </h1>
            <p className="text-xs text-stone-500">We are here to assist you with order inquiries, bespoke sizing, and styling advice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact details */}
            <div className="space-y-6 bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-stone-200">
              <h2 className="font-serif text-xl text-stone-900 font-medium">Showroom & Studio</h2>
              
              <div className="space-y-4 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Flagship Studio</span>
                    <span>{settings?.storeAddress || 'Al-Hafeez Executive, Gulberg III, Lahore, Pakistan'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Phone Support</span>
                    <span>{settings?.phone || '+92 321 8849201'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Email Inquiries</span>
                    <span>{settings?.contactEmail || 'care@zariyaluxe.com'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Support Hours</span>
                    <span>Monday – Saturday: 10:00 AM – 9:00 PM PKT</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <a
                  href={`https://wa.me/${(settings?.whatsappNumber || '923218849201').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-4">
              <h2 className="font-serif text-xl text-stone-900 font-medium">Send a Message</h2>
              {contactSent ? (
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-900">Message Dispatched</p>
                  <p className="text-xs text-emerald-700">
                    Thank you! Our jewelry care specialists will reply via WhatsApp or email promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Fatima Khan"
                      className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="fatima@example.com"
                      className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Inquiry / Note *</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="How can we assist you with our jewelry or your order?"
                      className="w-full bg-stone-50 border border-stone-300 rounded p-3 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. FAQS */}
      {type === 'faqs' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#8C6D46]">
              Frequently Asked Questions
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
              Everything You Need to Know
            </h1>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What makes your anti-tarnish jewelry different from normal artificial jewelry?',
                a: 'Standard artificial jewelry is electroplated with a micro-thin layer of gold that strips away upon contact with sweat or perfume. Zariya Luxe pieces are engineered using vacuum PVD (Physical Vapor Deposition) over titanium and surgical stainless steel. This creates a molecular bond that is 100% waterproof, sweatproof, and will never turn your skin green.',
              },
              {
                q: 'Can I wear Zariya Luxe jewelry in the shower, gym, or swimming pool?',
                a: 'Yes, absolutely! All items marked Anti-Tarnish are 100% waterproof. You can wear your rings, chains, hoops, and tennis bracelets in the shower, workout sessions, and daily hand-washing without tarnishing.',
              },
              {
                q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
                a: 'Yes, we provide Cash on Delivery across all cities, towns, and regions in Pakistan. You only pay when the courier rider delivers your package.',
              },
              {
                q: 'How long does delivery take?',
                a: 'Standard delivery takes 2–4 business days for major cities (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan). Other regional areas take 3–5 business days.',
              },
              {
                q: 'What is your exchange and return policy?',
                a: 'We offer an easy 7-day hassle-free exchange policy. If you receive an item and need a different design or sizing, message our WhatsApp care line within 7 days in its unworn condition.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                <h3 className="font-serif text-base text-stone-900 font-medium">{faq.q}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHIPPING POLICY */}
      {type === 'shipping' && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h1 className="font-serif text-3xl text-stone-900 font-medium">Shipping & Delivery Policy</h1>
          <p>{settings?.shippingPolicy}</p>
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-stone-900 text-sm">Delivery Rates:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders above Rs. {settings?.freeShippingThreshold.toLocaleString() || '3,000'}: <strong>Complimentary FREE Delivery</strong></li>
              <li>Orders below Rs. {settings?.freeShippingThreshold.toLocaleString() || '3,000'}: Flat delivery rate of Rs. {settings?.flatShippingFee.toLocaleString() || '250'}</li>
            </ul>
          </div>
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-stone-900 text-sm">Courier Partners:</h3>
            <p>We dispatch all parcels through verified express couriers including TCS, Trax Express, and Leopard Logistics with full online tracking.</p>
          </div>
        </div>
      )}

      {/* 5. RETURN POLICY */}
      {type === 'returns' && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h1 className="font-serif text-3xl text-stone-900 font-medium">7-Day Return & Exchange Policy</h1>
          <p>{settings?.returnPolicy}</p>
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-stone-900 text-sm">Exchange Requirements:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Item must be unworn and in original condition with security tags intact.</li>
              <li>Item must be accompanied by the original velvet packaging and invoice.</li>
              <li>Exchange request must be initiated within 7 calendar days of receipt.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY */}
      {type === 'privacy' && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h1 className="font-serif text-3xl text-stone-900 font-medium">Privacy Policy</h1>
          <p>{settings?.privacyPolicy}</p>
          <p>
            We respect the privacy of every client. Personal contact information, phone numbers, and delivery addresses are utilized strictly for order verification, courier dispatch, and client care. We never distribute customer information to external third parties.
          </p>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS */}
      {type === 'terms' && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h1 className="font-serif text-3xl text-stone-900 font-medium">Terms & Conditions</h1>
          <p>{settings?.termsConditions}</p>
          <p>
            By placing an order on ZARIYA LUXE, the customer agrees to provide valid contact and address details. Orders placed with Cash on Delivery will undergo an automated SMS or WhatsApp confirmation prior to courier dispatch.
          </p>
        </div>
      )}
    </div>
  );
};
