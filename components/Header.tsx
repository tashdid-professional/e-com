'use client';

import Link from 'next/link';
import { Store, Heart, User, LogOut, ShoppingCart, Search } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';
import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.items);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-gray-700 transition-colors">
            <Store className="w-7 h-7" />
            <span className="hidden sm:inline">MinimalShop</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-black font-medium transition-colors">
              Shop
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-black font-medium transition-colors">
              Categories
            </Link>
            <Link href="/deals" className="text-gray-700 hover:text-black font-medium transition-colors">
              Deals
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-gray-700" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon for Mobile */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* User Dropdown */}
              {showUserMenu && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-2">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/my-account"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    href="/my-orders"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <div className="border-t mt-2 pt-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Admin Panel
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
