import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Heart, Share2, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import ImageCarousel from '@/components/ImageCarousel';
import AddToCartButton from '@/components/AddToCartButton';
import WishlistButton from '@/components/WishlistButton';
import ReviewDisplay from '@/components/ReviewDisplay';
import ReviewForm from '@/components/ReviewForm';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price?: number | null;
  image_url: string | null;
  category: string | null;
  stock: number;
  created_at: string;
}

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  const typedProduct = product as Product;

  // Fetch additional images from product_images table
  const { data: productImages } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id)
    .order('display_order');

  // Create image array - use main image + additional images
  let images: string[] = [];
  
  // Add main image first if it exists
  if (typedProduct.image_url) {
    images.push(typedProduct.image_url);
  }
  
  // Add additional images
  if (productImages && productImages.length > 0) {
    images = images.concat(productImages.map(img => img.image_url));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery or Placeholder */}
          <div>
            {images.length > 0 ? (
              <ImageCarousel images={images} productName={typedProduct.name} />
            ) : (
              <div className="bg-gray-200 rounded-lg flex items-center justify-center aspect-square">
                <div className="text-center">
                  <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 font-semibold">No Image Available</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            {typedProduct.category && (
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">
                {typedProduct.category}
              </p>
            )}

            {/* Product Name */}
            <h1 className="text-4xl font-bold mb-4">{typedProduct.name}</h1>

            {/* Price */}
            <div className="mb-6">
              {typedProduct.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-green-600">
                    ${typedProduct.discount_price.toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-500 line-through">
                    ${typedProduct.price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((typedProduct.price - typedProduct.discount_price) / typedProduct.price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <div className="text-4xl font-bold">
                  ${typedProduct.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {typedProduct.stock === 0 ? (
                <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Out of Stock
                </span>
              ) : typedProduct.stock < 10 ? (
                <span className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Only {typedProduct.stock} left in stock
                </span>
              ) : (
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  In Stock
                </span>
              )}
            </div>

            {/* Description */}
            {typedProduct.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {typedProduct.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <AddToCartButton product={typedProduct} />
              <WishlistButton product={typedProduct} />
              <button className="border-2 border-gray-300 text-gray-700 p-3 rounded-lg hover:border-black hover:text-black transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-gray-100 p-3 rounded-full">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure payment</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-gray-100 p-3 rounded-full">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-gray-600">30 days return policy</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="border-t mt-8 pt-8">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Product ID:</dt>
                  <dd className="font-semibold">{typedProduct.id.slice(0, 8)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-semibold">{typedProduct.category || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Availability:</dt>
                  <dd className="font-semibold">
                    {typedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">SKU:</dt>
                  <dd className="font-semibold">SKU-{typedProduct.id.slice(0, 6).toUpperCase()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t mt-16 pt-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Reviews Display */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <ReviewDisplay productId={typedProduct.id} />
            </div>

            {/* Review Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
              <ReviewForm 
                productId={typedProduct.id}
                productName={typedProduct.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
