'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Calendar, DollarSign, Truck, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { canUserReviewProduct, hasUserReviewedProduct } from '@/lib/reviews';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderWithProducts extends Order {
  hasReviewableProducts?: boolean;
  hasUnreviewedProducts?: boolean;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reviewCheckLoading, setReviewCheckLoading] = useState(false);
  const [reviewStatusesChecked, setReviewStatusesChecked] = useState(false);

  useEffect(() => {
    checkUserAndFetchOrders();
  }, []);

  // Only run review check once when we have user and orders
  useEffect(() => {
    if (user && orders.length > 0 && !reviewStatusesChecked) {
      checkReviewStatuses();
    }
  }, [user, orders, reviewStatusesChecked]);

  const checkUserAndFetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      // Fetch orders by user email with review status check
      await fetchOrdersWithReviewStatus(user);
    }
    setLoading(false);
  };

  const fetchOrdersWithReviewStatus = async (user: any) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    const ordersData = data || [];
    
    // Check review statuses for delivered orders immediately
    setReviewCheckLoading(true);
    const ordersWithReviewStatus = await Promise.all(
      ordersData.map(async (order) => {
        if (order.status === 'delivered') {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id')
            .eq('order_id', order.id);

          if (orderItems && orderItems.length > 0) {
            let hasReviewableProducts = false;
            let hasUnreviewedProducts = false;

            for (const item of orderItems) {
              const [canReview, hasReviewed] = await Promise.all([
                canUserReviewProduct(user.id, item.product_id),
                hasUserReviewedProduct(user.id, item.product_id)
              ]);

              if (canReview) {
                hasReviewableProducts = true;
                if (!hasReviewed) {
                  hasUnreviewedProducts = true;
                  break; // Found at least one unreviewed, no need to check more
                }
              }
            }

            return {
              ...order,
              hasReviewableProducts,
              hasUnreviewedProducts
            };
          }
        }
        return order;
      })
    );

    setOrders(ordersWithReviewStatus);
    setReviewStatusesChecked(true);
    setReviewCheckLoading(false);
  };

  const checkReviewStatuses = async () => {
    // This is now handled in fetchOrdersWithReviewStatus
    // Keeping this function for compatibility but it's no longer needed
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return '✓';
      case 'shipped':
        return '→';
      case 'processing':
        return '⟳';
      case 'cancelled':
        return '✕';
      default:
        return '○';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="font-semibold">{order.customer_name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/order/${order.id}`}
                      className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap text-center"
                    >
                      View Details
                    </Link>
                    
                    {/* Review Status for Delivered Orders */}
                    {order.status === 'delivered' && order.hasReviewableProducts && (
                      <div className="flex flex-col gap-1">
                        {order.hasUnreviewedProducts ? (
                          <Link
                            href={`/order/${order.id}#reviews`}
                            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Star className="w-4 h-4" />
                            Write Review
                          </Link>
                        ) : (
                          <Link
                            href={`/order/${order.id}#reviews`}
                            className="inline-flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            View Reviews
                          </Link>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          {order.hasUnreviewedProducts ? 'Review your delivered products' : 'Reviews submitted'}
                        </p>
                      </div>
                    )}
                    
                    {/* Loading indicator for review check */}
                    {order.status === 'delivered' && reviewCheckLoading && !order.hasReviewableProducts && (
                      <div className="text-center text-xs text-gray-500">
                        Checking review eligibility...
                      </div>
                    )}
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
