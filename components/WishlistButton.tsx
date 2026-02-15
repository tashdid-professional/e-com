'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  image_url: string | null;
}

export default function WishlistButton({ product }: { product: Product }) {
  const { addItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleWishlist = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image_url: product.image_url,
    });
  };

  return (
    <button
      onClick={handleWishlist}
      className={`border-2 px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold ${
        inWishlist
          ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
          : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
      }`}
    >
      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
      {inWishlist ? 'In Wishlist' : 'Wishlist'}
    </button>
  );
}
