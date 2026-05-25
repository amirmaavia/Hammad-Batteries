'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAppDispatch } from '@/store/hooks';
import { saveItem } from '@/store/itemsSlice';

export default function InsertProductsPage() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const insertSampleProducts = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    const sampleProducts = [
      {
        name: "Samsung Galaxy S24 Ultra Battery",
        brand: "Samsung",
        subCategory: "S Series",
        defaultPrice: "Rs. 14,999",
        originalPrice: "Rs. 16,999",
        stock: "In Stock",
        image: "",
      },
    ];

    try {
      for (const product of sampleProducts) {
        await dispatch(saveItem(product)).unwrap();
      }

      setMessage(`✅ Successfully inserted ${sampleProducts.length} products into database!`);
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell page-shell-narrow">
        <h1 className="title" style={{ fontSize: '2.5rem' }}>Insert Sample Battery Products</h1>
      
        <div className="theme-card" style={{ marginBottom: '20px' }}>
          <p>Click the button below to insert sample battery products into your MongoDB database.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={insertSampleProducts}
          disabled={loading}
          style={{ marginBottom: '20px' }}
        >
          {loading ? 'Inserting...' : 'Insert Sample Products'}
        </button>

        {message && (
          <div className="status-banner status-success">
            {message}
          </div>
        )}

        {error && (
          <div className="status-banner status-error">
            {error}
          </div>
        )}

        <div className="theme-card status-info" style={{ marginTop: '30px' }}>
          <h3>Next Steps:</h3>
          <ol style={{ paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
            <li>Make sure MongoDB is running on localhost:27017</li>
            <li>Click the button above to insert sample products</li>
            <li>Visit <Link className="theme-link" href="/products">/products</Link> to view all products</li>
            <li>Visit <Link className="theme-link" href="/">/</Link> to see products on homepage</li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
