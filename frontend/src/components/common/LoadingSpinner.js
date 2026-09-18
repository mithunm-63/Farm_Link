import React from 'react';

export const LoadingSpinner = ({ fullPage, size = 'md', text }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {text && <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
  if (fullPage) return <div className="full-page-loader">{spinner}</div>;
  return <div className="loading-center">{spinner}</div>;
};

export const StarRating = ({ rating = 0, count, size = 'sm' }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div className="stars">
        {stars.map((s) => (
          <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : 'empty'}`}
            style={{ fontSize: size === 'lg' ? '1.1rem' : '0.85rem' }}>★</span>
        ))}
      </div>
      {rating > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
        {rating.toFixed(1)}{count !== undefined && ` (${count})`}
      </span>}
    </div>
  );
};

export const Badge = ({ children, variant = 'neutral' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const StatusBadge = ({ status }) => {
  const labels = {
    pending: '⏳ Pending', accepted: '✅ Accepted', rejected: '❌ Rejected',
    processing: '🔄 Processing', shipped: '🚚 Shipped',
    delivered: '📦 Delivered', cancelled: '🚫 Cancelled',
  };
  return <span className={`badge status-${status}`}>{labels[status] || status}</span>;
};

export const EmptyState = ({ icon = '📭', title, subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    {subtitle && <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>{subtitle}</p>}
    {action}
  </div>
);

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', isDanger }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <div className="modal-body"><p>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
