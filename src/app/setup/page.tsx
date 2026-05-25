'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_ROUTES } from '../../lib/api-routes';
import { useAppDispatch } from '@/store/hooks';
import { setItems } from '@/store/itemsSlice';

interface Product {
  _id: string;
  name: string;
  brand: string;
  subCategory: string;
  defaultPrice: string;
  originalPrice: string;
  stock: string;
}

export default function SetupPage() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Initializing database...');
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        setError('');

        setStatus('Step 1: Initializing database with default items...');
        const initResponse = await fetch('/api/init-db');
        const initResult = await initResponse.json();

        if (!initResult.success) {
          throw new Error(initResult.error || 'Failed to initialize database');
        }

        setStatus(`Step 2: Database initialized! Found ${initResult.insertedCount || initResult.count} items`);

        setStatus('Step 3: Fetching all items from database...');
        const itemsResponse = await fetch(API_ROUTES.items);
        const itemsResult = await itemsResponse.json();

        if (!itemsResult.success) {
          throw new Error(itemsResult.error || 'Failed to fetch items');
        }

        setProducts(itemsResult.data);
        dispatch(setItems(itemsResult.data));
        setStatus(`Success! Database ready with ${itemsResult.data.length} products`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Setup failed');
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <h1 className="title" style={{ fontSize: '2.5rem' }}>Database Setup</h1>

        <div className={`status-banner ${loading ? 'status-warning' : error ? 'status-error' : 'status-success'}`}>
          {status}
        </div>

        {error && (
          <div className="status-banner status-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {products.length > 0 && (
          <div>
            <h2>Products in Database ({products.length})</h2>
            <div className="theme-table-wrap">
              <table className="theme-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Default Price</th>
                    <th>Original Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>{product.subCategory}</td>
                      <td style={{ fontWeight: 'bold' }}>{product.defaultPrice}</td>
                      <td>{product.originalPrice}</td>
                      <td
                        style={{
                          color: product.stock === 'In Stock' ? 'var(--success-text)' : 'var(--danger)',
                          fontWeight: 'bold',
                        }}
                      >
                        {product.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="theme-card status-info" style={{ marginTop: '20px' }}>
              <h3>Navigation Links:</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.75rem' }}>
                <li style={{ marginBottom: '10px' }}>
                  <Link href="/products" className="theme-link">View All Products</Link>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <Link href="/admin" className="theme-link">Go to Admin Panel</Link>
                </li>
                <li>
                  <Link href="/" className="theme-link">Go to Homepage</Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="status-banner status-warning" style={{ marginTop: '20px' }}>
            No products found in database
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
