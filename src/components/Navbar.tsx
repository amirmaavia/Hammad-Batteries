'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, LogOut, MessageCircle, Phone, Search, ShoppingCart, UserRound, X } from 'lucide-react';
import { getWhatsAppLink, DISPLAY_PHONE_NUMBER, WHATSAPP_MESSAGES } from '../lib/site';
import ThemeToggle from './ThemeToggle';
import logoLight from '../assets/logo/logo-light.png';
import logoDark from '../assets/logo/logo-dark.png';
import { cartStore } from '../lib/cart';
import { getCurrentUser, logoutUser, restoreCurrentUserFromCookie, type StoreUser } from '../lib/ecommerce';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);

  const refreshCart = () => setCartCount(cartStore.getTotalCount());

  useEffect(() => {
    window.addEventListener('cart-update', refreshCart);
    queueMicrotask(refreshCart);
    return () => window.removeEventListener('cart-update', refreshCart);
  }, []);

  useEffect(() => {
    const refreshUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener('auth-update', refreshUser);
    let mounted = true;

    queueMicrotask(() => {
      refreshUser();
      void restoreCurrentUserFromCookie().then((user) => {
        if (mounted) setCurrentUser(user);
      });
    });

    return () => {
      mounted = false;
      window.removeEventListener('auth-update', refreshUser);
    };
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      window.location.href = `/store?search=${encodeURIComponent(query)}`;
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <a href={getWhatsAppLink(WHATSAPP_MESSAGES.productSupport)} target="_blank" rel="noreferrer" className="top-bar-phone">
            <Phone size={14} />
            <span>{DISPLAY_PHONE_NUMBER}</span>
          </a>
          <span className="top-bar-center">Standard delivery Rs. 300 on every order</span>
          <Link href="/cart" className="top-bar-cart" aria-label="Open cart">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <header className="header">
        <div className="container header-main">
          <Link href="/" className="logo cursor-pointer">
            <Image src={logoLight} alt="Hammad Batteries logo" className="logo-image logo-image-light" priority />
            <Image src={logoDark} alt="Hammad Batteries logo" className="logo-image logo-image-dark" priority />
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search batteries, brands, models..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" className="header-search-btn" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          <div className="header-right">
            <button
              className="mobile-search-btn btn btn-outline"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title="Search"
              type="button"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            {currentUser ? (
              <button
                className="btn btn-outline btn-mobile-icon"
                onClick={() => {
                  void logoutUser();
                  setCurrentUser(null);
                }}
                aria-label="Logout"
                title="Logout"
                type="button"
              >
                <LogOut size={16} />
                <span className="btn-text">{currentUser.name}</span>
              </button>
            ) : (
              <Link href="/login" className="btn btn-outline btn-mobile-icon" aria-label="Login" title="Login">
                <UserRound size={16} />
                <span className="btn-text">Login</span>
              </Link>
            )}
            <Link href="/cart" className="header-cart-btn btn btn-outline" aria-label="Open cart">
              <ShoppingCart size={18} />
              <span className="btn-text">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button
              className="mobile-menu-btn btn btn-outline"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Menu"
              type="button"
            >
              {mobileMenuOpen ? <X size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        <nav className={`secondary-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="container secondary-nav-inner">
            {currentUser ? <Link href="/orders" className="sec-nav-link" onClick={closeMobileMenu}>Orders</Link> : null}
            {currentUser?.role === 'admin' ? <Link href="/admin" className="sec-nav-link" onClick={closeMobileMenu}>Admin</Link> : null}
            <Link href="/" className="sec-nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link href="/store" className="sec-nav-link" onClick={closeMobileMenu}>Store</Link>
            <Link href="/cart" className="sec-nav-link" onClick={closeMobileMenu}>Cart</Link>
            <Link href="/#categories" className="sec-nav-link" onClick={closeMobileMenu}>Categories</Link>
            <Link href="/#new-arrivals" className="sec-nav-link" onClick={closeMobileMenu}>New Arrivals</Link>
            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.productSupport)}
              target="_blank"
              rel="noreferrer"
              className="sec-nav-link"
              onClick={closeMobileMenu}
            >
              Support Center
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

      <div style={{ height: '8.5rem' }} />

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <form className="search-overlay-form" onSubmit={handleSearch} onClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      )}
    </>
  );
}
