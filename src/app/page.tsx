'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, MessageCircle, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { CatalogItem, loadCatalogItems } from '../lib/catalog';
import { getWhatsAppLink } from '../lib/site';

export default function Home() {
  const [models] = useState<CatalogItem[]>(() => loadCatalogItems());

  const groupedBrands = models.reduce<Record<string, string[]>>((accumulator, model) => {
    if (!accumulator[model.brand]) {
      accumulator[model.brand] = [];
    }

    if (!accumulator[model.brand].includes(model.subCategory)) {
      accumulator[model.brand].push(model.subCategory);
    }

    return accumulator;
  }, {});

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-bg-glow"></div>
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '9999px', color: '#60a5fa', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <Zap size={16} fill="#60a5fa" /> Professional Mobile Battery Shop
            </div>

            <h1 className="title">
              Power Up Your Devices <br />
              With <span className="text-gradient">Hammad Batteries</span>
            </h1>

            <p className="subtitle" style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '800px' }}>
              We provide the highest quality mobile batteries for all top brands, dynamically updating our catalog to ensure you always get the latest items.
            </p>

            <div className="hero-actions">
              <a href="#brands" className="btn btn-primary btn-mobile-icon" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} aria-label="Shop categories" title="Shop categories">
                <span className="btn-text">Shop Categories</span> <ArrowRight size={20} />
              </a>
              <a href={getWhatsAppLink("Assalam o Alaikum, I want to ask about your battery items.")} target="_blank" rel="noreferrer" className="btn btn-outline btn-mobile-icon" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} aria-label="Chat with us" title="Chat with us">
                <MessageCircle size={20} color="#25d366" /> <span className="btn-text">Chat with Us</span>
              </a>
            </div>
          </div>
        </section>

        {/* Categories preview */}
        <section id="brands" className="section" style={{ background: 'var(--glass-bg)', position: 'relative' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="title" style={{ fontSize: '2.5rem' }}>Brands & Sub-Categories</h2>
              <p className="subtitle">Extensive support for all top brands including our specialized Samsung catalog.</p>
            </div>

            <div className="grid grid-cols-4" style={{ marginTop: '3rem' }}>
              {Object.entries(groupedBrands).map(([brand, subCategories], index) => (
                <div key={brand} className="card" style={index === 0 ? { borderColor: 'rgba(59, 130, 246, 0.4)' } : undefined}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Smartphone size={32} color={index % 4 === 0 ? "#60a5fa" : index % 4 === 1 ? "#e4e4e7" : index % 4 === 2 ? "#f43f5e" : "#a855f7"} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{brand}</h3>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--muted)' }}>
                    {subCategories.map((subCategory) => (
                      <li key={subCategory} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#10b981" /> {subCategory}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Automatic Entries */}
        <section id="recent" className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <div>
                <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Latest Battery Items</h2>
                <p className="subtitle" style={{ margin: 0 }}>These items can now be managed from the admin panel.</p>
              </div>
              {/* <a href="/admin" className="btn btn-outline" style={{ borderColor: '#60a5fa', color: '#60a5fa' }}>
                <Zap size={18} />
                Open Admin Panel
              </a> */}
            </div>

            <div className="grid grid-cols-3">
              {models.map((model) => (
                <div key={model.id} className="card" style={{ animation: 'fade-in 0.5s ease-out' }}>
                  <div className="card-tag">
                    {model.stock}
                  </div>
                  <div>
                    <span className={`badge ${model.brand === 'Samsung' ? 'badge-samsung' : 'badge-apple'}`}>
                      {model.brand}
                    </span>
                    <span className="badge" style={{ background: 'var(--badge-bg)' }}>
                      {model.subCategory}
                    </span>
                  </div>
                  <h3 className="card-title" style={{ marginTop: '1rem', fontSize: '1.4rem' }}>{model.name}</h3>
                  <div className="card-footer">
                    <span className="price">{model.price}</span>
                    <a href={getWhatsAppLink(`Assalam o Alaikum, I'm interested in ${model.name}`)} target="_blank" rel="noreferrer" className="btn btn-mobile-icon" style={{ padding: '0.5rem 1rem', background: 'var(--success-soft)', color: '#10b981' }} aria-label={`Ask about ${model.name} on WhatsApp`} title="Ask on WhatsApp">
                      <MessageCircle size={16} />
                      <span className="btn-text">Ask on WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating WhatsApp Action Button */}
      <a
        href={getWhatsAppLink("Assalam o Alaikum, I want to contact Hammad Batteries.")}
        target="_blank"
        rel="noreferrer"
        className="floating-wa"
        title="Contact us on WhatsApp"
      >
        <MessageCircle size={32} />
      </a>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </>
  );
}
