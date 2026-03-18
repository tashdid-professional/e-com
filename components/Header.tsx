'use client';

import Link from 'next/link';
import { Store, Heart, User, LogOut, ShoppingCart, Search, Menu, X, ChevronRight, Settings } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';
import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.items);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu when user changes or navigation happens
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [user]);

  // Prevent background scroll while mobile menu is open.
  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-700 hover:text-black transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-black text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">WEBKART</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-widest px-2 py-1 relative group">
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/categories" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-widest px-2 py-1 relative group">
              Categories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/deals" className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest px-2 py-1 relative group">
              Deals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Search - Desktop only icon */}
            <button className="hidden sm:flex p-2.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all group">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Account - Desktop */}
            <div className="hidden md:block relative">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-4 border-l ml-2"
                >
                  <div className="w-9 h-9 bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center font-bold text-sm tracking-tighter hover:bg-gray-200 transition-colors">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-bold text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <span>Login</span>
                </Link>
              )}

              {/* User Dropdown - Desktop */}
              {showUserMenu && user && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50 mb-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Account</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/my-account"
                    className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Account
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                  <Link
                    href="/my-orders"
                    className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Orders
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Admin Panel
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-5 py-3 hover:bg-red-50 text-sm font-bold text-red-600 transition-colors"
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

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed inset-0 z-9999 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Content */}
        <div
          className={`relative z-10000 w-[82%] max-w-sm h-dvh max-h-dvh bg-white shadow-2xl flex flex-col transform-gpu transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-black text-white p-1 rounded-md">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tighter">WEBKART</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6 px-6 space-y-8 pb-20">
            {/* Quick Links */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Shop Now</p>
              <div className="space-y-4">
                <Link 
                  href="/" 
                  className="flex items-center justify-between text-xl font-bold text-gray-800 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link 
                  href="/categories" 
                  className="flex items-center justify-between text-xl font-bold text-gray-800 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link 
                  href="/deals" 
                  className="flex items-center justify-between text-xl font-bold text-red-600 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Flash Deals <ChevronRight className="w-5 h-5 text-red-200" />
                </Link>
              </div>
            </div>

            {/* Account Section */}
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account</p>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500">Welcome back!</p>
                    </div>
                  </div>
                  <Link 
                    href="/my-account" 
                    className="flex items-center gap-3 text-lg font-medium text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <Link 
                    href="/my-orders" 
                    className="flex items-center gap-3 text-lg font-medium text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" /> Orders
                  </Link>
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-3 text-lg font-medium text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" /> Management
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-lg font-bold text-red-600 pt-4"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-xl font-bold shadow-xl shadow-black/10 transition-transform active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In to Account
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50 text-center shrink-0">
            <p className="text-xs text-gray-400 font-medium">© 2026 WEBKART E-commerce</p>
          </div>
        </div>
      </div>
    </header>
  );
}
