'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, Mail, Phone, Star } from 'lucide-react';
import { canUserReviewProduct, hasUserReviewedProduct } from '@/lib/reviews';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface ReviewStatus {
  [productId: string]: {
    canReview: boolean;
    hasReviewed: boolean;
    showForm: boolean;
  };
}

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [reviewStatuses, setReviewStatuses] = useState<ReviewStatus>({});
  const [submittingReview, setSubmittingReview] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      checkUser();
    }
  }, [orderId]);

  useEffect(() => {
    if (user && order?.status === 'delivered' && orderItems.length > 0) {
      checkReviewStatuses(orderItems);
    }
  }, [user, order, orderItems]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchOrder = async () => {
    if (!orderId) return;
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      notFound();
      return;
    }

    setOrder(orderData);

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*, products(id, name, image_url)')
      .eq('order_id', orderId);

    setOrderItems(itemsData || []);
    setLoading(false);
  };

  const checkReviewStatuses = async (items: OrderItem[]) => {
    if (!user) return;

    const statuses: ReviewStatus = {};
    
    for (const item of items) {
      if (item.products?.id) {
        const [canReview, hasReviewed] = await Promise.all([
          canUserReviewProduct(user.id, item.products.id),
          hasUserReviewedProduct(user.id, item.products.id)
        ]);
        
        statuses[item.products.id] = {
          canReview,
          hasReviewed,
          showForm: false
        };
      }
    }
    
    setReviewStatuses(statuses);
  };

  const toggleReviewForm = (productId: string) => {
    setReviewStatuses(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        showForm: !prev[productId]?.showForm
      }
    }));
  };

  const submitReview = async (productId: string, rating: number, comment: string) => {
    if (!user || !orderId) return;

    setSubmittingReview(productId);

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
      
      setReviewStatuses(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          hasReviewed: true,
          showForm: false
        }
      }));
    }

    setSubmittingReview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return notFound();
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[order.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/orders" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-gray-600 mt-2">
            Order placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-semibold">Order Status</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="font-semibold text-lg mb-6">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Customer Name</p>
                  <p className="font-semibold">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold">{order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold">{order.customer_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="font-semibold text-lg mb-6">Order Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Shipping Address</p>
                  <p className="font-semibold">{order.shipping_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-xl">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="font-semibold text-lg mb-6">Order Items</h2>
          <div className="space-y-6">
            {orderItems.map((item) => (
              <div key={item.id}>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {item.products?.image_url && (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.products?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    
                    {order?.status === 'delivered' && user && item.products?.id && (
                      <div>
                        {reviewStatuses[item.products.id]?.hasReviewed ? (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Reviewed
                          </span>
                        ) : reviewStatuses[item.products.id]?.canReview ? (
                          <button
                            onClick={() => toggleReviewForm(item.products.id)}
                            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Star className="w-4 h-4" />
                            Write Review
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Review not available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {order?.status === 'delivered' && 
                 user && 
                 item.products?.id && 
                 reviewStatuses[item.products.id]?.showForm && (
                  <ReviewFormInline
                    productId={item.products.id}
                    productName={item.products.name}
                    onSubmit={submitReview}
                    onCancel={() => toggleReviewForm(item.products.id)}
                    submitting={submittingReview === item.products.id}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewFormInlineProps {
  productId: string;
  productName: string;
  onSubmit: (productId: string, rating: number, comment: string) => void;
  onCancel: () => void;
  submitting: boolean;
}

function ReviewFormInline({ productId, productName, onSubmit, onCancel, submitting }: ReviewFormInlineProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(productId, rating, comment);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium mb-3">Review: {productName}</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-xl focus:outline-none hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Share your experience..."
            maxLength={500}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}