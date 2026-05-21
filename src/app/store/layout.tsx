import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Store | Hammad Batteries',
  description: 'Browse our complete range of mobile batteries for Samsung, Apple, Oppo, Vivo, Huawei, Xiaomi and more.',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
