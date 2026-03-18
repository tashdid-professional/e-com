import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Grid3X3, Layers } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  stock: number;
  price: number;
  discount_price?: number | null;
}

type CategorySummary = {
  name: string;
  totalProducts: number;
  inStockProducts: number;
  sampleImage: string | null;
  minPrice: number;
};

export const revalidate = 0;

export default async function CategoriesPage() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, image_url, stock, price, discount_price');

  if (error) {
    console.error('Error fetching categories:', error);
  }

  const products = (data as Product[]) || [];

  const categoryMap = new Map<string, CategorySummary>();

  for (const product of products) {
    const rawCategory = (product.category ?? '').trim();
    if (!rawCategory) {
      continue;
    }

    const key = rawCategory.toLowerCase();
    const effectivePrice = product.discount_price ?? product.price;
    const existing = categoryMap.get(key);

    if (!existing) {
      categoryMap.set(key, {
        name: rawCategory,
        totalProducts: 1,
        inStockProducts: product.stock > 0 ? 1 : 0,
        sampleImage: product.image_url,
        minPrice: effectivePrice,
      });
      continue;
    }

    existing.totalProducts += 1;
    if (product.stock > 0) {
      existing.inStockProducts += 1;
    }

    if (!existing.sampleImage && product.image_url) {
      existing.sampleImage = product.image_url;
    }

    if (effectivePrice < existing.minPrice) {
      existing.minPrice = effectivePrice;
    }
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-2">Browse</p>
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">Shop By Category</h1>
              <p className="text-sm sm:text-lg text-gray-600 mt-3 max-w-2xl">
                Explore every collection in one place. Open a category to jump straight into filtered products.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full px-4 py-2">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">{categories.length} categories</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {categories.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
              <Grid3X3 className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No categories yet</h2>
            <p className="text-gray-600 mb-6">
              Add product categories from your admin panel to make this page live.
            </p>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Manage Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {category.sampleImage ? (
                      <img
                        src={category.sampleImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Grid3X3 className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center justify-center text-xs font-semibold rounded-full bg-gray-100 text-gray-700 px-2.5 py-1">
                        {category.totalProducts}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p>{category.inStockProducts} in stock</p>
                      <p>Starting at ${category.minPrice.toFixed(2)}</p>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black">
                      View products
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
              >
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
