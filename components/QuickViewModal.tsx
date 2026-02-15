'use client';

import { X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  users?: {
    email: string;
  };
}

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();
  const [isAdded, setIsAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState(product.image_url);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const inWishlist = isInWishlist(product.id);

  useEffect(() => {
    fetchReviews();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(3);

    setReviews(data || []);
    setLoadingReviews(false);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.secondary_image && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentImage(product.image_url)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImage === product.image_url ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={product.image_url || ''}
                    alt="View 1"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => setCurrentImage(product.secondary_image || null)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImage === product.secondary_image ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={product.secondary_image}
                    alt="View 2"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Category & Stock */}
            <div className="flex items-center justify-between">
              {product.category && (
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  {product.category}
                </span>
              )}
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold">{product.name}</h2>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(Number(averageRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div>
              {product.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-green-600">
                    ${product.discount_price.toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <div className="text-4xl font-bold">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 ${
                  isAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                } px-6 py-4 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg`}
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : isAdded ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`${
                  inWishlist ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } px-6 py-4 rounded-lg transition-all flex items-center justify-center`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* View Full Details Link */}
            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Full Product Details →
            </Link>

            {/* Reviews Preview */}
            {reviews.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Recent Reviews</h3>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
