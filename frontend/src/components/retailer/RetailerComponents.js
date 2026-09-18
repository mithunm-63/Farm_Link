/**
 * Retailer Components
 * Reusable UI blocks for the retailer role
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge, StarRating } from '../common/LoadingSpinner';
import { formatCurrency, formatDate, formatRelativeTime, getCategoryEmoji } from '../../utils/formatters';

// ── OrderHistoryCard ──────────────────────────────────────────
export const OrderHistoryCard = ({ order, onCancel, onReview }) => {
  const canCancel = ['pending', 'accepted'].includes(order.status);
  const canReview = order.status === 'delivered' && !order.retailerReviewed;

  return (
    <div className="card" style={{ marginBottom: '0.875rem' }}>
      <div className="card-body">
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          {/* Crop image */}
          <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
            {order.cropSnapshot?.imageUrl
              ? <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.75rem' }}>
                  {getCategoryEmoji(order.cropSnapshot?.category)}
                </div>
            }
          </div>

          {/* Details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              <div style={{ fontWeight: 700 }}>{order.cropSnapshot?.name}</div>
              <StatusBadge status={order.status} />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.7 }}>
              <div>📋 {order.orderNumber} · {formatRelativeTime(order.createdAt)}</div>
              <div>🧑‍🌾 {order.farmer?.farmName || order.farmer?.name}</div>
              <div>📦 {order.quantity} {order.cropSnapshot?.unit} @ {formatCurrency(order.pricePerUnit)}/{order.cropSnapshot?.unit}</div>
            </div>

            {/* Status timeline mini */}
            {order.statusHistory?.length > 1 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, overflowX: 'auto', paddingBottom: 2 }}>
                {order.statusHistory.map((h, i) => (
                  <span key={i} className={`badge status-${h.status}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                    {h.status}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">📄 Details</Link>
              {canCancel && (
                <button className="btn btn-sm" style={{ borderColor: 'var(--clr-danger)', color: 'var(--clr-danger)' }}
                  onClick={() => onCancel?.(order._id)}>
                  🚫 Cancel
                </button>
              )}
              {canReview && (
                <button className="btn btn-amber btn-sm" onClick={() => onReview?.(order)}>
                  ⭐ Review
                </button>
              )}
            </div>
          </div>

          {/* Total */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-forest)', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(order.totalAmount)}
            </div>
            {order.payment?.status === 'paid' && (
              <span className="badge badge-success" style={{ fontSize: '0.65rem', marginTop: 2 }}>💳 Paid</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── CropQuickView ─────────────────────────────────────────────
// Compact crop card for retailer browsing with quick order CTA
export const CropQuickView = ({ crop, onOrder }) => {
  const navigate = useNavigate();
  const mainImage = crop.images?.[0]?.url;
  const available = crop.availableQuantity - (crop.reservedQuantity || 0);
  const isSoldOut = available <= 0;

  return (
    <div className="card crop-card" style={{ opacity: isSoldOut ? 0.7 : 1 }}>
      {/* Image */}
      <div className="crop-card-img-wrapper" onClick={() => navigate(`/crops/${crop._id}`)}>
        {mainImage
          ? <img src={mainImage} alt={crop.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg, var(--clr-foam), var(--clr-wheat))' }}>
              {getCategoryEmoji(crop.category)}
            </div>
        }
        {crop.isOrganic && (
          <div className="crop-card-badge-organic">
            <span className="badge badge-organic">🌿 Organic</span>
          </div>
        )}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="crop-card-meta">
          <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
            {getCategoryEmoji(crop.category)} {crop.category}
          </span>
          <StarRating rating={crop.rating?.average} count={crop.rating?.count} />
        </div>

        <div className="crop-card-title" onClick={() => navigate(`/crops/${crop._id}`)} style={{ cursor: 'pointer' }}>
          {crop.name}
        </div>

        <div className="crop-card-farmer">
          <span>🧑‍🌾</span>
          <span>{crop.farmer?.farmName || crop.farmer?.name}</span>
          <span>·</span>
          <span>{crop.location?.city}</span>
        </div>

        <div className="crop-card-footer">
          <div>
            <div className="crop-card-price">{formatCurrency(crop.pricePerUnit)}</div>
            <div className="crop-card-unit">per {crop.unit}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Available</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{available.toLocaleString()} {crop.unit}</div>
          </div>
        </div>

        <button
          className={`btn ${isSoldOut ? 'btn-ghost' : 'btn-primary'} btn-sm btn-block`}
          style={{ marginTop: '0.75rem' }}
          disabled={isSoldOut}
          onClick={() => !isSoldOut && (onOrder ? onOrder(crop) : navigate(`/crops/${crop._id}`))}
        >
          {isSoldOut ? 'Sold Out' : '🛒 Order Now'}
        </button>
      </div>
    </div>
  );
};

// ── RetailerStatsBar ──────────────────────────────────────────
export const RetailerStatsBar = ({ orders, stats, user }) => {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const active  = orders.filter((o) => ['accepted','processing','shipped'].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const totalSpent = stats?.spending?.total || 0;

  const items = [
    { icon: '📦', value: orders.length,  label: 'Total Orders' },
    { icon: '⏳', value: pending,         label: 'Pending Confirmation', highlight: pending > 0 },
    { icon: '🚚', value: active,          label: 'In Transit' },
    { icon: '✅', value: delivered,       label: 'Delivered' },
    { icon: '💸', value: formatCurrency(totalSpent), label: 'Total Spent' },
  ];

  return (
    <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
      {items.map((s) => (
        <div key={s.label} className="stat-card" style={{ border: s.highlight ? '2px solid var(--clr-amber)' : undefined }}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value" style={{ color: s.highlight ? 'var(--clr-amber)' : undefined }}>{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── ReviewModal ───────────────────────────────────────────────
export const ReviewModal = ({ order, onSubmit, onClose }) => {
  const [form, setForm] = useState({ rating: 5, title: '', comment: '', qualityRating: 5, communicationRating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.comment.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ orderId: order._id, ...form });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Review: {order.cropSnapshot?.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <div className="modal-body">
          {/* Star rating */}
          <div className="form-group">
            <label className="form-label">Overall Rating *</label>
            <div style={{ display: 'flex', gap: 6, fontSize: '1.75rem' }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} onClick={() => setForm({ ...form, rating: s })}
                  style={{ cursor: 'pointer', color: s <= form.rating ? 'var(--clr-amber)' : '#ddd', transition: 'color .15s' }}>★</span>
              ))}
              <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', alignSelf: 'center' }}>
                {['','Poor','Fair','Good','Very Good','Excellent'][form.rating]}
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quality</label>
              <div style={{ display: 'flex', gap: 4, fontSize: '1.2rem' }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} onClick={() => setForm({ ...form, qualityRating: s })}
                    style={{ cursor: 'pointer', color: s <= form.qualityRating ? 'var(--clr-amber)' : '#ddd' }}>★</span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Communication</label>
              <div style={{ display: 'flex', gap: 4, fontSize: '1.2rem' }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} onClick={() => setForm({ ...form, communicationRating: s })}
                    style={{ cursor: 'pointer', color: s <= form.communicationRating ? 'var(--clr-amber)' : '#ddd' }}>★</span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" placeholder="Summarize your experience"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Review *</label>
            <textarea className="form-control" rows={4}
              placeholder="Share details about quality, freshness, delivery, and communication..."
              value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
              {form.comment.length}/1000
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}
            disabled={submitting || !form.comment.trim()}>
            {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;
