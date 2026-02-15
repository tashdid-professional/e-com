'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWishlistStore } from '@/lib/wishlist';
import { useCartStore } from '@/lib/store';
import { Heart, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, removeItem, syncWithDatabase } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await syncWithDatabase();
      }
    };
    checkUser();
  }, [syncWithDatabase]);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-4xl font-bold">My Wishlist</h1>
            <p className="text-gray-600 text-sm mt-1">
              {user ? 'Synced across all your devices' : 'Login to sync wishlist across devices'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{items.length} items in your wishlist</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link 
                      href={`/products/${item.id}`}
                      className="font-bold text-lg mb-2 hover:text-gray-600 transition-colors block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-2xl font-bold mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
