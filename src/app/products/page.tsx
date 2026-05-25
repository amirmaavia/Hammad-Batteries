'use client';

import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItems } from '@/store/itemsSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items: products, loading, loaded, error } = useAppSelector((state) => state.items);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchItems());
    }
  }, [dispatch, loaded]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page-shell">
          <div className="theme-card" style={{ textAlign: 'center' }}>
            <h1>Loading Products...</h1>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <h1 className="title" style={{ fontSize: '2.5rem' }}>Products in Database</h1>

        {error && (
          <div className="status-banner status-error">
            Error: {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="theme-card theme-muted">
            No products found in database
          </div>
        ) : (
          <div>
            <p className="theme-muted" style={{ marginBottom: '20px' }}>
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
      </main>
      <Footer />
    </>
  );
}
