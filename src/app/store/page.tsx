'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ImageOff, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CatalogItem } from '../../lib/catalog';
import { cartStore } from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchItems } from '@/store/itemsSlice';

function StoreContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { items: storeItems, loading, loaded } = useAppSelector((state) => state.items);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedStock, setSelectedStock] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filtersOpen, setFiltersOpen] = useState(Boolean(searchParams.get('brand') || searchParams.get('category')));
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchItems());
    }
  }, [dispatch, loaded]);

  const items = useMemo(() => [...storeItems].reverse(), [storeItems]);

  const brands = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.brand)))], [items]);
  const brandItems = useMemo(
    () => selectedBrand === 'All' ? items : items.filter(i => i.brand === selectedBrand),
    [items, selectedBrand]
  );
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(brandItems.map(i => i.subCategory)))],
    [brandItems]
  );
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

  const filtered = items
    .filter(i => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.subCategory.toLowerCase().includes(q);
      const matchBrand = selectedBrand === 'All' || i.brand === selectedBrand;
      const matchCat = activeCategory === 'All' || i.subCategory === activeCategory;
      const matchStock = selectedStock === 'All' || i.stock === selectedStock;
      return matchSearch && matchBrand && matchCat && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        return parseInt(a.defaultPrice.replace(/\D/g, '')) - parseInt(b.defaultPrice.replace(/\D/g, ''));
      }
      if (sortBy === 'price-desc') {
        return parseInt(b.defaultPrice.replace(/\D/g, '')) - parseInt(a.defaultPrice.replace(/\D/g, ''));
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // newest = already reversed
    });

  const handleAddToCart = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    cartStore.addItem({
      _id: String(item._id || item.id),
      name: item.name,
      brand: item.brand,
      defaultPrice: item.defaultPrice,
      image: item.image,
    });
    setAddedId(String(item._id || item.id));
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Store Hero Banner */}
      <section className="store-hero">
        <div className="store-hero-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '3rem' }}>
            Our <span className="text-gradient">Store</span>
          </h1>
          <p className="subtitle">Browse our complete range of premium mobile batteries</p>
          <div className="store-stats">
            <div className="store-stat"><span className="store-stat-num">{items.length}+</span><span>Products</span></div>
            <div className="store-stat"><span className="store-stat-num">{brands.length - 1}</span><span>Brands</span></div>
            <div className="store-stat"><span className="store-stat-num">{categories.length - 1}</span><span>Categories</span></div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Search + Filter Toggle */}
        <div className="store-toolbar">
          <div className="store-search-wrap">
            <input
              type="text"
              placeholder="Search products…"
              className="store-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="store-toolbar-right">
            <select className="store-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button className="btn btn-outline store-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
              <SlidersHorizontal size={16} />
              Filters
              {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="store-filter-panel">
            <div className="filter-group">
              <label className="filter-label"><Filter size={14} /> Brand</label>
              <div className="filter-chips">
                {brands.map(b => (
                  <button
                    key={b}
                    className={`filter-chip ${selectedBrand === b ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedBrand(b);
                      setSelectedCategory('All');
                    }}
                  >{b}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="filter-chips">
                {categories.map(c => (
                  <button
                    key={c}
                    className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(c)}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Availability</label>
              <div className="filter-chips">
                {['All', 'In Stock', 'Out of Stock'].map(s => (
                  <button
                    key={s}
                    className={`filter-chip ${selectedStock === s ? 'active' : ''}`}
                    onClick={() => setSelectedStock(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}
              onClick={() => { setSelectedBrand('All'); setSelectedCategory('All'); setSelectedStock('All'); setSearchTerm(''); }}
            >
              <X size={14} /> Clear All Filters
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="store-results-count">
          {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="store-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="store-empty">
            <ImageOff size={64} style={{ opacity: 0.3 }} />
            <h3>No products found</h3>
            <p className="subtitle">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid store-grid">
            {filtered.map(item => {
              const id = String(item._id || item.id);
              const isAdded = addedId === id;
              return (
                <ProductCard
                  key={id}
                  item={item}
                  isAdded={isAdded}
                  titleFontSize="1.1rem"
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading store…</div>}>
      <StoreContent />
    </Suspense>
  );
}
