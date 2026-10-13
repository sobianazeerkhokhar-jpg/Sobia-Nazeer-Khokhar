import React from 'react';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface MobileBottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, navigate }) => {
  const { cartCount, wishlist, user, setIsCartOpen } = useStore();

  const items = [
    { label: 'Home', icon: Home, action: () => navigate('/'), active: currentPath === '/' },
    { label: 'Shop', icon: Compass, action: () => navigate('/shop'), active: currentPath.startsWith('/shop') },
    {
      label: 'Wishlist',
      icon: Heart,
      action: () => navigate('/wishlist'),
      active: currentPath === '/wishlist',
      badge: wishlist.length > 0 ? wishlist.length : undefined,
    },
    {
      label: 'Bag',
      icon: ShoppingBag,
      action: () => setIsCartOpen(true),
      active: false,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      label: 'Account',
      icon: User,
      action: () => navigate(user ? '/account' : '/login'),
      active: currentPath === '/account' || currentPath === '/login',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] relative text-[10px] font-medium transition-colors ${
                item.active ? 'text-stone-950 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative mb-0.5">
                <Icon className={`w-5 h-5 ${item.active ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-stone-900 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
