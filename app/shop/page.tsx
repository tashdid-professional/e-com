import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import { SlidersHorizontal } from 'lucide-react';

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
  secondary_image?: string | null;
}

type ShopSearchParams = {
  q?: string;
  sort?: string;
  category?: string;
  stock?: string;
  page?: string;
  limit?: string;
};

const DEFAULT_LIMIT = 12;
const ALLOWED_LIMITS = [8, 12, 16, 24];

const sortProducts = (products: Product[], sort: string) => {
  switch (sort) {
    case 'price-low-high':
      return [...products].sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    case 'price-high-low':
      return [...products].sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    case 'name-a-z':
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case 'name-z-a':
      return [...products].sort((a, b) => b.name.localeCompare(a.name));
    case 'oldest':
      return [...products].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'newest':
    default:
      return [...products].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
};

const createPageUrl = (
  currentParams: ShopSearchParams,
  updates: Partial<ShopSearchParams>
): string => {
  const params = new URLSearchParams();

  const merged: ShopSearchParams = {
    ...currentParams,
    ...updates,
  };

  (Object.keys(merged) as Array<keyof ShopSearchParams>).forEach((key) => {
    const value = merged[key];
    if (!value) {
      return;
    }

    params.set(key, value);
  });

  return params.toString() ? `/shop?${params.toString()}` : '/shop';
};

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<ShopSearchParams>;
}) {
  const resolvedParams = (await searchParams) ?? {};

  const query = (resolvedParams.q ?? '').trim();
  const sort = resolvedParams.sort ?? 'newest';
  const selectedCategory = resolvedParams.category ?? 'all';
  const stockFilter = resolvedParams.stock ?? 'all';

  const limitCandidate = Number(resolvedParams.limit ?? DEFAULT_LIMIT);
  const limit = ALLOWED_LIMITS.includes(limitCandidate) ? limitCandidate : DEFAULT_LIMIT;

  const pageCandidate = Number(resolvedParams.page ?? '1');
  const currentPage = Number.isFinite(pageCandidate) && pageCandidate > 0 ? Math.floor(pageCandidate) : 1;

  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products for shop:', error);
  }

  const productsList = (products as Product[]) || [];

  let productsWithSecondary = productsList;

  if (productsList.length > 0) {
    const productIds = productsList.map((product) => product.id);
    const { data: secondaryImages } = await supabase
      .from('product_images')
      .select('product_id, image_url')
      .in('product_id', productIds)
      .eq('display_order', 0)
      .order('display_order');

    productsWithSecondary = productsList.map((product) => {
      const secondaryImage = secondaryImages?.find((img) => img.product_id === product.id);

      return {
        ...product,
        secondary_image: secondaryImage?.image_url ?? null,
      };
    });
  }

  const categories = Array.from(
    new Set(
      productsWithSecondary
        .map((product) => product.category)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredProducts = productsWithSecondary.filter((product) => {
    const effectivePrice = product.discount_price ?? product.price;

    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (product.category ?? '').toLowerCase().includes(query.toLowerCase()) ||
      effectivePrice.toString().includes(query);

    const matchesCategory =
      selectedCategory === 'all' || (product.category ?? '').toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.stock > 0) ||
      (stockFilter === 'out-of-stock' && product.stock === 0);

    return matchesQuery && matchesCategory && matchesStock;
  });

  const sortedProducts = sortProducts(filteredProducts, sort);
  const totalProducts = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + limit);

  const startDisplay = totalProducts === 0 ? 0 : startIndex + 1;
  const endDisplay = totalProducts === 0 ? 0 : Math.min(startIndex + limit, totalProducts);

  const previousUrl = createPageUrl(resolvedParams, { page: String(Math.max(1, page - 1)) });
  const nextUrl = createPageUrl(resolvedParams, { page: String(Math.min(totalPages, page + 1)) });

  const pageWindowStart = Math.max(1, page - 2);
  const pageWindowEnd = Math.min(totalPages, page + 2);
  const visiblePages = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-2">Catalog</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Shop Products</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Discover premium picks with smart filters, search, and sorting.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-600 bg-gray-100 rounded-full px-4 py-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Browse</span>
            </div>
          </div>

          <ShopFilters
            initialQuery={query}
            initialSort={sort}
            initialCategory={selectedCategory}
            initialStock={stockFilter}
            initialLimit={limit}
            categories={categories}
            allowedLimits={ALLOWED_LIMITS}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startDisplay}</span>-
            <span className="font-semibold text-gray-900">{endDisplay}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalProducts}</span> products
          </p>
          {query && (
            <p className="text-sm text-gray-500">
              Search term: <span className="font-semibold text-gray-800">{query}</span>
            </p>
          )}
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No products found</h2>
            <p className="text-gray-600 mb-6">Try a different search, category, or stock filter.</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href={previousUrl}
                  aria-disabled={page === 1}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                    page === 1
                      ? 'pointer-events-none border-gray-200 text-gray-300 bg-gray-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Previous
                </Link>

                {visiblePages.map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={createPageUrl(resolvedParams, { page: String(pageNumber) })}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-semibold transition-colors ${
                      pageNumber === page
                        ? 'bg-black border-black text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                <Link
                  href={nextUrl}
                  aria-disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                    page === totalPages
                      ? 'pointer-events-none border-gray-200 text-gray-300 bg-gray-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
