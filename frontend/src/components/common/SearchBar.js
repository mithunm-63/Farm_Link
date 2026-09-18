/**
 * SearchBar Component
 * Debounced search input with suggestions support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useUtils';
import { cropsAPI } from '../../services/api';

const QUICK_SEARCHES = [
  'Tomatoes', 'Onions', 'Rice', 'Wheat', 'Mangoes',
  'Potatoes', 'Spinach', 'Turmeric', 'Chilli',
];

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search crops, farmers, locations...',
  showSuggestions = true,
  size = 'md',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debouncedQuery = useDebounce(query, 350);

  // Fetch suggestions
  useEffect(() => {
    if (!showSuggestions || !debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    cropsAPI.getAll({ search: debouncedQuery, limit: 5 })
      .then((data) => {
        setSuggestions(data.crops || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQuery, showSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
    if (val.length > 0) setShowDropdown(true);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setShowDropdown(false);
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestion = (crop) => {
    setQuery(crop.name);
    setShowDropdown(false);
    navigate(`/crops/${crop._id}`);
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    setShowDropdown(false);
    if (onSearch) onSearch(term);
    else navigate(`/marketplace?search=${encodeURIComponent(term)}`);
  };

  const padding = size === 'lg' ? '0.85rem 1.25rem' : '0.65rem 1rem';
  const fontSize = size === 'lg' ? '1rem' : '0.9rem';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--clr-text-muted)', fontSize: '1rem', pointerEvents: 'none',
          }}>🔍</span>
          <input
            ref={inputRef}
            className="form-control"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            onFocus={() => query.length > 0 && setShowDropdown(true)}
            autoFocus={autoFocus}
            style={{ padding, paddingLeft: '2.75rem', fontSize }}
          />
          {query && (
            <button type="button"
              onClick={() => { setQuery(''); onChange?.(''); setSuggestions([]); inputRef.current?.focus(); }}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)', fontSize: '1rem' }}>
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-primary" style={{ fontSize }}>
          Search
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'var(--clr-white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-lg)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {loading && (
            <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
              Searching...
            </div>
          )}

          {/* Suggestions from API */}
          {!loading && suggestions.length > 0 && (
            <div>
              <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Crops
              </div>
              {suggestions.map((crop) => (
                <button key={crop._id} onClick={() => handleSuggestion(crop)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .12s', textAlign: 'left' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clr-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
                    {crop.images?.[0]?.url
                      ? <img src={crop.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1rem' }}>🌾</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--clr-text)' }}>{crop.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                      ₹{crop.pricePerUnit}/{crop.unit} · {crop.location?.city}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && query.length >= 2 && suggestions.length === 0 && (
            <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
              No crops found for "{query}"
            </div>
          )}

          {/* Quick searches */}
          {!query && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                Popular searches
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {QUICK_SEARCHES.map((term) => (
                  <button key={term} onClick={() => handleQuickSearch(term)}
                    className="badge badge-neutral"
                    style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '0.8rem' }}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
