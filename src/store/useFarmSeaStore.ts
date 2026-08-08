'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CUSTOMER' | 'FARMER' | 'FISHER' | 'DELIVERY' | 'ADMIN';
export type ViewType =
  | 'login'
  | 'customer-browse'
  | 'customer-orders'
  | 'customer-bookings'
  | 'customer-ai'
  | 'customer-circular'
  | 'farmer-products'
  | 'farmer-orders'
  | 'farmer-bookings'
  | 'farmer-ai'
  | 'farmer-passport'
  | 'fisher-products'
  | 'fisher-orders'
  | 'fisher-bookings'
  | 'fisher-ai'
  | 'fisher-passport'
  | 'delivery-assignments'
  | 'delivery-performance'
  | 'delivery-salary'
  | 'admin-analytics'
  | 'admin-users'
  | 'admin-warnings'
  | 'admin-moderation'
  | 'circular-marketplace'
  | 'circular-my-listings'
  | 'circular-history'
  | 'ai-matching'
  | 'ai-freshness'
  | 'ai-pricing'
  | 'ai-demand'
  | 'ai-copilot';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  language: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  profile: Record<string, unknown> | null;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  sellerId: string;
  sellerType: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface FarmSeaState {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  currentRole: UserRole | null;
  login: (user: User) => void;
  logout: () => void;

  // UI
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: () => number;
}

export const useFarmSeaStore = create<FarmSeaState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isLoggedIn: false,
      currentRole: null,
      login: (user) => {
        const defaultView: Record<UserRole, ViewType> = {
          CUSTOMER: 'customer-browse',
          FARMER: 'farmer-products',
          FISHER: 'fisher-products',
          DELIVERY: 'delivery-assignments',
          ADMIN: 'admin-analytics',
        };
        set({
          user,
          isLoggedIn: true,
          currentRole: user.role,
          currentView: defaultView[user.role],
        });
      },
      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          currentRole: null,
          currentView: 'login',
          cart: [],
          notifications: [],
        });
      },

      // UI
      currentView: 'login',
      setCurrentView: (view) => set({ currentView: view, sidebarOpen: false }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find((c) => c.productId === item.productId);
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((c) => c.productId !== productId) });
      },
      updateCartQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((c) =>
            c.productId === productId ? { ...c, quantity } : c
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        return get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
      },

      // Notifications
      notifications: [],
      addNotification: (n) => {
        set({ notifications: [n, ...get().notifications].slice(0, 50) });
      },
      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        });
      },
      clearNotifications: () => set({ notifications: [] }),
      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: 'farmsea-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        currentRole: state.currentRole,
        cart: state.cart,
      }),
    }
  )
);
