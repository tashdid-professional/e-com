'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type ShopFiltersProps = {
  initialQuery: string;
  initialSort: string;
  initialCategory: string;
  initialStock: string;
  initialLimit: number;
  categories: string[];
  allowedLimits: number[];
};

export default function ShopFilters({
  initialQuery,
  initialSort,
  initialCategory,
  initialStock,
  initialLimit,
  categories,
  allowedLimits,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const isFirstSearchSync = useRef(true);

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const searchParamsString = useMemo(() => currentSearchParams.toString(), [currentSearchParams]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsString);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    params.set('page', '1');

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  useEffect(() => {
    if (isFirstSearchSync.current) {
      isFirstSearchSync.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      updateParams({ q: query.trim() });
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <div className="lg:col-span-2">
        <label htmlFor="q" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="q"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, category, or keyword"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={initialCategory}
          onChange={(event) => updateParams({ category: event.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Sort By
        </label>
        <select
          id="sort"
          name="sort"
          value={initialSort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="name-a-z">Name: A to Z</option>
          <option value="name-z-a">Name: Z to A</option>
        </select>
      </div>

      <div>
        <label htmlFor="stock" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Availability
        </label>
        <select
          id="stock"
          name="stock"
          value={initialStock}
          onChange={(event) => updateParams({ stock: event.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <div>
        <label htmlFor="limit" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Per Page
        </label>
        <select
          id="limit"
          name="limit"
          value={String(initialLimit)}
          onChange={(event) => updateParams({ limit: event.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
        >
          {allowedLimits.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>

      <div className="lg:col-span-5 flex flex-wrap gap-3 pt-1">
        <Link
          href="/shop"
          className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Clear All
        </Link>
      </div>
    </div>
  );
}
