'use client';

import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  brand: string;
  subCategory: string;
  defaultPrice: string;
  originalPrice: string;
  stock: string;
  image?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/items');
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {products.map((product) => (
              <div key={product._id} style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Category:</strong> {product.subCategory}</p>
                <p><strong>Default Price:</strong> {product.defaultPrice}</p>
                {/* <p><strong>Original Price:</strong> {product.originalPrice}</p> */}
                <p><strong>Stock:</strong> <span style={{
                  color: product.stock === 'In Stock' ? 'green' : 'red'
                }}>
                  {product.stock}
                </span></p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  ID: {product._id}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
