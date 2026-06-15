'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cartStore, type CartItem } from '@/lib/cart';
import { STANDARD_DELIVERY_CHARGE } from '@/lib/ecommerce';

function priceToNumber(price: string) {
  return Number(price.replace(/[^\d]/g, '')) || 0;
}

export default function CartPageClient() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshCart = () => setCartItems(cartStore.getItems());

  useEffect(() => {
    window.addEventListener('cart-update', refreshCart);
    queueMicrotask(refreshCart);
    return () => window.removeEventListener('cart-update', refreshCart);
  }, []);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + priceToNumber(item.defaultPrice) * item.quantity, 0);
    const deliveryCharge = STANDARD_DELIVERY_CHARGE;
    const total = subtotal + deliveryCharge;
    return { subtotal, deliveryCharge, total };
  }, [cartItems]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-page">
      <section className="cart-page-hero">
        <div className="container cart-page-hero-inner">
          <div>
            <span className="hero-kicker"><ShoppingBag size={16} /> Cart review</span>
            <h1 className="title">Your Cart</h1>
            <p className="subtitle">Review your selected batteries before moving to checkout.</p>
          </div>
          <div className="cart-page-metrics">
            <div><strong>{itemCount}</strong><span>Items</span></div>
            <div><strong>Rs. {totals.total.toLocaleString('en-PK')}</strong><span>Total</span></div>
          </div>
        </div>
      </section>

      <div className="container cart-page-grid">
        <section className="theme-card cart-main-panel">
          <div className="cart-section-head">
            <div>
              <h2>Cart Items</h2>
              <span>{cartItems.length ? `${cartItems.length} product line${cartItems.length > 1 ? 's' : ''}` : 'No products selected'}</span>
            </div>
            {cartItems.length > 0 ? (
              <button className="btn btn-outline btn-sm" type="button" onClick={() => cartStore.clear()}>
                <Trash2 size={15} /> Clear
              </button>
            ) : null}
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty cart-page-empty">
              <ShoppingCart size={52} style={{ opacity: 0.3 }} />
              <p>Your cart is empty</p>
              <Link href="/store" className="btn btn-primary">Browse Store</Link>
            </div>
          ) : (
            <ul className="cart-page-items">
              {cartItems.map((item) => (
                <li key={item._id} className="cart-page-item">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={96} height={96} className="cart-item-img cart-page-item-img" unoptimized />
                  ) : (
                    <div className="cart-item-img cart-page-item-img cart-item-img-placeholder"><ShoppingCart size={26} /></div>
                  )}
                  <div className="cart-page-item-info">
                    <strong>{item.name}</strong>
                    <span>{item.brand}</span>
                    <span className="cart-item-price">{item.defaultPrice}</span>
                  </div>
                  <div className="qty-control" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => cartStore.updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => cartStore.updateQuantity(item._id, item.quantity + 1)} aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong className="cart-line-total">Rs. {(priceToNumber(item.defaultPrice) * item.quantity).toLocaleString('en-PK')}</strong>
                  <button className="cart-remove-btn" type="button" onClick={() => cartStore.removeItem(item._id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="cart-side-panel">
          <section className="theme-card cart-checkout-panel">
            <div className="cart-section-head">
              <div>
                <h2>Order Summary</h2>
                <span>Standard delivery Rs. 300</span>
              </div>
            </div>

            <div className="cart-total-row"><span>Subtotal</span><strong>Rs. {totals.subtotal.toLocaleString('en-PK')}</strong></div>
            <div className="cart-total-row"><span>Delivery</span><strong>Rs. {totals.deliveryCharge.toLocaleString('en-PK')}</strong></div>
            <div className="cart-total-row cart-total-final"><span>Total</span><strong>Rs. {totals.total.toLocaleString('en-PK')}</strong></div>

            <Link
              href={cartItems.length > 0 ? '/checkout' : '/store'}
              className="btn btn-primary cart-checkout-trigger"
            >
              <ShoppingBag size={16} />
              {cartItems.length > 0 ? 'Checkout' : 'Browse Store'}
            </Link>
          </section>

          <section className="cart-assurance-grid">
            <div><Truck size={18} /><span>Delivery in major Pakistan cities</span></div>
            <div><ShieldCheck size={18} /><span>Secure online checkout</span></div>
            <div><PackageCheck size={18} /><span>Order confirmation by phone</span></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
