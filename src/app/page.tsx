'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { cartStore } from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import {
  ArrowRight, MessageCircle, Zap,
  Shield, Truck, BadgeDollarSign, Lock, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CatalogItem, loadCatalogItems } from '../lib/catalog';
import { getWhatsAppLink } from '../lib/site';

/* ────────────────── Services slider data ────────────────── */
const SERVICES = [
  {
    icon: <MessageCircle size={32} color="#25d366" />,
    title: 'WhatsApp Support',
    desc: '24/7 instant support via WhatsApp. Get help anytime, anywhere.',
    color: '#25d366',
    bg: 'rgba(37, 211, 102, 0.12)',
  },
  {
    icon: <Truck size={32} color="#60a5fa" />,
    title: 'Free Delivery',
    desc: 'Free home delivery on all orders above Rs. 3,000 across Pakistan.',
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
  },
  {
    icon: <Shield size={32} color="#f472b6" />,
    title: 'Damage Protection',
    desc: 'Every battery is QC-tested & shipped with protective packaging.',
    color: '#f472b6',
    bg: 'rgba(244, 114, 182, 0.12)',
  },
  {
    icon: <Lock size={32} color="#a78bfa" />,
    title: 'Safe & Secure Payment',
    desc: 'Cash on delivery or secure online transfer — your choice.',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.12)',
  },
  {
    icon: <BadgeDollarSign size={32} color="#fbbf24" />,
    title: 'Low Price Guaranteed',
    desc: 'We match any lower price you find. Best value, always.',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
  },
];

/* Brand Details */
const BRAND_META: Record<string, { emoji: string; color: string }> = {
  samsung: { emoji: 'S', color: '#1d4ed8' },
  apple: { emoji: 'A', color: '#6b7280' },
  oppo: { emoji: 'O', color: '#059669' },
  vivo: { emoji: 'V', color: '#059669' },
  huawei: { emoji: 'H', color: '#dc2626' },
  xiaomi: { emoji: 'X', color: '#ea580c' },
  redmi: { emoji: 'R', color: '#ea580c' },
  infinix: { emoji: 'I', color: '#ca8a04' },
  tecno: { emoji: 'T', color: '#ca8a04' },
};

const BRAND_FALLBACKS = [
  { emoji: 'B', color: '#60a5fa' },
  { emoji: 'M', color: '#f59e0b' },
  { emoji: 'P', color: '#a855f7' },
  { emoji: 'Q', color: '#10b981' },
];

const getBrandMeta = (brand: string, index: number) => {
  const key = brand.toLowerCase().split(/\s|\/|-/)[0];
  return BRAND_META[key] ?? BRAND_FALLBACKS[index % BRAND_FALLBACKS.length];
};

function ServicesSlider() {
  const [current, setCurrent] = useState(0);
  const total = SERVICES.length;

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % total), 3500);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <h2 className="title" style={{ fontSize: '2.5rem' }}>Our <span className="text-gradient">Services</span></h2>
          <p className="subtitle">Why thousands of customers trust Hammad Batteries</p>
        </div>

        {/* Desktop: all cards */}
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card" style={{ '--svc-color': s.color, '--svc-bg': s.bg } as React.CSSProperties}>
              <div className="service-icon-wrap">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: slider */}
        <div className="services-slider">
          <button className="slider-btn" onClick={prev}><ChevronLeft size={20} /></button>
          <div className="service-card service-card-solo" style={{ '--svc-color': SERVICES[current].color, '--svc-bg': SERVICES[current].bg } as React.CSSProperties}>
            <div className="service-icon-wrap">{SERVICES[current].icon}</div>
            <h3 className="service-title">{SERVICES[current].title}</h3>
            <p className="service-desc">{SERVICES[current].desc}</p>
          </div>
          <button className="slider-btn" onClick={next}><ChevronRight size={20} /></button>
        </div>
        <div className="slider-dots">
          {SERVICES.map((_, i) => (
            <button key={i} className={`slider-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalogItems().then(items => {
      const reversed = [...items].reverse();
      setModels(reversed);
      setLoading(false);
    });
  }, []);

  // New Arrivals = latest 4 items
  const newArrivals = models.slice(0, 4);

  const groupedBrands = useMemo(() => (
    models.reduce<Record<string, string[]>>((acc, m) => {
        if (!acc[m.brand]) acc[m.brand] = [];
        if (!acc[m.brand].includes(m.subCategory)) acc[m.brand].push(m.subCategory);
        return acc;
      }, {})
  ), [models]);

  const brandSummaries = useMemo(() => (
    Object.entries(groupedBrands)
      .sort(([firstBrand], [secondBrand]) => firstBrand.localeCompare(secondBrand))
      .map(([brand, subCategories], index) => {
        const meta = getBrandMeta(brand, index);
        const categoryPreview = subCategories.slice(0, 3).join(', ');
        const remainingCount = subCategories.length - 3;

        return {
          brand,
          subCategories,
          emoji: meta.emoji,
          color: meta.color,
          desc: `${subCategories.length} categor${subCategories.length === 1 ? 'y' : 'ies'}${categoryPreview ? `: ${categoryPreview}` : ''}${remainingCount > 0 ? ` +${remainingCount} more` : ''}.`,
        };
      })
  ), [groupedBrands]);

  const handleAddToCart = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    cartStore.addItem({
      _id: String(item._id || item.id),
      name: item.name,
      brand: item.brand,
      defaultPrice: item.defaultPrice,
      image: item.image,
    });
    setAddedId(String(item._id || item.id));
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <>
      <Navbar />

      <main>
        {/* ── HERO ── */}
        <section id="home" className="hero">
          <div className="hero-bg-glow" />
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '9999px', color: '#60a5fa', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <Zap size={16} fill="#60a5fa" /> Professional Mobile Battery Shop
            </div>
            <h1 className="title">
              Power Up Your Devices <br />
              With <span className="text-gradient">Hammad Batteries</span>
            </h1>
            <p className="subtitle" style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '800px' }}>
              Pakistan&apos;s most trusted mobile battery supplier — highest quality, lowest prices, and free delivery above Rs. 3,000.
            </p>
            <div className="hero-actions">
              <Link href="/store" className="btn btn-primary btn-mobile-icon" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                <span className="btn-text">Shop Now</span> <ArrowRight size={20} />
              </Link>
              <a href={getWhatsAppLink("Assalam o Alaikum, I want to ask about your battery items.")} target="_blank" rel="noreferrer" className="btn btn-outline btn-mobile-icon" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                <MessageCircle size={20} color="#25d366" /> <span className="btn-text">Chat with Us</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── SERVICES SLIDER ── */}
        <ServicesSlider />

        {/* ── BRAND DETAILS BANNER ── */}
        <section id="brands" className="section brand-banner-section">
          <div className="brand-banner-bg" />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="section-header">
              <h2 className="title" style={{ fontSize: '2.5rem' }}>Supported <span className="text-gradient">Brands</span></h2>
              <p className="subtitle">We cover batteries for every major smartphone brand in Pakistan.</p>
            </div>
            <div className="brands-detail-grid">
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}><h3>Loading...</h3></div>
              ) : brandSummaries.map((b) => (
                <Link
                  key={b.brand}
                  href={`/store?brand=${encodeURIComponent(b.brand)}`}
                  className="brand-detail-card"
                  style={{ '--brand-color': b.color } as React.CSSProperties}
                >
                  <div className="brand-emoji">{b.emoji}</div>
                  <h3 className="brand-name">{b.brand}</h3>
                  <p className="brand-desc">{b.desc}</p>
                  <span className="btn btn-sm brand-filter-btn" style={{ marginTop: '0.75rem' }}>
                    View Products →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES (old) ── */}
        {/* ── NEW ARRIVALS (last 4 by date) ── */}
        <section id="new-arrivals" className="section new-arrivals-section">
          <div className="container">
            <div className="section-header">
              <div className="new-arrivals-badge">
                <Star size={16} fill="#fbbf24" color="#fbbf24" /> New Arrivals
              </div>
              <h2 className="title" style={{ fontSize: '2.5rem' }}>Latest <span className="text-gradient">Products</span></h2>
              <p className="subtitle">The 4 most recently added batteries — always fresh stock.</p>
            </div>
            <div className="grid grid-cols-4">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="skeleton-card" />)
              ) : newArrivals.map(item => {
                const id = String(item._id || item.id);
                const isAdded = addedId === id;
                return (
                  <ProductCard
                    key={id}
                    item={item}
                    isAdded={isAdded}
                    isNew
                    animationDuration="0.5s"
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href="/store" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
                View All Products <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── ALL ITEMS (filterable) ── */}
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      <a
        href={getWhatsAppLink("Assalam o Alaikum, I want to contact Hammad Batteries.")}
        target="_blank"
        rel="noreferrer"
        className="floating-wa"
        title="Contact us on WhatsApp"
      >
        <MessageCircle size={32} />
      </a>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </>
  );
}
