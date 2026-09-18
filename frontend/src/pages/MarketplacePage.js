import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrops, setFilters, clearFilters } from '../store';
import CropCard from '../components/common/CropCard';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['vegetables','fruits','grains','pulses','spices','dairy','poultry','herbs','oilseeds','other'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'pricePerUnit', label: 'Price: Low to High' },
  { value: '-pricePerUnit', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-views', label: 'Most Popular' },
];

const MarketplacePage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, total, pages, loading, filters } = useSelector((s) => s.crops);
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadCrops = useCallback(() => {
    dispatch(fetchCrops({ ...filters, page, limit: 12 }));
  }, [dispatch, filters, page]);

  useEffect(() => { loadCrops(); }, [loadCrops]);

  // Pre-fill from URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) dispatch(setFilters({ category: cat }));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: localSearch }));
    setPage(1);
  };

  const handleFilter = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    setPage(1);
  };

  const handleClear = () => {
    dispatch(clearFilters());
    setLocalSearch('');
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.city, filters.state, filters.minPrice, filters.maxPrice, filters.isOrganic]
    .filter(Boolean).length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            🛒 Crop Marketplace
          </h1>
          <p style={{ color: 'var(--clr-text-muted)' }}>
            {total > 0 ? `${total} fresh listings from verified farmers` : 'Browse fresh produce from local farmers'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className="form-control"
            placeholder="Search crops, e.g. tomatoes, organic wheat..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 500 }}
          />
          <button type="submit" className="btn btn-primary">🔍 Search</button>
          {(filters.search || activeFilterCount > 0) && (
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              ✕ Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' /* show on mobile via CSS */ }}>
            🔧 Filters
          </button>
        </form>

        {/* Sort bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {filters.category && <span className="badge badge-success">📂 {filters.category} <button onClick={() => handleFilter('category', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>✕</button></span>}
            {filters.isOrganic === 'true' && <span className="badge badge-organic">🌿 Organic <button onClick={() => handleFilter('isOrganic', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>✕</button></span>}
            {filters.city && <span className="badge badge-info">📍 {filters.city} <button onClick={() => handleFilter('city', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>✕</button></span>}
          </div>
          <select
            className="form-control"
            value={filters.sort}
            onChange={(e) => handleFilter('sort', e.target.value)}
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '260px 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Filter sidebar */}
          {sidebarOpen && (
            <aside>
              <div className="filter-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Filters</h3>
                  {activeFilterCount > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ fontSize: '0.75rem' }}>Clear all</button>
                  )}
                </div>

                {/* Category */}
                <div className="filter-section">
                  <div className="filter-title">Category</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="radio" name="cat" checked={!filters.category} onChange={() => handleFilter('category', '')} />
                      All Categories
                    </label>
                    {CATEGORIES.map((cat) => (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        <input type="radio" name="cat" checked={filters.category === cat} onChange={() => handleFilter('category', cat)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="filter-section">
                  <div className="filter-title">Price Range (₹)</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input className="form-control" type="number" placeholder="Min" value={filters.minPrice}
                      onChange={(e) => handleFilter('minPrice', e.target.value)} style={{ fontSize: '0.85rem' }} />
                    <span style={{ color: 'var(--clr-text-muted)' }}>–</span>
                    <input className="form-control" type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={(e) => handleFilter('maxPrice', e.target.value)} style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                {/* Location */}
                <div className="filter-section">
                  <div className="filter-title">Location</div>
                  <input className="form-control" placeholder="City" value={filters.city}
                    onChange={(e) => handleFilter('city', e.target.value)} style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }} />
                  <input className="form-control" placeholder="State" value={filters.state}
                    onChange={(e) => handleFilter('state', e.target.value)} style={{ fontSize: '0.85rem' }} />
                </div>

                {/* Organic toggle */}
                <div className="filter-section">
                  <div className="filter-title">Type</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={filters.isOrganic === 'true'}
                      onChange={(e) => handleFilter('isOrganic', e.target.checked ? 'true' : '')} />
                    🌿 Organic only
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Crop grid */}
          <div>
            {loading ? (
              <LoadingSpinner text="Loading fresh listings..." />
            ) : items.length === 0 ? (
              <EmptyState
                icon="🌾"
                title="No crops found"
                subtitle="Try adjusting your filters or search term"
                action={<button className="btn btn-primary" onClick={handleClear}>Clear Filters</button>}
              />
            ) : (
              <>
                <div className="crop-grid">
                  {items.map((crop) => <CropCard key={crop._id} crop={crop} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                      <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
