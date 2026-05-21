'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { CatalogItem } from '../../lib/catalog';
import { API_ROUTES } from '../../lib/api-routes';

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ROUTES.items);
        const result = await response.json();

        if (result.success) {
          setProducts(result.data);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading Products...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Products in Database</h1>

      {error && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ color: 'gray', fontSize: '18px' }}>
          No products found in database
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Total Products: {products.length}
          </p>
          <div className="grid store-grid">
            {products.map((product) => (
              <ProductCard
                key={String(product._id || product.id)}
                item={product}
                titleFontSize="1.1rem"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
