'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Banknote, CreditCard, PackageCheck, ShoppingBag, ShoppingCart, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cartStore, type CartItem } from '@/lib/cart';
import {
  createOrder,
  getCurrentUser,
  restoreCurrentUserFromCookie,
  STANDARD_DELIVERY_CHARGE,
  updateUserProfile,
  validatePromoCode,
  type AppliedPromo,
  type StoreUser,
} from '@/lib/ecommerce';

const PENDING_STRIPE_ORDER_KEY = 'hb_pending_stripe_order_id';

function priceToNumber(price: string) {
  return Number(price.replace(/[^\d]/g, '')) || 0;
}

export default function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const handledStripeReturnRef = useRef(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [stripeStatus, setStripeStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [stripeMessage, setStripeMessage] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [codConfirmOpen, setCodConfirmOpen] = useState(false);
  const [codStatus, setCodStatus] = useState<'idle' | 'loading'>('idle');
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    landmark: '',
    instructions: '',
  });

  const refreshCart = () => setCartItems(cartStore.getItems());

  useEffect(() => {
    window.addEventListener('cart-update', refreshCart);
    queueMicrotask(refreshCart);
    return () => window.removeEventListener('cart-update', refreshCart);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const user = getCurrentUser() || await restoreCurrentUserFromCookie();
      if (!mounted) return;

      if (!user) {
        window.location.href = '/login?next=/checkout';
        return;
      }

      setCurrentUser(user);
      setDeliveryForm((current) => ({
        ...current,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      }));
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const stripeReturn = searchParams.get('stripe');
    if (!stripeReturn || handledStripeReturnRef.current) return;

    handledStripeReturnRef.current = true;

    if (stripeReturn === 'success') {
      void (async () => {
        const pendingOrder = localStorage.getItem(PENDING_STRIPE_ORDER_KEY);
        const sessionId = searchParams.get('session_id');

        try {
          if (!pendingOrder || !sessionId) {
            throw new Error('Missing Stripe payment confirmation details.');
          }

          const response = await fetch('/api/checkout/stripe/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: JSON.parse(pendingOrder), sessionId }),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Unable to confirm Stripe payment.');
          }

          localStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
          cartStore.clear();
          setCheckoutStatus('success');
          setCheckoutMessage('Your order is confirmed. Payment received and your cart has been cleared.');
          window.history.replaceState(null, '', '/checkout');
        } catch {
          setCheckoutStatus('error');
          setCheckoutMessage('Payment could not be confirmed, so no order was created. Please contact support if money was deducted.');
        }
      })();
    } else if (stripeReturn === 'cancelled') {
      localStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
      setCheckoutStatus('error');
      setCheckoutMessage('Stripe checkout was cancelled. Your cart is still saved.');
      window.history.replaceState(null, '', '/checkout');
    }
  }, [searchParams]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + priceToNumber(item.defaultPrice) * item.quantity, 0);
    const discountAmount = Math.min(subtotal, appliedPromo?.discountAmount || 0);
    const deliveryCharge = STANDARD_DELIVERY_CHARGE;
    const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;
    return { subtotal, discountAmount, deliveryCharge, total };
  }, [appliedPromo?.discountAmount, cartItems]);

  const composedDeliveryAddress = () => [
    deliveryForm.address.trim(),
    deliveryForm.landmark.trim() ? `Landmark: ${deliveryForm.landmark.trim()}` : '',
    deliveryForm.instructions.trim() ? `Instructions: ${deliveryForm.instructions.trim()}` : '',
  ].filter(Boolean).join(', ');

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoStatus('error');
      setPromoMessage('Please enter a promo code.');
      return;
    }

    setPromoStatus('loading');
    setPromoMessage('');

    try {
      const promo = await validatePromoCode(promoCode.trim(), totals.subtotal);
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
    if (cartItems.length === 0) {
      setCheckoutStatus('error');
      setCheckoutMessage('Your cart is empty.');
      return false;
    }

    if (!currentUser) {
      window.location.href = '/login?next=/checkout';
      return false;
    }

    if (!deliveryForm.name.trim() || !deliveryForm.phone.trim() || !deliveryForm.city.trim() || !deliveryForm.address.trim()) {
      setCheckoutStatus('error');
      setCheckoutMessage('Please add your full name, required phone number, city, and shipping address.');
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
    deliveryAddress: composedDeliveryAddress(),
    deliveryCity: deliveryForm.city.trim(),
    items: cartItems,
    subtotal: totals.subtotal,
    discountCode: appliedPromo?.code || '',
    discountAmount: totals.discountAmount,
    deliveryCharge: totals.deliveryCharge,
    total: totals.total,
  });

  const startStripeCheckout = async () => {
    if (!(await requireCheckoutDetails())) return;

    setStripeStatus('loading');
    setStripeMessage('');
    setCheckoutMessage('');
    setCheckoutStatus('idle');

    try {
      const pendingOrder = {
        ...orderPayload(),
        paymentMethod: 'stripe',
        paymentStatus: 'Online Pending',
        status: 'Pending',
      };
      localStorage.setItem(PENDING_STRIPE_ORDER_KEY, JSON.stringify(pendingOrder));

      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, total: totals.total }),
      });

      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Unable to start Stripe checkout.');
      }

      window.location.href = result.url;
    } catch (error) {
      localStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
      setStripeStatus('error');
      setStripeMessage(error instanceof Error ? error.message : 'Unable to start Stripe checkout.');
    }
  };

  const placeCodOrder = () => {
    void (async () => {
      if (!(await requireCheckoutDetails())) return;
      setCodConfirmOpen(true);
    })();
  };

  const submitCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    if (paymentMethod === 'stripe') {
      void startStripeCheckout();
      return;
    }

    placeCodOrder();
  };

  const confirmCodOrder = () => {
    void (async () => {
      setCodStatus('loading');

      try {
        await createOrder({
          ...orderPayload(),
          paymentMethod: 'cod',
          paymentStatus: 'COD',
          status: 'Pending',
        });
        cartStore.clear();
        setCodConfirmOpen(false);
        setCheckoutStatus('success');
        setCheckoutMessage('Your order is confirmed. We will contact you before delivery.');
      } catch (error) {
        setCheckoutStatus('error');
        setCheckoutMessage(error instanceof Error ? error.message : 'Unable to place COD order.');
      } finally {
        setCodStatus('idle');
      }
    })();
  };

  return (
    <div className="cart-page">
      <section className="cart-page-hero">
        <div className="container cart-page-hero-inner">
          <div>
            <span className="hero-kicker"><ShoppingBag size={16} /> Checkout</span>
            <h1 className="title">Checkout</h1>
            <p className="subtitle">Add shipping details and choose Cash on Delivery or online payment.</p>
          </div>
          <div className="cart-page-metrics">
            <div><strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong><span>Items</span></div>
            <div><strong>Rs. {totals.total.toLocaleString('en-PK')}</strong><span>Total</span></div>
          </div>
        </div>
      </section>

      <div className="container cart-page-grid">
        <form className="theme-card cart-checkout-panel cart-form-panel" onSubmit={submitCheckout}>
          <div className="cart-section-head">
            <div>
              <h2>Shipping Form</h2>
              <span>Phone number, city, and shipping address are required</span>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty cart-page-empty">
              <ShoppingCart size={52} style={{ opacity: 0.3 }} />
              <p>{checkoutStatus === 'success' ? checkoutMessage : 'Your cart is empty'}</p>
              <Link href="/store" className="btn btn-primary">Browse Store</Link>
            </div>
          ) : (
            <>
              <div className="checkout-details cart-details-grid">
                <label className="cart-form-field">
                  <span>Full name</span>
                  <input className="form-input" required placeholder="Your full name" value={deliveryForm.name} onChange={(event) => setDeliveryForm({ ...deliveryForm, name: event.target.value })} />
                </label>
                <label className="cart-form-field">
                  <span>Phone number</span>
                  <input className="form-input" required type="tel" placeholder="Required phone number" value={deliveryForm.phone} onChange={(event) => setDeliveryForm({ ...deliveryForm, phone: event.target.value })} />
                </label>
                <label className="cart-form-field">
                  <span>Email</span>
                  <input className="form-input" placeholder="Account email" value={currentUser?.email || ''} disabled />
                </label>
                <label className="cart-form-field">
                  <span>City</span>
                  <input className="form-input" required placeholder="Required city" value={deliveryForm.city} onChange={(event) => setDeliveryForm({ ...deliveryForm, city: event.target.value })} />
                </label>
                <label className="cart-form-field cart-wide-field">
                  <span>Shipping address</span>
                  <textarea className="form-input" required placeholder="House/shop number, street, area, city details" rows={4} value={deliveryForm.address} onChange={(event) => setDeliveryForm({ ...deliveryForm, address: event.target.value })} />
                </label>
                <label className="cart-form-field">
                  <span>Nearest landmark</span>
                  <input className="form-input" placeholder="Optional landmark" value={deliveryForm.landmark} onChange={(event) => setDeliveryForm({ ...deliveryForm, landmark: event.target.value })} />
                </label>
                <label className="cart-form-field">
                  <span>Delivery instructions</span>
                  <input className="form-input" placeholder="Optional instructions" value={deliveryForm.instructions} onChange={(event) => setDeliveryForm({ ...deliveryForm, instructions: event.target.value })} />
                </label>
              </div>

              <div className="cart-payment-methods" role="radiogroup" aria-label="Payment method">
                <label className={`cart-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <Banknote size={18} />
                  <span><strong>Cash on Delivery</strong><small>Pay when your order is delivered.</small></span>
                </label>
                {/* <label className={`cart-payment-option ${paymentMethod === 'stripe' ? 'active' : ''}`}>
                  <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                  <CreditCard size={18} />
                  <span><strong>Online Payment</strong><small>Pay securely with card checkout.</small></span>
                </label> */}
              </div>

              {stripeMessage ? <div className="checkout-status status-error">{stripeMessage}</div> : null}
              {checkoutMessage && checkoutStatus !== 'idle' ? (
                <div className={`checkout-status ${checkoutStatus === 'success' ? 'status-success' : 'status-error'}`}>{checkoutMessage}</div>
              ) : null}

              <div className="cart-payment-actions">
                <button className="btn btn-primary" type="submit" disabled={stripeStatus === 'loading'}>
                  {paymentMethod === 'stripe' ? <CreditCard size={16} /> : <Banknote size={16} />}
                  {stripeStatus === 'loading' ? 'Opening Stripe...' : paymentMethod === 'stripe' ? 'Pay Online' : 'Place COD Order'}
                </button>
              </div>
            </>
          )}
        </form>

        <aside className="cart-side-panel">
          <section className="theme-card cart-checkout-panel">
            <div className="cart-section-head">
              <div>
                <h2>Order Summary</h2>
                <span>Standard delivery Rs. 300</span>
              </div>
            </div>

            <div className="cart-checkout-items">
              {cartItems.map((item) => (
                <div className="cart-checkout-item" key={item._id}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={48} height={48} className="cart-item-img" unoptimized />
                  ) : null}
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} x {item.defaultPrice}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total-row"><span>Subtotal</span><strong>Rs. {totals.subtotal.toLocaleString('en-PK')}</strong></div>
            {totals.discountAmount > 0 ? (
              <div className="cart-total-row cart-discount-row"><span>Promo {appliedPromo?.code}</span><strong>- Rs. {totals.discountAmount.toLocaleString('en-PK')}</strong></div>
            ) : null}
            <div className="cart-total-row"><span>Delivery</span><strong>Rs. {totals.deliveryCharge.toLocaleString('en-PK')}</strong></div>
            <div className="cart-total-row cart-total-final"><span>Total</span><strong>Rs. {totals.total.toLocaleString('en-PK')}</strong></div>

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
            {promoMessage ? <div className={`checkout-status ${promoStatus === 'success' ? 'status-success' : 'status-error'}`}>{promoMessage}</div> : null}

            <Link href="/cart" className="btn btn-outline">
              Back to Cart
            </Link>
          </section>

          <section className="cart-assurance-grid">
            <div><Truck size={18} /><span>Delivery in major Pakistan cities</span></div>
            <div><PackageCheck size={18} /><span>Order confirmation by phone</span></div>
          </section>
        </aside>
      </div>

      {codConfirmOpen && (
        <div className="cod-confirm-overlay" onClick={() => codStatus === 'idle' && setCodConfirmOpen(false)}>
          <div className="cod-confirm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cod-confirm-title">
            <div className="payment-status-layer payment-status-layer-cod">
              <div className="payment-status-step"><Banknote size={13} /></div>
              <div>
                <strong id="cod-confirm-title">Confirm Cash on Delivery order</strong>
                <span>Your order total is Rs. {totals.total.toLocaleString('en-PK')}. Payment will be collected when your order is delivered.</span>
              </div>
            </div>
            <div className="cod-confirm-summary">
              <div><span>Name</span><strong>{deliveryForm.name}</strong></div>
              <div><span>Phone</span><strong>{deliveryForm.phone}</strong></div>
              <div><span>Delivery</span><strong>{composedDeliveryAddress()}, {deliveryForm.city}</strong></div>
            </div>
            <div className="cod-confirm-actions">
              <button className="btn btn-outline" type="button" onClick={() => setCodConfirmOpen(false)} disabled={codStatus === 'loading'}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={confirmCodOrder} disabled={codStatus === 'loading'}>
                <Banknote size={16} />
                {codStatus === 'loading' ? 'Confirming...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
