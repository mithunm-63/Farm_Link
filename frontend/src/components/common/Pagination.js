/**
 * Pagination Component
 * Smart pagination with ellipsis for large page counts
 */

import React from 'react';

const Pagination = ({ page, pages, onPageChange, loading = false }) => {
  if (!pages || pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2; // pages on each side of current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1); // fill single gap
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="pagination" style={{ opacity: loading ? 0.6 : 1 }}>
      {/* Previous */}
      <button
        className="page-btn"
        disabled={page === 1 || loading}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ padding: '0.5rem 0.4rem', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            disabled={loading}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        className="page-btn"
        disabled={page === pages || loading}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next →
      </button>

      {/* Page info */}
      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginLeft: '0.5rem' }}>
        Page {page} of {pages}
      </span>
    </div>
  );
};

export default Pagination;
