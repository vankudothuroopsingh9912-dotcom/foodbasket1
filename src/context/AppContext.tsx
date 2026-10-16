import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Product,
  CartItem,
  Coupon,
  Address,
  Order,
} from '../types/index.ts';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation
  currentView: string;
  viewParams: Record<string, string>;
  navigateTo: (view: string, params?: Record<string, string>) => void;

  // Auth
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Coupons
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Location / Pincode
  deliveryLocation: { area: string; city: string; pincode: string };
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  updateLocation: (pincode: string) => Promise<{ success: boolean; message: string }>;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Active Order for Tracking
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  // Search keyword in header
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<Record<string, string>>({});

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Location
  const [deliveryLocation, setDeliveryLocation] = useState({
    area: 'Indiranagar 100ft Rd',
    city: 'Bengaluru',
    pincode: '560038',
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Active Tracking Order ID
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Header Search
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('fb_token');
      const storedUser = localStorage.getItem('fb_user');
      const storedCart = localStorage.getItem('fb_cart');
      const storedWishlist = localStorage.getItem('fb_wishlist');
      const storedLoc = localStorage.getItem('fb_location');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
      if (storedLoc) {
        setDeliveryLocation(JSON.parse(storedLoc));
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fb_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fb_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (view: string, params: Record<string, string> = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to login' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fb_token', data.token);
      localStorage.setItem('fb_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fb_token', data.token);
      localStorage.setItem('fb_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      showToast(`Account created! Welcome to Food Basket, ${data.user.name}!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    showToast('Logged out successfully', 'info');
    if (currentView === 'admin' || currentView === 'profile' || currentView === 'order-history') {
      navigateTo('home');
    }
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!token) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update' };
      }
      setUser(data.user);
      localStorage.setItem('fb_user', JSON.stringify(data.user));
      showToast('Profile updated successfully');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more than ${product.stock} units of ${product.name}`, 'error');
          return prev;
        }
        showToast(`Updated quantity for ${product.name}`);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} units available in stock`, 'error');
          return prev;
        }
        showToast(`Added ${product.name} to basket!`);
        return [...prev, { productId: product.id, product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast('Item removed from basket', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (quantity > item.product.stock) {
            showToast(`Max stock reached (${item.product.stock})`, 'error');
            return item;
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
    setCouponDiscount(0);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Recalculate coupon when cart changes
  useEffect(() => {
    if (appliedCoupon) {
      if (cartSubtotal < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        showToast(`Coupon removed: Cart below ₹${appliedCoupon.minOrderValue}`, 'info');
      } else {
        let disc = 0;
        if (appliedCoupon.discountType === 'percentage') {
          disc = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
        } else {
          disc = appliedCoupon.discountValue;
        }
        setCouponDiscount(disc);
      }
    }
  }, [cartSubtotal, appliedCoupon]);

  // Wishlist actions
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from your wishlist`, 'info');
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved to your wishlist!`);
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Coupon action
  const applyCouponCode = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon' };
      }
      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discount);
      showToast(data.message, 'success');
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed', 'info');
  };

  // Location update
  const updateLocation = async (pincode: string) => {
    try {
      const res = await fetch('/api/delivery/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode }),
      });
      const data = await res.json();
      if (!res.ok || !data.serviceable) {
        return { success: false, message: data.message || 'Pincode not serviceable' };
      }
      const newLoc = { area: data.area, city: data.city, pincode: data.pincode };
      setDeliveryLocation(newLoc);
      localStorage.setItem('fb_location', JSON.stringify(newLoc));
      setIsLocationModalOpen(false);
      showToast(`Delivering fresh to ${data.area}, ${data.city} (${pincode})!`);
      return { success: true, message: 'Location updated' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update location' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        viewParams,
        navigateTo,
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        couponDiscount,
        applyCouponCode,
        removeCoupon,
        deliveryLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        updateLocation,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        dismissToast,
        activeOrderId,
        setActiveOrderId,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
