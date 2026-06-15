import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartPageClient from '@/components/CartPageClient';

export const metadata = {
  title: 'Cart | Hammad Batteries',
  description: 'Review your cart, add delivery details, and checkout securely at Hammad Batteries.',
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="page-shell" style={{ textAlign: 'center' }}>Loading cart...</div>}>
          <CartPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
