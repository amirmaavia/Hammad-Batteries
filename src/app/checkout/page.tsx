import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutPageClient from '@/components/CheckoutPageClient';

export const metadata = {
  title: 'Checkout | Hammad Batteries',
  description: 'Add shipping details and choose Cash on Delivery or online payment at Hammad Batteries.',
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="page-shell" style={{ textAlign: 'center' }}>Loading checkout...</div>}>
          <CheckoutPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
