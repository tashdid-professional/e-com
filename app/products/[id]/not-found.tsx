import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
