import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../store';
import { ordersAPI, reviewsAPI } from '../services/api';
import { LoadingSpinner, StatusBadge, EmptyState, StarRating } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ============= OrdersPage =============
export const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: orders, loading } = useSelector((s) => s.orders);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { dispatch(fetchOrders({ limit: 100 })); }, [dispatch]);

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>📦 My Orders</h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '1.5rem' }}>
          {user?.role === 'farmer' ? 'Manage incoming orders from retailers.' : 'Track your crop purchases.'}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['', 'pending', 'accepted', 'shipped', 'delivered', 'cancelled', 'rejected'].map((s) => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>
              {s || 'All'} ({s ? orders.filter((o) => o.status === s).length : orders.length})
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders found"
            action={user?.role === 'retailer' ? <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link> : null} />
        ) : (
          filtered.map((order) => (
            <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
                      {order.cropSnapshot?.imageUrl
                        ? <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌾</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--clr-text)' }}>{order.cropSnapshot?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                        {order.orderNumber} · {order.quantity} {order.cropSnapshot?.unit}
                        {user?.role === 'retailer' ? ` from ${order.farmer?.farmName || order.farmer?.name}` : ` from ${order.retailer?.businessName || order.retailer?.name}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <StatusBadge status={order.status} />
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-forest)', marginTop: 4 }}>
                        ₹{order.totalAmount?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

// ============= OrderDetailPage =============
export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '', title: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    ordersAPI.getOne(id).then((d) => { setOrder(d.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status, note) => {
    try {
      const res = await dispatch(updateOrderStatus({ id, data: { status, rejectionReason: note } })).unwrap();
      setOrder(res.order);
      toast.success(`Order ${status}!`);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleReview = async () => {
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({ orderId: id, ...review });
      toast.success('Review submitted! ⭐');
      setReviewModal(false);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return (
    <div className="page"><div className="container">
      <EmptyState icon="📦" title="Order not found" action={<Link to="/orders" className="btn btn-primary">← Back to Orders</Link>} />
    </div></div>
  );

  const isFarmer = user?._id === order.farmer?._id;
  const isRetailer = user?._id === order.retailer?._id;
  const canReview = order.status === 'delivered' && isRetailer && !order.retailerReviewed;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Order {order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div>
            {/* Crop summary */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>Order Summary</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
                    {order.cropSnapshot?.imageUrl
                      ? <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>🌾</div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.cropSnapshot?.name}</div>
                    <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                      {order.quantity} {order.cropSnapshot?.unit} @ ₹{order.pricePerUnit}/{order.cropSnapshot?.unit}
                    </div>
                  </div>
                </div>
                {[
                  ['Subtotal', `₹${order.subtotal?.toLocaleString()}`],
                  ['Shipping', order.shippingCost > 0 ? `₹${order.shippingCost}` : 'Free'],
                  ['Total', `₹${order.totalAmount?.toLocaleString()}`],
                  ['Payment', `${order.payment?.method?.toUpperCase()} - ${order.payment?.status}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: k === 'Total' ? '1px solid var(--clr-border)' : 'none', fontWeight: k === 'Total' ? 700 : 400, fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>{k}</span>
                    <span style={{ color: k === 'Total' ? 'var(--clr-forest)' : 'var(--clr-text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>Delivery Address</h3>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 600 }}>{order.deliveryAddress?.name}</div>
                  <div>{order.deliveryAddress?.phone}</div>
                  <div>{order.deliveryAddress?.address}</div>
                  <div>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}</div>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>Status Timeline</h3>
                {order.statusHistory?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--clr-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', flexShrink: 0 }}>✓</div>
                      {i < order.statusHistory.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--clr-border)', minHeight: 24 }} />}
                    </div>
                    <div style={{ paddingBottom: '0.5rem' }}>
                      <StatusBadge status={h.status} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                        {new Date(h.timestamp).toLocaleString('en-IN')}
                        {h.note && ` · ${h.note}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: actions + parties */}
          <div>
            {/* Farmer actions */}
            {isFarmer && (
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body">
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>Actions</h3>
                  {order.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-block" onClick={() => handleStatusUpdate('accepted')}>✅ Accept Order</button>
                      <button className="btn btn-danger btn-block" onClick={() => handleStatusUpdate('rejected', 'Stock unavailable')}>❌ Reject Order</button>
                    </div>
                  )}
                  {order.status === 'accepted' && <button className="btn btn-secondary btn-block" onClick={() => handleStatusUpdate('shipped')}>🚚 Mark Shipped</button>}
                  {order.status === 'shipped' && <button className="btn btn-primary btn-block" onClick={() => handleStatusUpdate('delivered')}>📦 Mark Delivered</button>}
                  {!['pending','accepted','processing','shipped'].includes(order.status) && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', textAlign: 'center' }}>No actions available</p>
                  )}
                </div>
              </div>
            )}

            {/* Retailer actions */}
            {isRetailer && ['pending','accepted'].includes(order.status) && (
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body">
                  <button className="btn btn-danger btn-block" onClick={() => handleStatusUpdate('cancelled', 'Cancelled by retailer')}>🚫 Cancel Order</button>
                </div>
              </div>
            )}

            {/* Review CTA */}
            {canReview && (
              <div className="card" style={{ marginBottom: '1.25rem', border: '2px solid var(--clr-amber)' }}>
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                  <h4 style={{ fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>Leave a Review</h4>
                  <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Share your experience with this crop.</p>
                  <button className="btn btn-amber btn-block" onClick={() => setReviewModal(true)}>Write Review</button>
                </div>
              </div>
            )}

            {/* Farmer card */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🧑‍🌾 Farmer</h3>
                <div style={{ fontWeight: 600 }}>{order.farmer?.farmName || order.farmer?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{order.farmer?.phone}</div>
              </div>
            </div>

            {/* Retailer card */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🏪 Retailer</h3>
                <div style={{ fontWeight: 600 }}>{order.retailer?.businessName || order.retailer?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{order.retailer?.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Write a Review</h3>
              <button onClick={() => setReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem' }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} onClick={() => setReview({ ...review, rating: s })}
                      style={{ cursor: 'pointer', color: s <= review.rating ? 'var(--clr-amber)' : '#ddd' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" placeholder="Summarize your experience" value={review.title}
                  onChange={(e) => setReview({ ...review, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment *</label>
                <textarea className="form-control" rows={4} placeholder="Describe the quality, freshness, communication..."
                  value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReview} disabled={submittingReview || !review.comment}>
                {submittingReview ? 'Submitting...' : '⭐ Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
