'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { ArrowLeft, BadgeInfo, ChevronLeft, ChevronRight, ImageOff, PackageCheck, ShoppingCart, Smartphone, Tag } from 'lucide-react';
import { CatalogItem, getPrimaryProductImage, getProductImages } from '../../../lib/catalog';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItemById } from '@/store/itemsSlice';
import { cartStore } from '@/lib/cart';

function ItemImage({ item }: { item: CatalogItem }) {
  const images = getProductImages(item);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || '';

  const showPrevious = () => setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);

  if (activeImage) {
    return (
      <div className="product-detail-gallery">
        <div className="product-detail-image-wrap">
          <Image
            src={activeImage}
            alt={item.name}
            width={900}
            height={900}
            unoptimized
            className={`product-detail-image product-card-image-${item.imageFit ?? 'fit'}`}
          />
          {images.length > 1 ? (
            <>
              <button className="gallery-arrow gallery-arrow-left" type="button" onClick={showPrevious} aria-label="Previous product image">
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-arrow gallery-arrow-right" type="button" onClick={showNext} aria-label="Next product image">
                <ChevronRight size={20} />
              </button>
            </>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="product-detail-thumbs">
            {images.map((image, index) => (
              <button
                className={`product-detail-thumb${index === activeIndex ? ' active' : ''}`}
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show product image ${index + 1}`}
              >
                <Image src={image} alt={`${item.name} ${index + 1}`} width={120} height={120} unoptimized className={`product-detail-thumb-image product-card-image-${item.imageFit ?? 'fit'}`} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="product-detail-image product-detail-image-fallback">
      <Smartphone size={72} />
      <span>No product image added yet</span>
    </div>
  );
}

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const itemId = params.id; // Keep as string for _id comparison
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.items);
  const item = items.find((currentItem) => String(currentItem._id || currentItem.id) === itemId);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!item) {
      dispatch(fetchItemById(itemId));
    }
  }, [dispatch, item, itemId]);

  const handleAddToCart = () => {
    if (!item) return;
    cartStore.addItem({
      _id: String(item._id || item.id),
      name: item.name,
      brand: item.brand,
      defaultPrice: item.defaultPrice,
      image: getPrimaryProductImage(item),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: '7rem' }}>
        <section className="section">
          <div className="container">
            <Link href="/" className="btn btn-outline" style={{ marginBottom: '2rem' }}>
              <ArrowLeft size={18} />
              Back to Items
            </Link>
{loading ? (
              <div className="card product-empty-state">
                <p style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Loading item details...</p>
                <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
                  Please wait while we load the product information.
                </p>
              </div>
            ) :
            item ? (
              <div className="product-detail-layout">
                <div className="card product-detail-media-card">
                  <ItemImage item={item} />
                </div>

                <div className="card product-detail-content">
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className={`badge ${item.brand === 'Samsung' ? 'badge-samsung' : item.brand === 'Apple' ? 'badge-apple' : ''}`}>
                      {item.brand}
                    </span>
                    <span className="badge" style={{ background: 'var(--badge-bg)' }}>
                      {item.subCategory}
                    </span>
                  </div>

                  <h1 className="title" style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{item.name}</h1>
                  <p className="subtitle" style={{ margin: 0, maxWidth: 'unset' }}>
                    {item.description || 'Full product detail page for the selected battery item. Admin-added products also open here with the same layout.'}
                  </p>

                  <div className="product-detail-stats">
                    <div className="product-detail-stat">
                      <Tag size={18} />
                      <div>
                        <span className="product-detail-stat-label">Price</span>
                        <strong className="price">{item.defaultPrice}</strong>
                      </div>
                    </div>

                    <div className="product-detail-stat">
                      <PackageCheck size={18} />
                      <div>
                        <span className="product-detail-stat-label">Stock</span>
                        <strong>{item.stock}</strong>
                      </div>
                    </div>

                    <div className="product-detail-stat">
                      <BadgeInfo size={18} />
                      <div>
                        <span className="product-detail-stat-label">Category</span>
                        <strong>{item.subCategory}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="product-detail-actions">
                    <button className={`btn ${added ? 'btn-success' : 'btn-primary'}`} onClick={handleAddToCart}>
                      <ShoppingCart size={18} />
                      {added ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                    <Link href="/admin" className="btn btn-outline">
                      View in Admin
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card product-empty-state">
                <ImageOff size={56} />
                <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Item not found</h1>
                <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
                  This product may have been deleted from the admin panel or is not available in this browser yet.
                </p>
                <Link href="/" className="btn btn-primary">
                  Go to Homepage
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
