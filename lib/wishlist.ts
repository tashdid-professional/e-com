import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  syncWithDatabase: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Add to database
          const existing = get().items.find((i) => i.id === item.id);
          if (existing) {
            // Remove from database
            await supabase
              .from('wishlists')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', item.id);
            set((state) => ({
              items: state.items.filter((i) => i.id !== item.id),
            }));
          } else {
            // Add to database
            await supabase
              .from('wishlists')
              .insert({ user_id: user.id, product_id: item.id });
            set((state) => ({ items: [...state.items, item] }));
          }
        } else {
          // Local storage fallback
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
              return {
                items: state.items.filter((i) => i.id !== item.id),
              };
            }
            return { items: [...state.items, item] };
          });
        }
      },
      removeItem: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', id);
        }
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      isInWishlist: (id) => {
        const state = get();
        return state.items.some((i) => i.id === id);
      },
      syncWithDatabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('wishlists')
            .select(`
              product_id,
              products (id, name, price, image_url)
            `)
            .eq('user_id', user.id);
          
          if (data) {
            const items = data.map((item: any) => ({
              id: item.products.id,
              name: item.products.name,
              price: item.products.price,
              image_url: item.products.image_url,
            }));
            set({ items });
          }
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

