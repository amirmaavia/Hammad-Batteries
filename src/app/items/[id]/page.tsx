'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { ArrowLeft, BadgeInfo, ImageOff, MessageCircle, PackageCheck, Smartphone, Tag } from 'lucide-react';
import { CatalogItem, loadCatalogItems } from '../../../lib/catalog';
import { getWhatsAppLink } from '../../../lib/site';

function ItemImage({ item }: { item: CatalogItem }) {
  if (item.image) {
    return <Image src={item.image} alt={item.name} width={800} height={800} unoptimized className="product-detail-image" />;
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
  const itemId = Number(params.id);
  const item = loadCatalogItems().find((entry) => entry.id === itemId);

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

            {item ? (
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
                    Full product detail page for the selected battery item. Admin-added products also open here with the same layout.
                  </p>

                  <div className="product-detail-stats">
                    <div className="product-detail-stat">
                      <Tag size={18} />
                      <div>
                        <span className="product-detail-stat-label">Price</span>
                        <strong className="price">{item.price}</strong>
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
                    <a
                      href={getWhatsAppLink(`Assalam o Alaikum, I'm interested in ${item.name} (${item.price}).`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-whatsapp"
                    >
                      <MessageCircle size={18} />
                      Ask on WhatsApp
                    </a>
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
