'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PackageCheck, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentStatusPanel from '@/components/PaymentStatusPanel';
import { getCurrentUser, getOrders, restoreCurrentUserFromCookie, type StoreOrder, type StoreUser } from '@/lib/ecommerce';

export default function OrdersPage() {
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    const refreshOrders = async () => {
      const user = getCurrentUser() || await restoreCurrentUserFromCookie();
      setCurrentUser(user);
      setOrders(user ? await getOrders(user.id) : []);
    };

    window.addEventListener('auth-update', refreshOrders);
    queueMicrotask(refreshOrders);
    return () => window.removeEventListener('auth-update', refreshOrders);
  }, []);

  const userOrders = useMemo(() => orders, [orders]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="orders-header">
          <div>
            <h1 className="title" style={{ fontSize: '2.6rem' }}>My Orders</h1>
            <p className="subtitle" style={{ margin: 0 }}>Track your order status, payment method, and delivery address.</p>
          </div>
          <ShoppingBag size={36} />
        </div>

        {!currentUser ? (
          <div className="theme-card product-empty-state">
            <PackageCheck size={48} />
            <h2>Login to view orders</h2>
            <p className="subtitle">Your orders are connected with your customer account.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        ) : userOrders.length === 0 ? (
          <div className="theme-card product-empty-state">
            <PackageCheck size={48} />
            <h2>No orders yet</h2>
            <p className="subtitle">After checkout, your order and status will appear here.</p>
            <Link href="/store" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {userOrders.map((order) => (
              <article className="theme-card order-card" key={order.id}>
                <PaymentStatusPanel order={order} />
                <div className="order-card-head">
                  <div>
                    <strong>Order {order.id.slice(-8).toUpperCase()}</strong>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="order-tag-row">
                    <span className={`order-status order-status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
                <div className="status-banner status-success">
                  Your order is confirmed. We received your order and will contact you before delivery.
                </div>
                {order.status === 'Shipped' ? (
                  <div className="status-banner status-info">
                    Your order has shipped{order.shippedAt ? ` on ${new Date(order.shippedAt).toLocaleString()}` : ''}.
                  </div>
                ) : null}

                <div className="order-meta-grid">
                  <div>
                    <span>Payment</span>
                    <strong>{order.paymentStatus}</strong>
                  </div>
                  <div>
                    <span>Subtotal</span>
                    <strong>Rs. {(order.subtotal || 0).toLocaleString('en-PK')}</strong>
                  </div>
                  <div>
                    <span>Delivery Charge</span>
                    <strong>Rs. {(order.deliveryCharge || 0).toLocaleString('en-PK')}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>Rs. {order.total.toLocaleString('en-PK')}</strong>
                  </div>
                  <div>
                    <span>Promo</span>
                    <strong>{order.discountCode ? `${order.discountCode} (-Rs. ${(order.discountAmount || 0).toLocaleString('en-PK')})` : 'None'}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{order.customerPhone}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>{order.deliveryAddress}, {order.deliveryCity}</strong>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <strong>{order.shippedAt ? new Date(order.shippedAt).toLocaleString() : order.status === 'Shipped' ? 'Shipped' : 'Not shipped yet'}</strong>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item._id}`} className="order-item-line">
                      <span>{item.name}</span>
                      <strong>x{item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
