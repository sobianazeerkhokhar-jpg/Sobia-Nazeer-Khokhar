import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { WhatsAppButton } from './components/WhatsAppButton.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { TrackOrderPage } from './pages/TrackOrderPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { StaticPage } from './pages/StaticPages.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

function MainApp() {
  const { activeToast } = useStore();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parsing
  const pathname = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.split('?')[1] || '');

  // Render Page Content
  const renderContent = () => {
    if (pathname === '/' || pathname === '') {
      return <HomePage navigate={navigate} />;
    }

    if (pathname === '/shop') {
      return (
        <ShopPage
          navigate={navigate}
          initialCategory={searchParams.get('category') || undefined}
          initialSearch={searchParams.get('search') || undefined}
          initialCollection={searchParams.get('collection') || undefined}
        />
      );
    }

    if (pathname.startsWith('/product/')) {
      const slug = pathname.replace('/product/', '');
      return <ProductDetailPage slug={slug} navigate={navigate} />;
    }

    if (pathname === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    if (pathname.startsWith('/order-success/')) {
      const orderId = pathname.replace('/order-success/', '');
      return <OrderSuccessPage orderId={orderId} navigate={navigate} />;
    }

    if (pathname === '/track-order') {
      return <TrackOrderPage initialOrderNumber={searchParams.get('order') || undefined} navigate={navigate} />;
    }

    if (pathname === '/wishlist') {
      return <WishlistPage navigate={navigate} />;
    }

    if (pathname === '/account') {
      return <AccountPage navigate={navigate} />;
    }

    if (pathname === '/login') {
      return <AuthPage navigate={navigate} defaultMode="login" />;
    }

    if (pathname === '/signup') {
      return <AuthPage navigate={navigate} defaultMode="signup" />;
    }

    if (pathname === '/about') {
      return <StaticPage type="about" navigate={navigate} />;
    }

    if (pathname === '/contact') {
      return <StaticPage type="contact" navigate={navigate} />;
    }

    if (pathname === '/faqs') {
      return <StaticPage type="faqs" navigate={navigate} />;
    }

    if (pathname === '/shipping-policy') {
      return <StaticPage type="shipping" navigate={navigate} />;
    }

    if (pathname === '/return-policy') {
      return <StaticPage type="returns" navigate={navigate} />;
    }

    if (pathname === '/privacy-policy') {
      return <StaticPage type="privacy" navigate={navigate} />;
    }

    if (pathname === '/terms') {
      return <StaticPage type="terms" navigate={navigate} />;
    }

    if (pathname.startsWith('/admin')) {
      return <AdminDashboard navigate={navigate} />;
    }

    // Default fallback
    return <HomePage navigate={navigate} />;
  };

  const isAdminView = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#EBDBC9] selection:text-stone-900">
      {!isAdminView && (
        <div className="no-print">
          <Header currentPath={pathname} navigate={navigate} />
        </div>
      )}

      <main className="flex-1 pb-16 md:pb-0">{renderContent()}</main>

      {!isAdminView && (
        <div className="no-print">
          <Footer navigate={navigate} />
          <MobileBottomNav currentPath={pathname} navigate={navigate} />
          <WhatsAppButton />
        </div>
      )}

      {/* Slide-over cart & modals */}
      <CartDrawer navigate={navigate} />
      <QuickViewModal navigate={navigate} />

      {/* Toast notification message */}
      {activeToast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-stone-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {activeToast}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
