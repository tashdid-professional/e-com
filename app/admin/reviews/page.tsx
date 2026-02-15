'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Check, X, Trash2, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
  products: {
    name: string;
    image_url: string | null;
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        status,
        created_at,
        user_id,
        products(name, image_url)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    setUpdating(reviewId);

    const { error } = await supabase
      .from('reviews')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review status');
    } else {
      fetchReviews();
    }

    setUpdating(null);
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setUpdating(reviewId);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } else {
      fetchReviews();
    }

    setUpdating(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFilterCounts = () => {
    const counts = reviews.reduce((acc, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      all: reviews.length,
      pending: counts.pending || 0,
      approved: counts.approved || 0,
      rejected: counts.rejected || 0
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
          <p className="text-gray-600">Manage customer reviews - approve, reject, or delete reviews</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            {([
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
              { key: 'all', label: 'All', count: counts.all }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    filter === tab.key ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {filter === 'pending' && 'No reviews are pending approval.'}
              {filter === 'approved' && 'No reviews have been approved yet.'}
              {filter === 'rejected' && 'No reviews have been rejected.'}
              {filter === 'all' && 'No reviews have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {review.products.image_url ? (
                        <img
                          src={review.products.image_url}
                          alt={review.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Review Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {review.products.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium">{review.rating}/5</span>
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        By User {review.user_id.slice(0, 8)}*** on {formatDate(review.created_at)}
                      </p>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          disabled={updating === review.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          disabled={updating === review.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {review.status === 'rejected' && (
                      <button
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        disabled={updating === review.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    )}

                    {review.status === 'approved' && (
                      <button
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        disabled={updating === review.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={updating === review.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}