/**
 * Farmer Components
 * Reusable UI blocks for the farmer role
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, StarRating, ConfirmModal } from '../common/LoadingSpinner';
import { formatCurrency, formatDate, getCategoryEmoji } from '../../utils/formatters';

// ── CropListingCard ───────────────────────────────────────────
// Full card for a farmer's own listing with edit/delete actions
export const CropListingCard = ({ crop, onDelete, onToggleStatus }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mainImage = crop.images?.[0]?.url;
  const available = crop.availableQuantity - (crop.reservedQuantity || 0);

  return (
    <>
      <div className="card" style={{ position: 'relative' }}>
        {/* Image */}
        <div style={{ height: 160, background: 'var(--clr-surface)', overflow: 'hidden', position: 'relative' }}>
          {mainImage ? (
            <img src={mainImage} alt={crop.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
              {getCategoryEmoji(crop.category)}
            </div>
          )}
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span className={`badge ${
              crop.status === 'active' ? 'badge-success' :
              crop.status === 'sold_out' ? 'badge-danger' : 'badge-neutral'
            }`} style={{ textTransform: 'capitalize' }}>
              {crop.status === 'active' ? '● Active' : crop.status?.replace('_', ' ')}
            </span>
          </div>
          {crop.isOrganic && (
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <span className="badge badge-organic">🌿 Organic</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="card-body">
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4, color: 'var(--clr-text)' }}>
            {crop.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8 }}>
            {getCategoryEmoji(crop.category)} {crop.category}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--clr-forest)', fontFamily: 'var(--font-display)' }}>
                {formatCurrency(crop.pricePerUnit)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>per {crop.unit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{available.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{crop.unit} left</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <StarRating rating={crop.rating?.average} count={crop.rating?.count} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 12 }}>
            Harvested: {formatDate(crop.harvestDate)}
            {crop.orderCount > 0 && ` · ${crop.orderCount} orders`}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Link to={`/crops/${crop._id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              👁️ View
            </Link>
            <Link to={`/farmer/crops/edit/${crop._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              ✏️ Edit
            </Link>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>🗑️</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete Listing"
        message={`Are you sure you want to delete "${crop.name}"? This cannot be undone.`}
        onConfirm={() => { onDelete?.(crop._id); setConfirmDelete(false); }}
        onCancel={() => setConfirmDelete(false)}
        confirmText="Delete"
        isDanger
      />
    </>
  );
};

// ── OrderActionCard ───────────────────────────────────────────
// Order card with inline accept / reject / ship / deliver actions
export const OrderActionCard = ({ order, onStatusChange }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handle = (status, note) => onStatusChange?.(order._id, status, note);

  return (
    <>
      <div className="card" style={{ marginBottom: '0.875rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            {/* Crop thumbnail */}
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
              {order.cropSnapshot?.imageUrl
                ? <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>
                    {getCategoryEmoji(order.cropSnapshot?.category)}
                  </div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{order.cropSnapshot?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                    {order.orderNumber} · {formatDate(order.createdAt)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                    🏪 {order.retailer?.businessName || order.retailer?.name}
                    &nbsp;·&nbsp;{order.quantity} {order.cropSnapshot?.unit}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={order.status} />
                  <div style={{ fontWeight: 700, color: 'var(--clr-forest)', marginTop: 2 }}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Delivery address preview */}
              {order.deliveryAddress && (
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>
                  📍 {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {order.status === 'pending' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => handle('accepted')}>✅ Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)}>❌ Reject</button>
              </>
            )}
            {order.status === 'accepted' && (
              <button className="btn btn-secondary btn-sm" onClick={() => handle('shipped')}>🚚 Mark as Shipped</button>
            )}
            {order.status === 'shipped' && (
              <button className="btn btn-primary btn-sm" onClick={() => handle('delivered')}>📦 Mark as Delivered</button>
            )}
            <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
              View Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Order</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                Provide a reason for the retailer (optional but recommended):
              </p>
              <textarea
                className="form-control" rows={3}
                placeholder="e.g. Crop is no longer available at this quantity..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { handle('rejected', rejectReason); setShowRejectModal(false); }}>
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── FarmerStatsBar ────────────────────────────────────────────
export const FarmerStatsBar = ({ stats, listingCounts, user }) => {
  const items = [
    { icon: '🌾', value: listingCounts?.active || 0,           label: 'Active Listings' },
    { icon: '📦', value: stats?.orders?.pending?.count || 0,   label: 'Pending Orders',  highlight: true },
    { icon: '🚚', value: stats?.orders?.shipped?.count || 0,   label: 'In Transit' },
    { icon: '✅', value: stats?.orders?.delivered?.count || 0, label: 'Delivered' },
    { icon: '💰', value: formatCurrency(stats?.revenue?.total || 0), label: 'Total Revenue' },
    { icon: '⭐', value: user?.rating?.average?.toFixed(1) || '—',   label: `Rating (${user?.rating?.count || 0})` },
  ];

  return (
    <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
      {items.map((s) => (
        <div key={s.label} className="stat-card" style={{ border: s.highlight && s.value > 0 ? '2px solid var(--clr-amber)' : undefined }}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value" style={{ color: s.highlight && s.value > 0 ? 'var(--clr-amber)' : undefined }}>
            {s.value}
          </div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── EarningsChart ─────────────────────────────────────────────
// Simple bar chart for monthly earnings using pure CSS
export const EarningsChart = ({ monthlyData = [] }) => {
  const max = Math.max(...monthlyData.map((d) => d.amount), 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginBottom: 8 }}>
        {monthlyData.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
              {formatCurrency(d.amount)}
            </div>
            <div style={{
              width: '100%', background: 'var(--clr-forest)',
              height: `${(d.amount / max) * 90}px`,
              borderRadius: '4px 4px 0 0', minHeight: 4,
              opacity: i === monthlyData.length - 1 ? 1 : 0.6,
              transition: 'height 0.5s ease',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {monthlyData.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
            {d.month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropListingCard;
