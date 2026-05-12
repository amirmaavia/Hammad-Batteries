'use client';

import { useState } from 'react';

export default function InsertProductsPage() {
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
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to insert product');
        }
      }

      setMessage(`✅ Successfully inserted ${sampleProducts.length} products into database!`);
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Insert Sample Battery Products</h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p>Click the button below to insert 4 sample battery products into your MongoDB database.</p>
      </div>

      <button
        onClick={insertSampleProducts}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Inserting...' : 'Insert Sample Products'}
      </button>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Make sure MongoDB is running on localhost:27017</li>
          <li>Click the button above to insert sample products</li>
          <li>Visit <a href="/products">/products</a> to view all products</li>
          <li>Visit <a href="/">/</a> to see products on homepage</li>
        </ol>
      </div>
    </div>
  );
}
