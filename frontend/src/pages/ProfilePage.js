import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../store';
import { authAPI } from '../services/api';
import { StarRating } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    pincode: user?.location?.pincode || '',
    farmName: user?.farmName || '',
    farmSize: user?.farmSize || '',
    farmingType: user?.farmingType || 'organic',
    yearsOfExperience: user?.yearsOfExperience || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || 'grocery',
    gstNumber: user?.gstNumber || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await dispatch(updateProfile({
        name: form.name, phone: form.phone,
        location: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
        ...(user?.role === 'farmer' ? { farmName: form.farmName, farmSize: form.farmSize, farmingType: form.farmingType, yearsOfExperience: Number(form.yearsOfExperience) }
          : { businessName: form.businessName, businessType: form.businessType, gstNumber: form.gstNumber }),
      })).unwrap();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err || 'Failed to update');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password too short.'); return; }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally { setSavingPassword(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Profile header */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--clr-border)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--clr-forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
            {user?.avatar?.url ? <img src={user.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.name?.[0]}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              {user?.role === 'farmer' && user?.farmName && <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{user.farmName}</span>}
              {user?.role === 'retailer' && user?.businessName && <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{user.businessName}</span>}
            </div>
            <StarRating rating={user?.rating?.average} count={user?.rating?.count} />
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--clr-forest)' }}>{user?.totalTransactions || 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>Transactions</div>
          </div>
        </div>

        <div className="tabs">
          {[['profile', '👤 Profile'], ['security', '🔒 Security']].map(([t, label]) => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{label}</button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Personal Details</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user?.email} disabled style={{ background: 'var(--clr-surface)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Location</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-control" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" name="city" value={form.city} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-control" name="state" value={form.state} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-control" name="pincode" value={form.pincode} onChange={handleChange} style={{ maxWidth: 200 }} />
                </div>
              </div>
            </div>

            {user?.role === 'farmer' && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Farm Details</h3></div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Farm Name</label>
                      <input className="form-control" name="farmName" value={form.farmName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Farm Size</label>
                      <input className="form-control" name="farmSize" value={form.farmSize} onChange={handleChange} placeholder="e.g. 5 acres" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Farming Type</label>
                      <select className="form-control" name="farmingType" value={form.farmingType} onChange={handleChange}>
                        <option value="organic">🌿 Organic</option>
                        <option value="conventional">🌾 Conventional</option>
                        <option value="mixed">🌱 Mixed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years of Experience</label>
                      <input className="form-control" type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'retailer' && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Business Details</h3></div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Business Name</label>
                      <input className="form-control" name="businessName" value={form.businessName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Type</label>
                      <select className="form-control" name="businessType" value={form.businessType} onChange={handleChange}>
                        <option value="restaurant">Restaurant</option>
                        <option value="grocery">Grocery</option>
                        <option value="supermarket">Supermarket</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input className="form-control" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={savingProfile}>
              {savingProfile ? '⏳ Saving...' : '✅ Save Profile'}
            </button>
          </form>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword}>
            <div className="card">
              <div className="card-header"><h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}>Change Password</h3></div>
              <div className="card-body">
                {['currentPassword','newPassword','confirmPassword'].map((field) => (
                  <div key={field} className="form-group">
                    <label className="form-label">
                      {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                    </label>
                    <input className="form-control" type="password" value={pwForm[field]}
                      onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                      placeholder="••••••••" minLength={field !== 'currentPassword' ? 6 : undefined} required />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : '🔒 Update Password'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
