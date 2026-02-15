'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string | null;
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(name, image_url)')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
    } else {
      setOrderItems(data || []);
    }
  };

  const handleOrderClick = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // If changing to cancelled, restore stock
    if (newStatus === 'cancelled' && selectedOrder?.status !== 'cancelled') {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItems) {
        for (const item of orderItems) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock + item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Error updating order status');
      console.error(error);
    } else {
      alert('Order status updated successfully');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Orders</h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No orders yet.
                </div>
              ) : (
                <div className="divide-y">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className={`w-full p-6 text-left hover:bg-gray-50 transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">
                            {order.customer_email}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="font-bold">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Order Details</h2>
            </div>
            {selectedOrder ? (
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{' '}
                      {selectedOrder.customer_name}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      {selectedOrder.customer_email}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{' '}
                      {selectedOrder.customer_phone}
                    </p>
                    <p>
                      <span className="text-gray-600">Address:</span>{' '}
                      {selectedOrder.shipping_address}
                    </p>
                    <p>
                      <span className="text-gray-600">Date:</span>{' '}
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Update Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusUpdate(selectedOrder.id, e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 bg-gray-50 rounded"
                      >
                        {item.products?.image_url && (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">
                            {item.products?.name || 'Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
