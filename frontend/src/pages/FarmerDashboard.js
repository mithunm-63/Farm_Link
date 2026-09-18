import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyListings, fetchOrders, updateOrderStatus } from '../store';
import { cropsAPI } from '../services/api';
import { LoadingSpinner, StarRating, StatusBadge, EmptyState, ConfirmModal } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myListings, loading: cropsLoading } = useSelector((s) => s.crops);
  const { items: orders, loading: ordersLoading } = useSelector((s) => s.orders);

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, cropId: null });
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null, reason: '' });

  useEffect(() => {
    dispatch(fetchMyListings({ limit: 50 }));
    dispatch(fetchOrders({ limit: 50 }));
    cropsAPI.getFarmerStats().then((d) => setStats(d)).catch(() => {});
  }, [dispatch]);

  const handleDeleteCrop = async () => {
    try {
      await cropsAPI.delete(deleteModal.cropId);
      dispatch(fetchMyListings());
      toast.success('Crop listing deleted.');
      setDeleteModal({ open: false, cropId: null });
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleOrderStatus = async (orderId, status, note) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, data: { status, rejectionReason: note } })).unwrap();
      toast.success(`Order ${status}!`);
      setRejectModal({ open: false, orderId: null, reason: '' });
    } catch (err) {
      toast.error(err || 'Failed to update order');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeListings = myListings.filter((c) => c.status === 'active').length;
  const totalRevenue = stats?.stats?.revenue?.total || 0;
  const totalOrders = orders.length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              Welcome, {user?.name?.split(' ')[0]} 🌾
            </h1>
            <p style={{ color: 'var(--clr-text-muted)' }}>{user?.farmName || 'Your Farm Dashboard'}</p>
          </div>
          <Link to="/farmer/crops/add" className="btn btn-primary">➕ Add Crop Listing</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[
            { icon: '🌾', value: activeListings, label: 'Active Listings' },
            { icon: '📦', value: pendingOrders.length, label: 'Pending Orders', highlight: pendingOrders.length > 0 },
            { icon: '📊', value: totalOrders, label: 'Total Orders' },
            { icon: '💰', value: `₹${totalRevenue.toLocaleString()}`, label: 'Total Revenue' },
            { icon: '⭐', value: user?.rating?.average?.toFixed(1) || '—', label: `Rating (${user?.rating?.count || 0} reviews)` },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ border: s.highlight ? '2px solid var(--clr-amber)' : undefined }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.highlight ? 'var(--clr-amber)' : undefined }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['overview', '📊 Overview'], ['listings', '🌾 My Listings'], ['orders', '📦 Orders']].map(([t, label]) => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {label}
              {t === 'orders' && pendingOrders.length > 0 && (
                <span style={{ marginLeft: 6, background: '#e53935', color: 'white', borderRadius: '999px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            {pendingOrders.length > 0 && (
              <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                🔔 You have <strong>{pendingOrders.length}</strong> pending order{pendingOrders.length > 1 ? 's' : ''} awaiting your response!
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: '1rem' }} onClick={() => setActiveTab('orders')}>View Orders</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Recent orders */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Recent Orders</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {ordersLoading ? <LoadingSpinner /> : orders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>No orders yet</div>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div key={order._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.cropSnapshot?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                            {order.retailer?.businessName || order.retailer?.name} · {order.quantity} {order.cropSnapshot?.unit}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <StatusBadge status={order.status} />
                          <div style={{ fontSize: '0.8rem', color: 'var(--clr-forest)', fontWeight: 600, marginTop: 2 }}>₹{order.totalAmount?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top listings */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>My Listings</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {myListings.slice(0, 5).map((crop) => (
                    <div key={crop._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{crop.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>₹{crop.pricePerUnit}/{crop.unit} · {crop.availableQuantity - (crop.reservedQuantity || 0)} left</div>
                      </div>
                      <span className={`badge ${crop.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {crop.status}
                      </span>
                    </div>
                  ))}
                  {myListings.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>No listings yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {cropsLoading ? <LoadingSpinner /> : myListings.length === 0 ? (
              <EmptyState icon="🌾" title="No crop listings yet"
                subtitle="Start by adding your first crop to the marketplace."
                action={<Link to="/farmer/crops/add" className="btn btn-primary">➕ Add First Listing</Link>} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {myListings.map((crop) => (
                  <div key={crop._id} className="card">
                    <div style={{ position: 'relative' }}>
                      <div style={{ height: 160, background: 'var(--clr-surface)', overflow: 'hidden' }}>
                        {crop.images?.[0]?.url ? (
                          <img src={crop.images[0].url} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🌾</div>
                        )}
                      </div>
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <span className={`badge ${crop.status === 'active' ? 'badge-success' : crop.status === 'sold_out' ? 'badge-danger' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                          {crop.status}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{crop.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)', marginBottom: '0.75rem' }}>
                        ₹{crop.pricePerUnit}/{crop.unit} · {crop.availableQuantity - (crop.reservedQuantity || 0)} {crop.unit} available
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/crops/${crop._id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>👁️ View</Link>
                        <Link to={`/farmer/crops/edit/${crop._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>✏️ Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal({ open: true, cropId: crop._id })}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? <LoadingSpinner /> : orders.length === 0 ? (
              <EmptyState icon="📦" title="No orders yet" subtitle="Orders from retailers will appear here." />
            ) : (
              orders.map((order) => (
                <div key={order._id} className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
                          {order.cropSnapshot?.imageUrl ? (
                            <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌾</div>}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{order.cropSnapshot?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                            {order.orderNumber} · {order.retailer?.businessName || order.retailer?.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                            {order.quantity} {order.cropSnapshot?.unit} · ₹{order.totalAmount?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <StatusBadge status={order.status} />
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Actions for pending orders */}
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--clr-border)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleOrderStatus(order._id, 'accepted')}>✅ Accept Order</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejectModal({ open: true, orderId: order._id, reason: '' })}>❌ Reject</button>
                      </div>
                    )}
                    {order.status === 'accepted' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--clr-border)' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOrderStatus(order._id, 'shipped')}>🚚 Mark as Shipped</button>
                      </div>
                    )}
                    {order.status === 'shipped' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--clr-border)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleOrderStatus(order._id, 'delivered')}>📦 Mark as Delivered</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Crop Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        onConfirm={handleDeleteCrop}
        onCancel={() => setDeleteModal({ open: false, cropId: null })}
        confirmText="Delete"
        isDanger
      />

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ ...rejectModal, open: false })}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Order</h3>
              <button onClick={() => setRejectModal({ ...rejectModal, open: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>Please provide a reason for rejection (optional):</p>
              <textarea className="form-control" rows={3} placeholder="e.g. Crop no longer available, quantity insufficient..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRejectModal({ ...rejectModal, open: false })}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleOrderStatus(rejectModal.orderId, 'rejected', rejectModal.reason)}>Reject Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
