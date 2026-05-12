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
}

export default function SetupPage() {
  const [status, setStatus] = useState('Initializing database...');
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        setError('');

        // Step 1: Initialize database with default items
        setStatus('Step 1: Initializing database with default items...');
        const initResponse = await fetch('/api/init-db');
        const initResult = await initResponse.json();

        if (!initResult.success) {
          throw new Error(initResult.error || 'Failed to initialize database');
        }

        setStatus(`Step 2: Database initialized! Found ${initResult.insertedCount || initResult.count} items`);

        // Step 2: Fetch all items
        setStatus('Step 3: Fetching all items from database...');
        const itemsResponse = await fetch('/api/items');
        const itemsResult = await itemsResponse.json();

        if (!itemsResult.success) {
          throw new Error(itemsResult.error || 'Failed to fetch items');
        }

        setProducts(itemsResult.data);
        setStatus(`✅ Success! Database ready with ${itemsResult.data.length} products`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('❌ Setup failed');
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔧 Database Setup</h1>

      {/* Status Section */}
      <div style={{
        padding: '20px',
        backgroundColor: loading ? '#fff3cd' : error ? '#f8d7da' : '#d4edda',
        color: loading ? '#856404' : error ? '#721c24' : '#155724',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '16px'
      }}>
        {status}
      </div>

      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Products Table */}
      {products.length > 0 && (
        <div>
          <h2>📦 Products in Database ({products.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Product Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Brand</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Default Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Original Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{product.name}</td>
                    <td style={{ padding: '12px' }}>{product.brand}</td>
                    <td style={{ padding: '12px' }}>{product.subCategory}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{product.defaultPrice}</td>
                    <td style={{
                      padding: '12px',
                      color: product.stock === 'In Stock' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {product.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigation Links */}
          <div style={{
            padding: '20px',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>🔗 Navigation Links:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <a href="/products" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>
                  → View All Products
                </a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="/admin" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>
                  → Go to Admin Panel
                </a>
              </li>
              <li>
                <a href="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '16px' }}>
                  → Go to Homepage
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          ⚠️ No products found in database
        </div>
      )}
    </div>
  );
}
