'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { canUserReviewProduct, hasUserReviewedProduct, getUserDeliveredOrderForProduct } from '@/lib/reviews';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [user, setUser] = useState<any>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkReviewEligibility();
  }, [productId]);

  const checkReviewEligibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    const [canReviewResult, hasReviewedResult] = await Promise.all([
      canUserReviewProduct(user.id, productId),
      hasUserReviewedProduct(user.id, productId)
    ]);

    setCanReview(canReviewResult);
    setHasReviewed(hasReviewedResult);

    if (canReviewResult && !hasReviewedResult) {
      const order = await getUserDeliveredOrderForProduct(user.id, productId);
      setOrderId(order?.id || null);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orderId) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
        status: 'pending'
      });

    if (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } else {
      alert('Review submitted successfully! It will be visible after admin approval.');
      setComment('');
      setHasReviewed(true);
      onReviewSubmitted?.();
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">Checking review eligibility...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-800">
          <strong>Sign in to write a review</strong> (Only available for customers who received this product)
        </p>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-gray-600">
          <strong>Reviews are only available for verified purchases</strong>
          <br />
          You can write a review after your order containing this product is delivered.
        </p>
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-green-800">
          <strong>✓ You have already reviewed this product</strong>
          <br />
          Thank you for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review for {productName}</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating} star{rating !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your experience with this product..."
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Submitting Review...' : 'Submit Review'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        Reviews are moderated and will appear after admin approval.
      </p>
    </div>
  );
}