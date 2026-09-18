import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCrop, clearCurrentCrop, placeOrder } from '../store';
import { reviewsAPI } from '../services/api';
import { LoadingSpinner, StarRating, StatusBadge, EmptyState } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CropDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCrop: crop, loading } = useSelector((s) => s.crops);
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);
  const [orderModal, setOrderModal] = useState(false);
  const [deliveryAddr, setDeliveryAddr] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: '', city: user?.location?.city || '',
    state: user?.location?.state || '', pincode: '',
  });
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    dispatch(fetchCrop(id));
    reviewsAPI.getAll({ cropId: id, limit: 5 }).then((d) => setReviews(d.reviews || [])).catch(() => {});
    return () => dispatch(clearCurrentCrop());
  }, [id, dispatch]);

  useEffect(() => {
    if (crop) setQty(crop.minimumOrderQuantity || 1);
  }, [crop]);

  const handleOrder = async () => {
    if (!isAuthenticated) { toast.error('Please login to place an order.'); navigate('/login'); return; }
    if (user?.role !== 'retailer') { toast.error('Only retailers can place orders.'); return; }
    if (!deliveryAddr.address || !deliveryAddr.city || !deliveryAddr.pincode) {
      toast.error('Please fill in all delivery address fields.'); return;
    }

    setPlacing(true);
    try {
      await dispatch(placeOrder({
        cropId: crop._id, quantity: qty, deliveryAddress: deliveryAddr, notes,
      })).unwrap();
      toast.success('Order placed! Waiting for farmer confirmation. 🎉');
      setOrderModal(false);
      navigate('/orders');
    } catch (err) {
      toast.error(err || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!crop) return (
    <div className="page"><div className="container">
      <EmptyState icon="🌾" title="Crop not found" subtitle="This listing may have been removed."
        action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>} />
    </div></div>
  );

  const effective = crop.availableQuantity - (crop.reservedQuantity || 0);
  const totalPrice = (qty * crop.pricePerUnit).toLocaleString();
  const isOwner = user?._id === crop.farmer?._id;

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link> / <Link to="/marketplace" style={{ color: 'inherit' }}>Marketplace</Link> / <span style={{ color: 'var(--clr-text)' }}>{crop.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left: Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '0.75rem', background: 'var(--clr-surface)', aspectRatio: '4/3' }}>
              {crop.images?.[activeImg]?.url ? (
                <img src={crop.images[activeImg].url} alt={crop.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🌾</div>
              )}
            </div>
            {crop.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {crop.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === activeImg ? 'var(--clr-forest)' : 'var(--clr-border)'}`, flexShrink: 0 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{crop.category}</span>
              {crop.isOrganic && <span className="badge badge-organic">🌿 Organic</span>}
              {crop.grade && <span className="badge badge-info">Grade {crop.grade?.toUpperCase()}</span>}
              <span className={`badge ${crop.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {crop.status === 'active' ? '✅ Available' : crop.status}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>{crop.name}</h1>

            <StarRating rating={crop.rating?.average} count={crop.rating?.count} size="lg" />

            <div style={{ margin: '1.25rem 0', padding: '1.25rem', background: 'var(--clr-foam)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--clr-forest)', fontFamily: 'var(--font-display)' }}>
                ₹{crop.pricePerUnit?.toLocaleString()}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--clr-text-muted)' }}> / {crop.unit}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
                {effective > 0 ? `${effective.toLocaleString()} ${crop.unit} available` : '⚠️ Out of stock'}
                {crop.minimumOrderQuantity > 1 && ` · Min. order: ${crop.minimumOrderQuantity} ${crop.unit}`}
              </div>
            </div>

            {/* Farmer info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--clr-forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {crop.farmer?.name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{crop.farmer?.farmName || crop.farmer?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                  📍 {crop.location?.city}, {crop.location?.state}
                </div>
              </div>
              <StarRating rating={crop.farmer?.rating?.average} count={crop.farmer?.rating?.count} />
            </div>

            {/* Quantity + Order */}
            {!isOwner && crop.status === 'active' && effective > 0 && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                    Quantity ({crop.unit})
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setQty(q => Math.max(crop.minimumOrderQuantity || 1, q - 1))}>−</button>
                    <input type="number" className="form-control" value={qty} min={crop.minimumOrderQuantity || 1} max={effective}
                      onChange={(e) => setQty(Math.max(crop.minimumOrderQuantity || 1, Math.min(effective, Number(e.target.value))))}
                      style={{ width: 90, textAlign: 'center' }} />
                    <button className="btn btn-ghost btn-sm" onClick={() => setQty(q => Math.min(effective, q + 1))}>+</button>
                    <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>= <strong>₹{totalPrice}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {isAuthenticated && user?.role === 'retailer' ? (
                    <button className="btn btn-primary btn-lg" onClick={() => setOrderModal(true)} style={{ flex: 1 }}>
                      🛒 Place Order
                    </button>
                  ) : !isAuthenticated ? (
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Login to Order</Link>
                  ) : (
                    <div className="alert alert-info" style={{ width: '100%', margin: 0 }}>Only retailers can place orders.</div>
                  )}
                </div>
              </div>
            )}
            {isOwner && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to={`/farmer/crops/edit/${crop._id}`} className="btn btn-secondary">✏️ Edit Listing</Link>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="tabs">
            {['details', 'reviews'].map((t) => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>
                {t === 'details' ? '📋 Details' : `⭐ Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="card"><div className="card-body">
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Crop Information</h4>
                {[
                  ['Description', crop.description],
                  ['Harvest Date', crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString('en-IN') : '—'],
                  ['Expiry Date', crop.expiryDate ? new Date(crop.expiryDate).toLocaleDateString('en-IN') : '—'],
                  ['Min. Order', `${crop.minimumOrderQuantity} ${crop.unit}`],
                  ['Farming Type', crop.isOrganic ? 'Organic' : 'Conventional'],
                  ['Certifications', crop.certifications?.join(', ') || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--clr-text-muted)', minWidth: 120, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: 'var(--clr-text)' }}>{v}</span>
                  </div>
                ))}
              </div></div>
              <div className="card"><div className="card-body">
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Shipping & Location</h4>
                {[
                  ['Location', `${crop.location?.city}, ${crop.location?.state}`],
                  ['Shipping', crop.shippingAvailable ? `Available · ₹${crop.shippingCost}` : 'Pickup only'],
                  ['Delivery Days', crop.deliveryDays ? `${crop.deliveryDays} days` : '3-5 days'],
                  ['Views', crop.views],
                  ['Orders', crop.orderCount],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--clr-text-muted)', minWidth: 120, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: 'var(--clr-text)' }}>{v}</span>
                  </div>
                ))}
              </div></div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <EmptyState icon="⭐" title="No reviews yet" subtitle="Reviews from verified purchases will appear here." />
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="card" style={{ marginBottom: '1rem' }}>
                    <div className="card-body">
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--clr-forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                          {r.reviewer?.name?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewer?.name}</div>
                          <StarRating rating={r.rating} />
                          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{r.comment}</p>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
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

      {/* Order Modal */}
      {orderModal && (
        <div className="modal-overlay" onClick={() => setOrderModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Place Order — {crop.name}</h3>
              <button onClick={() => setOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="modal-body">
              {/* Order summary */}
              <div style={{ background: 'var(--clr-foam)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                  <span>{crop.name} × {qty} {crop.unit}</span>
                  <span>₹{totalPrice}</span>
                </div>
                {crop.shippingCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                    <span>Shipping</span><span>₹{crop.shippingCost}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--clr-border)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--clr-forest)' }}>₹{(qty * crop.pricePerUnit + (crop.shippingCost || 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery address */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Delivery Address</h4>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <input className="form-control" placeholder="Full Name *" value={deliveryAddr.name}
                    onChange={(e) => setDeliveryAddr({ ...deliveryAddr, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <input className="form-control" placeholder="Phone *" value={deliveryAddr.phone}
                    onChange={(e) => setDeliveryAddr({ ...deliveryAddr, phone: e.target.value })} />
                </div>
              </div>
              <input className="form-control" placeholder="Street Address *" value={deliveryAddr.address}
                onChange={(e) => setDeliveryAddr({ ...deliveryAddr, address: e.target.value })}
                style={{ marginBottom: '0.75rem' }} />
              <div className="form-row">
                <input className="form-control" placeholder="City *" value={deliveryAddr.city}
                  onChange={(e) => setDeliveryAddr({ ...deliveryAddr, city: e.target.value })} />
                <input className="form-control" placeholder="State *" value={deliveryAddr.state}
                  onChange={(e) => setDeliveryAddr({ ...deliveryAddr, state: e.target.value })} />
              </div>
              <input className="form-control" placeholder="Pincode *" value={deliveryAddr.pincode}
                onChange={(e) => setDeliveryAddr({ ...deliveryAddr, pincode: e.target.value })}
                style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }} />
              <textarea className="form-control" placeholder="Notes to farmer (optional)..." value={notes}
                onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setOrderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleOrder} disabled={placing}>
                {placing ? '⏳ Placing...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .page > .container > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default CropDetailPage;
