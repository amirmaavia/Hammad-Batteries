'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Search, ShoppingCart, Phone, X, ChevronDown } from 'lucide-react';
import { getCartOrderMessage, getWhatsAppLink, DISPLAY_PHONE_NUMBER, WHATSAPP_MESSAGES } from '../lib/site';
import ThemeToggle from './ThemeToggle';
import logoLight from '../assets/logo/logo-light.png';
import logoDark from '../assets/logo/logo-dark.png';

export type CartItem = {
  _id: string;
  name: string;
  brand: string;
  defaultPrice: string;
  image?: string;
  quantity: number;
};

// Global Cart Store (simple in-memory + localStorage)
export const cartStore = {
  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('hb_cart') || '[]');
    } catch { return []; }
  },
  addItem(item: Omit<CartItem, 'quantity'>) {
    const items = this.getItems();
    const existing = items.find(i => i._id === item._id);
    if (existing) { existing.quantity += 1; }
    else { items.push({ ...item, quantity: 1 }); }
    localStorage.setItem('hb_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-update'));
  },
  removeItem(id: string) {
    const items = this.getItems().filter(i => i._id !== id);
    localStorage.setItem('hb_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-update'));
  },
  getTotalCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  },
  clear() {
    localStorage.removeItem('hb_cart');
    window.dispatchEvent(new Event('cart-update'));
  }
};

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshCart = () => {
    const items = cartStore.getItems();
    setCartItems(items);
    setCartCount(cartStore.getTotalCount());
  };

  useEffect(() => {
    window.addEventListener('cart-update', refreshCart);
    queueMicrotask(refreshCart);
    return () => window.removeEventListener('cart-update', refreshCart);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/store?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      {/* ── TOP UTILITY BAR ── */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <a href={getWhatsAppLink(WHATSAPP_MESSAGES.productSupport)} target="_blank" rel="noreferrer" className="top-bar-phone">
            <Phone size={14} />
            <span>{DISPLAY_PHONE_NUMBER}</span>
          </a>
          <span className="top-bar-center">🚚 Free Delivery on orders above Rs. 10,000</span>
          <button className="top-bar-cart" onClick={() => setCartOpen(true)} aria-label="Open cart">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="header">
        <div className="container header-main">
          {/* Logo */}
          <Link href="/" className="logo cursor-pointer">
            <Image src={logoLight} alt="Hammad Batteries logo" className="logo-image logo-image-light" priority />
            <Image src={logoDark} alt="Hammad Batteries logo" className="logo-image logo-image-dark" priority />
          </Link>

          {/* Search Bar */}
          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search batteries, brands, models…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="header-search-btn" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Right Actions */}
          <div className="header-right">
            <ThemeToggle />
            <button
              className="header-cart-btn btn btn-outline"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              <span className="btn-text">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button
              className="mobile-menu-btn btn btn-outline"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* ── SECONDARY NAV ── */}
        <nav className={`secondary-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="container secondary-nav-inner">
            <Link href="/" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link>
            <Link href="/store" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>🛒 Store</Link>
            <Link href="/#categories" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>📱 Categories</Link>
            <Link href="/#new-arrivals" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>✨ New Arrivals</Link>
            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.productSupport)}
              target="_blank" rel="noreferrer"
              className="sec-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              💬 Support Center
            </a>
            <div className="sec-nav-right">
              <a href={getWhatsAppLink(WHATSAPP_MESSAGES.generalInquiry)} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm btn-mobile-icon">
                <MessageCircle size={16} />
                <span className="btn-text">WhatsApp</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Header spacer */}
      <div style={{ height: '8.5rem' }} />

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h3>🛒 Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="cart-close-btn"><X size={22} /></button>
            </div>
            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingCart size={48} style={{ opacity: 0.3 }} />
                  <p>Your cart is empty</p>
                  <Link href="/store" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setCartOpen(false)}>
                    Browse Store
                  </Link>
                </div>
              ) : (
                <ul className="cart-items-list">
                  {cartItems.map(item => (
                    <li key={item._id} className="cart-item">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="cart-item-img" unoptimized />
                      ) : (
                        <div className="cart-item-img cart-item-img-placeholder"><ShoppingCart size={24} /></div>
                      )}
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-brand">{item.brand}</span>
                        <span className="cart-item-price">{item.defaultPrice}</span>
                      </div>
                      <div className="cart-item-qty">×{item.quantity}</div>
                      <button className="cart-remove-btn" onClick={() => cartStore.removeItem(item._id)}>
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => cartStore.clear()}>Clear Cart</button>
                <a
                  href={getWhatsAppLink(getCartOrderMessage(cartItems))}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-whatsapp"
                >
                  <MessageCircle size={16} /> Order via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <form className="search-overlay-form" onSubmit={handleSearch} onClick={e => e.stopPropagation()}>
            <input autoFocus type="text" placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      )}
    </>
  );
}
