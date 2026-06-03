'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Boxes, ImagePlus, LayoutDashboard, Percent, Plus, Save, Shield, ShoppingBag, Trash2, UsersRound, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CatalogItem } from '@/lib/catalog';
import { deleteDiscount, getCurrentUser, getDiscounts, getOrders, getUsers, saveDiscount, updateDiscount, updateOrderStatus, updateUserRole, type StoreDiscount, type StoreOrder, type StoreUser, type UserRole } from '@/lib/ecommerce';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteItemById, fetchItems, saveItem } from '@/store/itemsSlice';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'discounts' | 'users';

type ItemForm = {
  name: string;
  brand: string;
  subCategory: string;
  description: string;
  defaultPrice: string;
  originalPrice: string;
  stock: string;
  image: string;
  imageFit: NonNullable<CatalogItem['imageFit']>;
};

const EMPTY_FORM: ItemForm = {
  name: '',
  brand: '',
  subCategory: '',
  description: '',
  defaultPrice: '',
  originalPrice: '',
  stock: 'In Stock',
  image: '',
  imageFit: 'fit',
};

const tabs: Array<{ id: AdminTab; label: string; icon: ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'products', label: 'Products', icon: <Boxes size={16} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
  { id: 'discounts', label: 'Discounts', icon: <Percent size={16} /> },
  { id: 'users', label: 'Users', icon: <UsersRound size={16} /> },
];

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { items, loading, loaded } = useAppSelector((state) => state.items);
  const [currentUser, setCurrentUser] = useState<StoreUser | null>(null);
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [discounts, setDiscounts] = useState<StoreDiscount[]>([]);
  const [discountForm, setDiscountForm] = useState({ code: '', type: 'percent' as StoreDiscount['type'], value: 10 });

  useEffect(() => {
    const refreshAdminData = async () => {
      setCurrentUser(getCurrentUser());
      setUsers(await getUsers());
      setOrders(await getOrders());
      setDiscounts(await getDiscounts());
    };

    window.addEventListener('auth-update', refreshAdminData);
    queueMicrotask(refreshAdminData);
    return () => window.removeEventListener('auth-update', refreshAdminData);
  }, []);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchItems());
    }
  }, [dispatch, loaded]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => String(b._id || b.id || '').localeCompare(String(a._id || a.id || ''))),
    [items]
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file only.');
      event.target.value = '';
      return;
    }

    if (file.size > 1024 * 1024) {
      window.alert('Please use an image smaller than 1 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((currentForm) => ({ ...currentForm, image: typeof reader.result === 'string' ? reader.result : '' }));
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanItem = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      subCategory: form.subCategory.trim(),
      description: form.description.trim(),
      defaultPrice: form.defaultPrice.trim(),
      originalPrice: form.originalPrice.trim() || form.defaultPrice.trim(),
      stock: form.stock,
      image: form.image,
      imageFit: form.imageFit,
    };

    if (!cleanItem.name || !cleanItem.brand || !cleanItem.subCategory || !cleanItem.defaultPrice) return;

    await dispatch(saveItem(editingId === null ? cleanItem : ({ ...cleanItem, _id: editingId } as CatalogItem))).unwrap();
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (item: CatalogItem) => {
    setTab('products');
    setForm({
      name: item.name,
      brand: item.brand,
      subCategory: item.subCategory,
      description: item.description || '',
      defaultPrice: item.defaultPrice,
      originalPrice: item.originalPrice || item.defaultPrice,
      stock: item.stock,
      image: item.image || '',
      imageFit: item.imageFit || 'fit',
    });
    setEditingId(String(item._id || item.id));
  };

  const handleDelete = async (item: CatalogItem) => {
    const id = String(item._id || '');
    if (id) {
      await dispatch(deleteItemById(id)).unwrap();
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUsers(await updateUserRole(userId, role));
    setCurrentUser(getCurrentUser());
  };

  const handleOrderStatus = async (orderId: string, status: StoreOrder['status']) => {
    setOrders(await updateOrderStatus(orderId, status));
  };

  const handleDiscountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!discountForm.code.trim() || discountForm.value <= 0) return;
    setDiscounts(await saveDiscount({ ...discountForm, active: true }));
    setDiscountForm({ code: '', type: 'percent', value: 10 });
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <>
        <Navbar />
        <main className="page-shell page-shell-narrow">
          <div className="theme-card product-empty-state">
            <Shield size={48} />
            <h1 className="title" style={{ fontSize: '2.2rem' }}>Admin Access Required</h1>
            <p className="subtitle">Login with an admin account to manage store operations.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="admin-shell">
        <div className="container">
          <div className="admin-page-header">
            <div>
              <h1 className="title" style={{ fontSize: '2.8rem' }}>Admin Panel</h1>
              <p className="subtitle" style={{ margin: 0 }}>Manage products, orders, discounts, and customer roles.</p>
            </div>
            <span className="badge status-success">Signed in as {currentUser.name}</span>
          </div>

          <div className="admin-tabs">
            {tabs.map((item) => (
              <button key={item.id} className={`admin-tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'dashboard' ? (
            <section className="admin-grid">
              <div className="theme-card admin-metric"><span>Products</span><strong>{items.length}</strong></div>
              <div className="theme-card admin-metric"><span>Orders</span><strong>{orders.length}</strong></div>
              <div className="theme-card admin-metric"><span>Users</span><strong>{users.length}</strong></div>
              <div className="theme-card admin-metric"><span>Revenue</span><strong>Rs. {totalRevenue.toLocaleString('en-PK')}</strong></div>
            </section>
          ) : null}

          {tab === 'products' ? (
            <section className="admin-two-column">
              <div className="theme-card">
                <h2>{editingId === null ? 'Add Product' : 'Edit Product'}</h2>
                <form onSubmit={handleSubmit} className="admin-form">
                  <input className="form-input" placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                  <textarea className="form-input" placeholder="Description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                  <div className="admin-form-grid">
                    <input className="form-input" placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
                    <input className="form-input" placeholder="Category" value={form.subCategory} onChange={(event) => setForm({ ...form, subCategory: event.target.value })} />
                    <input className="form-input" placeholder="Sale price, e.g. Rs. 12,999" value={form.defaultPrice} onChange={(event) => setForm({ ...form, defaultPrice: event.target.value })} />
                    <input className="form-input" placeholder="Original price" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} />
                  </div>
                  <label className="admin-check"><input type="checkbox" checked={form.stock === 'In Stock'} onChange={(event) => setForm({ ...form, stock: event.target.checked ? 'In Stock' : 'Out of Stock' })} /> In Stock</label>
                  <select className="form-input" value={form.imageFit} onChange={(event) => setForm({ ...form, imageFit: event.target.value as ItemForm['imageFit'] })}>
                    <option value="fit">Fit full picture</option>
                    <option value="fill">Fill card</option>
                    <option value="zoom">Zoomed fill</option>
                  </select>
                  <label className="image-upload-box">
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    <ImagePlus size={20} />
                    <span>{form.image ? 'Change product image' : 'Upload product image'}</span>
                  </label>
                  {form.image ? <Image src={form.image} alt="Preview" width={320} height={240} unoptimized className={`admin-image-preview product-card-image-${form.imageFit}`} /> : null}
                  <div className="admin-action-row">
                    <button className="btn btn-primary" type="submit">{editingId === null ? <Plus size={16} /> : <Save size={16} />}{editingId === null ? 'Add Product' : 'Save Product'}</button>
                    <button className="btn btn-outline" type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}><X size={16} />Clear</button>
                  </div>
                </form>
              </div>

              <div className="theme-card">
                <h2>Product List</h2>
                <div className="admin-list">
                  {loading ? <p>Loading products...</p> : sortedItems.map((item) => (
                    <div className="admin-list-row" key={String(item._id || item.id)}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.brand} / {item.subCategory} / {item.defaultPrice}</span>
                      </div>
                      <div className="admin-action-row">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn btn-sm admin-danger" onClick={() => handleDelete(item)}><Trash2 size={14} />Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {tab === 'orders' ? (
            <section className="theme-card">
              <h2>Orders</h2>
              <div className="admin-list">
                {orders.length === 0 ? <p>No orders yet. Stripe or COD checkout creates pending orders here.</p> : orders.map((order) => (
                  <div className="admin-list-row" key={order.id}>
                    <div>
                      <strong>{order.customerName} - Rs. {order.total.toLocaleString('en-PK')}</strong>
                      <span>{order.customerEmail} / {order.customerPhone || 'No phone'} / {order.paymentMethod.toUpperCase()} / {new Date(order.createdAt).toLocaleString()}</span>
                      <span>Subtotal: Rs. {(order.subtotal || order.total).toLocaleString('en-PK')} / Promo: {order.discountCode ? `${order.discountCode} (-Rs. ${(order.discountAmount || 0).toLocaleString('en-PK')})` : 'None'}</span>
                      <span>{order.deliveryAddress || 'No address'}{order.deliveryCity ? `, ${order.deliveryCity}` : ''}</span>
                      <span>{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</span>
                    </div>
                    <select className="form-input admin-select" value={order.status} onChange={(event) => handleOrderStatus(order.id, event.target.value as StoreOrder['status'])}>
                      {['Pending', 'Paid', 'Processing', 'Completed', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {tab === 'discounts' ? (
            <section className="admin-two-column">
              <div className="theme-card">
                <h2>Add Discount</h2>
                <form className="admin-form" onSubmit={handleDiscountSubmit}>
                  <input className="form-input" placeholder="Code, e.g. SUMMER10" value={discountForm.code} onChange={(event) => setDiscountForm({ ...discountForm, code: event.target.value })} />
                  <select className="form-input" value={discountForm.type} onChange={(event) => setDiscountForm({ ...discountForm, type: event.target.value as StoreDiscount['type'] })}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed Rs.</option>
                  </select>
                  <input className="form-input" type="number" min={1} value={discountForm.value} onChange={(event) => setDiscountForm({ ...discountForm, value: Number(event.target.value) })} />
                  <button className="btn btn-primary" type="submit"><Plus size={16} />Add Discount</button>
                </form>
              </div>
              <div className="theme-card">
                <h2>Discounts</h2>
                <div className="admin-list">
                  {discounts.length === 0 ? <p>No discounts created.</p> : discounts.map((discount) => (
                    <div className="admin-list-row" key={discount.id}>
                      <div>
                        <strong>{discount.code}</strong>
                        <span>{discount.type === 'percent' ? `${discount.value}%` : `Rs. ${discount.value}`} / {discount.active ? 'Active' : 'Disabled'}</span>
                      </div>
                      <div className="admin-action-row">
                        <button className="btn btn-outline btn-sm" onClick={async () => setDiscounts(await updateDiscount(discount.id, { active: !discount.active }))}>{discount.active ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-sm admin-danger" onClick={async () => setDiscounts(await deleteDiscount(discount.id))}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {tab === 'users' ? (
            <section className="theme-card">
              <h2>Users and Roles</h2>
              <div className="admin-list">
                {users.map((user) => (
                  <div className="admin-list-row" key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email} / {user.phone || 'No phone'} / Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>{user.address || 'No address'}{user.city ? `, ${user.city}` : ''}</span>
                    </div>
                    <select className="form-input admin-select" value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value as UserRole)} disabled={user.id === currentUser.id}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
