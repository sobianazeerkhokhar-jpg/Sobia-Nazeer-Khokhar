import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category, Order, StoreSettings, User, CartItem, Coupon } from '../types.ts';

interface StoreContextType {
  settings: StoreSettings | null;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  wishlist: string[]; // product IDs
  user: User | null;
  adminUser: User | null;
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: { coupon: Coupon; discount: number } | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  activeToast: string | null;
  showToast: (msg: string) => void;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
  loginAdmin: (admin: User, token: string) => void;
  logoutAdmin: () => void;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zl_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zl_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('zl_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('zl_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Sync Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('zl_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync Wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('zl_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshCategories();
    refreshProducts();
  }, []);

  // Cart calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more. Only ${product.stock} items in stock.`);
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} items in stock.`);
          return prev;
        }
        return [
          ...prev,
          {
            product,
            quantity,
            selectedColor: color || product.color,
            selectedSize: size || product.size,
          },
        ];
      }
    });
    showToast(`Added "${product.name}" to your bag.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from shopping bag');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            showToast(`Maximum stock reached (${item.product.stock})`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed piece from your wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added piece to your wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ coupon: data.coupon, discount: data.discount });
        showToast(data.message);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Invalid coupon code' };
      }
    } catch {
      return { success: false, message: 'Failed to apply coupon. Please try again.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const loginUser = (newUser: User, token: string) => {
    setUser(newUser);
    localStorage.setItem('zl_user', JSON.stringify(newUser));
    localStorage.setItem('zl_token', token);
    showToast(`Welcome back, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('zl_user');
    localStorage.removeItem('zl_token');
    showToast('Signed out successfully');
  };

  const loginAdmin = (newAdmin: User, token: string) => {
    setAdminUser(newAdmin);
    localStorage.setItem('zl_admin', JSON.stringify(newAdmin));
    localStorage.setItem('zl_admin_token', token);
    showToast('Welcome to Store Admin Panel');
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('zl_admin');
    localStorage.removeItem('zl_admin_token');
    showToast('Logged out of Admin Portal');
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        products,
        cart,
        wishlist,
        user,
        adminUser,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        activeToast,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        refreshProducts,
        refreshSettings,
        refreshCategories,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
