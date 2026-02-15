import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import { Tag, TrendingUp, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
  created_at: string;
  secondary_image?: string | null;
}

export const revalidate = 0;

export default async function Home() {
  // Fetch products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  const productsList = (products as Product[]) || [];

  // Fetch secondary images for all products
  let productsWithSecondary = productsList;
  
  if (productsList.length > 0) {
    const productIds = productsList.map(p => p.id);
    const { data: secondaryImages } = await supabase
      .from('product_images')
      .select('product_id, image_url')
      .in('product_id', productIds)
      .eq('display_order', 0)
      .order('display_order');

    // Map secondary images to products
    productsWithSecondary = productsList.map(product => {
      const secondaryImg = secondaryImages?.find(img => img.product_id === product.id);
      return {
        ...product,
        secondary_image: secondaryImg?.image_url || null
      };
    });
  }
  
  // Get products by category for featured sections
  const featuredProducts = productsWithSecondary.slice(0, 3);
  const saleProducts = productsWithSecondary.slice(3, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <Hero />

      {/* Features Section */}
      <section className="py-12 bg-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-black rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $100</p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-black rounded-full mb-4">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing guaranteed</p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-black rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Handpicked products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sale Section */}
      {saleProducts.length > 0 && (
        <section className="py-16 bg-linear-to-br from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                LIMITED TIME OFFER
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Flash Sale
              </h2>
              <p className="text-xl text-gray-600">
                Up to 50% off on selected items
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600">
                Handpicked favorites just for you
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">All Products</h2>
            <p className="text-xl text-gray-600">
              Browse our complete collection
            </p>
          </div>
          {productsWithSecondary.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products available yet. Add products from the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productsWithSecondary.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Get exclusive access to new products, special offers, and style tips
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
}
