'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CatalogItem, DEFAULT_ITEMS, loadCatalogItems, saveCatalogItems } from '../../lib/catalog';
import { DISPLAY_PHONE_NUMBER, getWhatsAppLink } from '../../lib/site';
import { Headphones, LockKeyhole, LogOut, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';

type ItemForm = {
  name: string;
  brand: string;
  subCategory: string;
  price: string;
  stock: string;
};

const EMPTY_FORM: ItemForm = {
  name: '',
  brand: '',
  subCategory: '',
  price: '',
  stock: '',
};

const ADMIN_AUTH_KEY = 'hammad-batteries-admin-auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [items, setItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const sortedItems = useMemo(
    () => [...items].sort((firstItem, secondItem) => secondItem.id - firstItem.id),
    [items]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanItem = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      subCategory: form.subCategory.trim(),
      price: form.price.trim(),
      stock: form.stock.trim(),
    };

    if (!cleanItem.name || !cleanItem.brand || !cleanItem.subCategory || !cleanItem.price || !cleanItem.stock) {
      return;
    }

    const updatedItems =
      editingId === null
        ? [{ id: Date.now(), ...cleanItem }, ...items]
        : items.map((item) => (item.id === editingId ? { ...item, ...cleanItem } : item));

    setItems(updatedItems);
    saveCatalogItems(updatedItems);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (item: CatalogItem) => {
    setForm({
      name: item.name,
      brand: item.brand,
      subCategory: item.subCategory,
      price: item.price,
      stock: item.stock,
    });
    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    saveCatalogItems(updatedItems);

    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const handleReset = () => {
    setItems(DEFAULT_ITEMS);
    saveCatalogItems(DEFAULT_ITEMS);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
      window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return;
    }

    setLoginError('Wrong username or password.');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setLoginError('');
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />

        <main style={{ paddingTop: '7rem' }}>
          <section className="section">
            <div className="container admin-login-wrap">
              <div className="card admin-login-card">
                <div className="section-header" style={{ marginBottom: '2rem' }}>
                  <div className="admin-login-icon">
                    <LockKeyhole size={28} />
                  </div>
                  <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Admin Login</h1>
                  <p className="subtitle" style={{ maxWidth: '520px' }}>
                    First login, then the admin panel will open.
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      className="form-input"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                    />
                  </div>

                  {loginError ? (
                    <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{loginError}</p>
                  ) : null}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <LockKeyhole size={18} />
                    <span className="btn-text">Login</span>
                  </button>
                </form>

                {/* <div className="admin-login-help">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                </div> */}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: '7rem' }}>
        <section className="section">
          <div className="container">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h1 className="title" style={{ fontSize: '3rem' }}>Admin Panel</h1>
              <p className="subtitle" style={{ margin: 0, maxWidth: '900px' }}>
                Add new battery items, edit existing items, or delete old ones. Homepage items update from this panel on the same browser.
              </p>
            </div>

            <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem' }}>{editingId === null ? 'Add Item' : 'Edit Item'}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      Contact: {DISPLAY_PHONE_NUMBER}
                    </span>
                    <button type="button" className="btn btn-outline btn-mobile-icon" onClick={handleLogout} aria-label="Logout" title="Logout">
                      <LogOut size={16} />
                      <span className="btn-text">Logout</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input className="form-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Samsung Galaxy S24 Ultra Battery" />
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Brand</label>
                      <input className="form-input" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} placeholder="Samsung" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sub Category</label>
                      <input className="form-input" value={form.subCategory} onChange={(event) => setForm({ ...form, subCategory: event.target.value })} placeholder="S Series" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Price</label>
                      <input className="form-input" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Rs. 14,999" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock Status</label>
                      <input className="form-input" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="In Stock" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn btn-primary btn-mobile-icon" aria-label={editingId === null ? 'Add item' : 'Save changes'} title={editingId === null ? 'Add item' : 'Save changes'}>
                      {editingId === null ? <Plus size={18} /> : <Save size={18} />}
                      <span className="btn-text">{editingId === null ? 'Add Item' : 'Save Changes'}</span>
                    </button>

                    <button type="button" className="btn btn-outline" onClick={() => {
                      setEditingId(null);
                      setForm(EMPTY_FORM);
                    }} aria-label="Clear form" title="Clear form">
                      <X size={18} />
                      <span className="btn-text">Clear Form</span>
                    </button>

                    <button type="button" className="btn btn-outline btn-mobile-icon" onClick={handleReset} aria-label="Reset default items" title="Reset default items">
                      <RotateCcw size={18} />
                      <span className="btn-text">Reset Default Items</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem' }}>Current Items</h2>
                  <a href={getWhatsAppLink("Assalam o Alaikum, I want admin support for the battery website.")} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-mobile-icon" aria-label="Support" title="Support">
                    <Headphones size={18} />
                    <span className="btn-text">Support</span>
                  </a>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {sortedItems.map((item) => (
                    <div key={item.id} style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem', background: 'var(--surface-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{item.name}</h3>
                          <div>
                            <span className={`badge ${item.brand === 'Samsung' ? 'badge-samsung' : item.brand === 'Apple' ? 'badge-apple' : ''}`}>{item.brand}</span>
                            <span className="badge" style={{ background: 'var(--badge-bg)' }}>{item.subCategory}</span>
                          </div>
                        </div>
                        <span className="card-tag" style={{ position: 'static', whiteSpace: 'nowrap' }}>{item.stock}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                        <strong className="price">{item.price}</strong>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-outline btn-mobile-icon" onClick={() => handleEdit(item)} aria-label={`Edit ${item.name}`} title="Edit">
                            <Pencil size={16} />
                            <span className="btn-text">Edit</span>
                          </button>
                          <button type="button" className="btn btn-mobile-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }} onClick={() => handleDelete(item.id)} aria-label={`Delete ${item.name}`} title="Delete">
                            <Trash2 size={16} />
                            <span className="btn-text">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
