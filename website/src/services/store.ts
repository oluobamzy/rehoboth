// src/services/store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
        setIsLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      {
        // Use the same name as Supabase so they don't conflict
        name: 'sb-auth-state',
        // Store in memory only to avoid conflicts with Supabase's storage
        // and to make sure session info from Supabase is the source of truth
        storage: {
          getItem: (name) => {
            // We'll rely on Supabase for persistent storage
            return null;
          },
          setItem: (name, value) => {
            // Don't actually store the Zustand state persistently
          },
          removeItem: (name) => {
            // No-op
          }
        },
      }
    )
  )
);

// UI State for managing global UI state like modals, sidebar, etc.
interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  activeModal: string | null;
  setActiveModal: (modalId: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    activeModal: null,
    setActiveModal: (modalId) => set({ activeModal: modalId }),
  }))
);
