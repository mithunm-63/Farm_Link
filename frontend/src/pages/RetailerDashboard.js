import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../store';
import { ordersAPI } from '../services/api';
import { LoadingSpinner, StatusBadge, EmptyState } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const RetailerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: orders, loading } = useSelector((s) => s.orders);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchOrders({ limit: 50 }));
    ordersAPI.getRetailerStats().then((d) => setStats(d)).catch(() => {});
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, data: { status: 'cancelled', rejectionReason: 'Cancelled by retailer' } })).unwrap();
      toast.success('Order cancelled.');
    } catch (err) {
      toast.error(err || 'Failed to cancel');
    }
  };

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
  const totalSpent = stats?.stats?.spending?.total || 0;
  const completedOrders = stats?.stats?.spending?.count || 0;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const activeCount = orders.filter((o) => ['accepted', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              Welcome, {user?.name?.split(' ')[0]} 🏪
            </h1>
            <p style={{ color: 'var(--clr-text-muted)' }}>{user?.businessName || 'Retailer Dashboard'}</p>
          </div>
          <Link to="/marketplace" className="btn btn-primary">🛒 Browse Marketplace</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[
            { icon: '📦', value: orders.length, label: 'Total Orders' },
            { icon: '⏳', value: pendingCount, label: 'Pending Confirmation', highlight: pendingCount > 0 },
            { icon: '🚚', value: activeCount, label: 'Active / In Transit' },
            { icon: '✅', value: completedOrders, label: 'Delivered Orders' },
            { icon: '💸', value: `₹${totalSpent.toLocaleString()}`, label: 'Total Spent' },
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
          {[['overview', '📊 Overview'], ['orders', '📦 My Orders']].map(([t, label]) => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{label}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Recent Orders</h3>
              </div>
              <div style={{ padding: 0 }}>
                {loading ? <LoadingSpinner /> : orders.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                    No orders yet. <Link to="/marketplace">Browse marketplace →</Link>
                  </div>
                ) : (
                  orders.slice(0, 6).map((order) => (
                    <div key={order._id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.cropSnapshot?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                          {order.farmer?.farmName || order.farmer?.name} · {order.quantity} {order.cropSnapshot?.unit}
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

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Order Status Breakdown</h3>
              </div>
              <div className="card-body">
                {['pending','accepted','shipped','delivered','cancelled','rejected'].map((status) => {
                  const count = orders.filter((o) => o.status === status).length;
                  const percent = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={status} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <StatusBadge status={status} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--clr-surface)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: 'var(--clr-forest)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['', 'pending', 'accepted', 'shipped', 'delivered', 'cancelled', 'rejected'].map((s) => (
                <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>
                  {s || 'All'} ({s ? orders.filter((o) => o.status === s).length : orders.length})
                </button>
              ))}
            </div>

            {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
              <EmptyState icon="📦" title="No orders found" subtitle="Your orders will appear here once you start purchasing."
                action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>} />
            ) : (
              filtered.map((order) => (
                <div key={order._id} className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Image */}
                      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--clr-surface)', flexShrink: 0 }}>
                        {order.cropSnapshot?.imageUrl ? (
                          <img src={order.cropSnapshot.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌾</div>}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{order.cropSnapshot?.name}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
                              Order {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                              🧑‍🌾 {order.farmer?.farmName || order.farmer?.name} · {order.quantity} {order.cropSnapshot?.unit}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <StatusBadge status={order.status} />
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-forest)', marginTop: 4 }}>
                              ₹{order.totalAmount?.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        {order.statusHistory?.length > 0 && (
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                            {order.statusHistory.map((h, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                {i > 0 && <div style={{ width: 20, height: 1, background: 'var(--clr-border)' }} />}
                                <span className={`badge status-${h.status}`} style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{h.status}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">👁️ View Details</Link>
                          {['pending', 'accepted'].includes(order.status) && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)}>🚫 Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerDashboard;
