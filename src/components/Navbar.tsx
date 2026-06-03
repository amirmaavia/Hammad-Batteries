'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Banknote, CreditCard, LogOut, MessageCircle, Search, ShoppingCart, Phone, UserRound, X, ChevronDown } from 'lucide-react';
import { getWhatsAppLink, DISPLAY_PHONE_NUMBER, WHATSAPP_MESSAGES } from '../lib/site';
import ThemeToggle from './ThemeToggle';
import logoLight from '../assets/logo/logo-light.png';
import logoDark from '../assets/logo/logo-dark.png';
import { cartStore, type CartItem } from '../lib/cart';
import { createOrder, getCurrentUser, logoutUser, updateUserProfile, validatePromoCode, type AppliedPromo, type StoreUser } from '../lib/ecommerce';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [stripeMessage, setStripeMessage] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

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

  useEffect(() => {
    const refreshUser = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setDeliveryForm({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
        });
      }
    };
    window.addEventListener('auth-update', refreshUser);
    queueMicrotask(refreshUser);
    return () => window.removeEventListener('auth-update', refreshUser);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/store?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = Number(item.defaultPrice.replace(/[^\d]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);
  const discountAmount = Math.min(cartTotal, appliedPromo?.discountAmount || 0);
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const applyPromoCode = async () => {
    setPromoStatus('loading');
    setPromoMessage('');

    try {
      const promo = await validatePromoCode(promoCode, cartTotal);
      setAppliedPromo(promo);
      setPromoCode(promo.code);
      setPromoStatus('success');
      setPromoMessage(`${promo.code} applied. You saved Rs. ${promo.discountAmount.toLocaleString('en-PK')}.`);
    } catch (error) {
      setAppliedPromo(null);
      setPromoStatus('error');
      setPromoMessage(error instanceof Error ? error.message : 'Invalid promo code.');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoStatus('idle');
    setPromoMessage('');
  };

  const requireCheckoutDetails = async () => {
    if (!currentUser) {
      window.location.href = '/login?next=cart';
      return false;
    }

    if (!deliveryForm.name.trim() || !deliveryForm.phone.trim() || !deliveryForm.address.trim() || !deliveryForm.city.trim()) {
      setCheckoutStatus('error');
      setCheckoutMessage('Please add your name, phone, city, and delivery address.');
      return false;
    }

    const updatedUser = await updateUserProfile(currentUser.id, {
      name: deliveryForm.name.trim(),
      phone: deliveryForm.phone.trim(),
      address: deliveryForm.address.trim(),
      city: deliveryForm.city.trim(),
    });
    if (updatedUser) setCurrentUser(updatedUser);
    return true;
  };

  const orderPayload = () => ({
    userId: currentUser!.id,
    customerName: deliveryForm.name.trim(),
    customerEmail: currentUser!.email,
    customerPhone: deliveryForm.phone.trim(),
    deliveryAddress: deliveryForm.address.trim(),
    deliveryCity: deliveryForm.city.trim(),
    items: cartItems,
    subtotal: cartTotal,
    discountCode: appliedPromo?.code || '',
    discountAmount,
    total: finalTotal,
  });

  const startStripeCheckout = async () => {
    if (!(await requireCheckoutDetails())) return;

    setStripeStatus('loading');
    setStripeMessage('');
    setCheckoutMessage('');
    setCheckoutStatus('idle');

    try {
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, total: finalTotal }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Unable to start Stripe checkout.');
      }

      await createOrder({
        ...orderPayload(),
        paymentMethod: 'stripe',
        status: 'Pending',
      });

      window.location.href = result.url;
    } catch (error) {
      setStripeStatus('error');
      setStripeMessage(error instanceof Error ? error.message : 'Unable to start Stripe checkout.');
    }
  };

  const placeCodOrder = () => {
    void (async () => {
      if (!(await requireCheckoutDetails())) return;

      await createOrder({
        ...orderPayload(),
        paymentMethod: 'cod',
        status: 'Pending',
      });
      cartStore.clear();
      setCheckoutStatus('success');
      setCheckoutMessage('COD order placed. We will contact you to confirm delivery.');
    })();
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
            {currentUser ? (
              <button
                className="btn btn-outline btn-mobile-icon"
                onClick={() => {
                  logoutUser();
                  setCurrentUser(null);
                }}
                aria-label="Logout"
                title="Logout"
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
            {currentUser ? (
              <Link href="/orders" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            ) : null}
            {currentUser?.role === 'admin' ? (
              <Link href="/admin" className="sec-nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            ) : null}
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
                  <p>{checkoutStatus === 'success' ? checkoutMessage : 'Your cart is empty'}</p>
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
              <div className="cart-drawer-footer cart-checkout">
                <div className="cart-total-row">
                  <span>Total</span>
                  <strong>Rs. {finalTotal.toLocaleString('en-PK')}</strong>
                </div>
                {discountAmount > 0 ? (
                  <div className="cart-total-row cart-discount-row">
                    <span>Promo {appliedPromo?.code}</span>
                    <strong>- Rs. {discountAmount.toLocaleString('en-PK')}</strong>
                  </div>
                ) : null}

                <div className="promo-row">
                  <input
                    className="form-input"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    disabled={promoStatus === 'loading'}
                  />
                  {appliedPromo ? (
                    <button className="btn btn-outline" type="button" onClick={removePromoCode}>Remove</button>
                  ) : (
                    <button className="btn btn-outline" type="button" onClick={applyPromoCode} disabled={promoStatus === 'loading'}>
                      {promoStatus === 'loading' ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>
                {promoMessage ? (
                  <div className={`checkout-status ${promoStatus === 'success' ? 'status-success' : 'status-error'}`}>{promoMessage}</div>
                ) : null}

                <div className="checkout-details">
                  <input
                    className="form-input"
                    placeholder="Full name"
                    value={deliveryForm.name}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, name: event.target.value })}
                  />
                  <input
                    className="form-input"
                    placeholder="Phone number"
                    value={deliveryForm.phone}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, phone: event.target.value })}
                  />
                  <input
                    className="form-input"
                    placeholder="City"
                    value={deliveryForm.city}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, city: event.target.value })}
                  />
                  <textarea
                    className="form-input"
                    placeholder="Delivery address"
                    rows={3}
                    value={deliveryForm.address}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, address: event.target.value })}
                  />
                </div>

                {stripeMessage ? (
                  <div className="checkout-status status-error">{stripeMessage}</div>
                ) : null}
                {checkoutMessage && checkoutStatus !== 'idle' ? (
                  <div className={`checkout-status ${checkoutStatus === 'success' ? 'status-success' : 'status-error'}`}>{checkoutMessage}</div>
                ) : null}

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={startStripeCheckout}
                  disabled={stripeStatus === 'loading'}
                >
                  <CreditCard size={16} />
                  {stripeStatus === 'loading' ? 'Opening Stripe...' : 'Pay with Stripe'}
                </button>
                <button className="btn btn-outline" type="button" onClick={placeCodOrder}>
                  <Banknote size={16} />
                  Cash on Delivery
                </button>

                <div className="cart-actions-row">
                  <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => cartStore.clear()}>Clear Cart</button>
                  <Link href="/store" className="btn btn-outline" onClick={() => setCartOpen(false)}>Continue Shopping</Link>
                </div>
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
