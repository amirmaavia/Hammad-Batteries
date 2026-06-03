'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signupUser } from '@/lib/ecommerce';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await signupUser(name, email, password);
      router.push('/store');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to create account.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-shell">
        <section className="auth-card">
          <div className="admin-login-icon">
            <UserPlus size={28} />
          </div>
          <h1 className="title" style={{ fontSize: '2.4rem' }}>Create Account</h1>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Sign up to checkout and track orders.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error ? <div className="status-banner status-error">{error}</div> : null}
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Create Account</button>
          </form>

          <p className="auth-switch">Already have an account? <Link className="theme-link" href="/login">Login</Link></p>
        </section>
      </main>
      <Footer />
    </>
  );
}
