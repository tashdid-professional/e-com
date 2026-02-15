'use client';

import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  image_url: string | null;
  stock: number;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

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

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.stock === 0}
      className={`flex-1 ${
        isAdded
          ? 'bg-green-500 text-white'
          : 'bg-black text-white hover:bg-gray-800'
      } px-8 py-3 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg`}
    >
      <ShoppingBag className="w-6 h-6" />
      {product.stock === 0 ? 'Out of Stock' : isAdded ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
