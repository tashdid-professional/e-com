import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, DollarSign, TrendingUp, Star } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboard() {
  const [productsResult, ordersResult, reviewsResult] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact' }),
    supabase.from('orders').select('*', { count: 'exact' }),
    supabase.from('reviews').select('*', { count: 'exact' }),
  ]);

  const totalProducts = productsResult.count || 0;
  const totalOrders = ordersResult.count || 0;
  const totalReviews = reviewsResult.count || 0;
  
  type Order = {
    total_amount: number;
    status: string;
  };
  
  const orders = (ordersResult.data as Order[]) || [];
  
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending'
  ).length;

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <Package className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manage Products</h2>
            <p className="text-gray-600">
              Add, edit, or remove products from your store
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <ShoppingCart className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manage Orders</h2>
            <p className="text-gray-600">
              View and update order status and details
            </p>
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <Star className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manage Reviews</h2>
            <p className="text-gray-600">
              Approve, reject, and moderate customer reviews
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
