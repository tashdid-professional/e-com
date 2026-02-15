'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface ReviewDisplayProps {
  productId: string;
  refreshTrigger?: number;
}

export default function ReviewDisplay({ productId, refreshTrigger }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    const { data: reviewsData, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, user_id')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(reviewsData || []);
      setTotalReviews(reviewsData?.length || 0);
      
      if (reviewsData && reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avgRating * 10) / 10);
      } else {
        setAverageRating(0);
      }
    }
    setLoading(false);
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const maskUserId = (userId: string) => {
    return userId.slice(0, 8) + '***';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            {renderStars(averageRating, 'w-5 h-5')}
            <span className="text-lg font-semibold">
              {averageRating > 0 ? averageRating : 'No ratings'}
            </span>
          </div>
          <span className="text-gray-600">
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </span>
        </div>
        
        {totalReviews > 0 && (
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = (count / totalReviews) * 100;
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      {totalReviews === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    User {maskUserId(review.user_id)}
                  </span>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 leading-relaxed ml-7">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}