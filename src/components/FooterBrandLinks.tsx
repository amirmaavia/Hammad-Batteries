'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchItems } from '@/store/itemsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function FooterBrandLinks() {
  const dispatch = useAppDispatch();
  const { items, loaded, loading } = useAppSelector((state) => state.items);

  useEffect(() => {
    if (!loaded && !loading) {
      dispatch(fetchItems());
    }
  }, [dispatch, loaded, loading]);

  const brands = useMemo(() => {
    const uniqueBrands = new Map<string, string>();

    for (const item of items) {
      const brand = item.brand?.trim();

      if (brand && !uniqueBrands.has(brand.toLowerCase())) {
        uniqueBrands.set(brand.toLowerCase(), brand);
      }
    }

    return Array.from(uniqueBrands.values()).slice(0, 4);
  }, [items]);

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {brands.map((brand) => (
        <li key={brand}>
          <Link href={`/store?brand=${encodeURIComponent(brand)}`} className="nav-link">
            {brand}
          </Link>
        </li>
      ))}
    </ul>
  );
}
