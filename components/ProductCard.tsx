'use client';

import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { useState } from 'react';
import Link from 'next/link';
import QuickViewModal from './QuickViewModal';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price?: number | null;
  image_url: string | null;
  category: string | null;
  stock: number;
  secondary_image?: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <Link 
      href={`/products/${product.id}`} 
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                isHovered && product.secondary_image ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {product.secondary_image && (
              <img
                src={product.secondary_image}
                alt={`${product.name} - alternate view`}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={handleQuickView}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 flex items-center gap-2 font-medium"
        >
          <Eye className="w-4 h-4" />
          Quick View
        </button>

        {/* Low Stock Badge */}
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Only {product.stock} left
          </span>
        )}

        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Out of Stock
          </span>
        )}

        {/* Discount Badge */}
        {product.discount_price && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
            {product.category}
          </p>
        )}
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div>
            {product.discount_price ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">
                  ${product.discount_price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`${
              isAdded
                ? 'bg-green-500 text-white'
                : 'bg-black text-white hover:bg-gray-800'
            } px-5 py-2.5 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold`}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : isAdded ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </Link>

    {/* Quick View Modal */}
    {showQuickView && (
      <QuickViewModal 
        product={product} 
        onClose={() => setShowQuickView(false)} 
      />
    )}
    </>
  );
}
