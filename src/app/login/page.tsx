'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { loginUser, restoreCurrentUserFromCookie } from '@/lib/ecommerce';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    void restoreCurrentUserFromCookie().then((user) => {
      if (!mounted || !user) return;

      const next = searchParams.get('next');
      router.replace(next?.startsWith('/') ? next : user.role === 'admin' ? '/admin' : '/store');
    });

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const user = await loginUser(email, password);
      const next = searchParams.get('next');
      router.push(next?.startsWith('/') ? next : next === 'cart' ? '/store' : user.role === 'admin' ? '/admin' : '/store');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-shell">
        <section className="auth-card">
          <div className="admin-login-icon">
            <LockKeyhole size={28} />
          </div>
          <h1 className="title" style={{ fontSize: '2.4rem' }}>Login</h1>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Access your account, orders, and admin tools.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error ? <div className="status-banner status-error">{error}</div> : null}
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Login</button>
          </form>

          <p className="auth-switch">New customer? <Link className="theme-link" href="/signup">Create an account</Link></p>
          <p className="auth-hint">New accounts are users. Admins can change roles from the admin panel.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
