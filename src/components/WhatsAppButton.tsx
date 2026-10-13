import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  const phone = settings?.whatsappNumber || '923218849201';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hi Zariya Luxe, I need assistance with my jewelry order.');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="w-5 h-5 fill-white stroke-[#25D366]" />
      <span className="hidden sm:inline text-xs font-semibold tracking-wide">WhatsApp Support</span>
    </a>
  );
};
