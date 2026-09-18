import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((s) => s.auth);

  const [role, setRole] = useState(searchParams.get('role') || 'farmer');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    // Location
    address: '', city: '', state: '', pincode: '',
    // Farmer
    farmName: '', farmingType: 'organic',
    // Retailer
    businessName: '', businessType: 'grocery',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const payload = {
      name: form.name, email: form.email, password: form.password,
      role, phone: form.phone,
      location: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
      ...(role === 'farmer' ? { farmName: form.farmName, farmingType: form.farmingType } : { businessName: form.businessName, businessType: form.businessType }),
    };
    try {
      const res = await dispatch(registerUser(payload)).unwrap();
      toast.success(res.message || 'Welcome to FarmLink! 🎉');
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard');
    } catch (err) {
      toast.error(err || 'Registration failed');
      setStep(1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--clr-cream) 0%, var(--clr-foam) 100%)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--clr-earth-dark)', textDecoration: 'none' }}>🌾 FarmLink</Link>
          <h2 style={{ marginTop: '1rem' }}>Create your account</h2>
          <p style={{ color: 'var(--clr-text-muted)' }}>Join the direct farm marketplace</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', background: 'var(--clr-surface)', borderRadius: 'var(--radius-full)', padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--clr-border)' }}>
          {[['farmer', '🧑‍🌾 I\'m a Farmer'], ['retailer', '🏪 I\'m a Retailer']].map(([r, label]) => (
            <button key={r} type="button"
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s', background: role === r ? 'var(--clr-forest)' : 'transparent', color: role === r ? 'white' : 'var(--clr-text-muted)' }}
              onClick={() => setRole(r)}>{label}</button>
          ))}
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: s <= step ? 'var(--clr-forest)' : 'var(--clr-border)', color: s <= step ? 'white' : 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{s}</div>
              {s < 2 && <div style={{ flex: 1, height: 2, background: s < step ? 'var(--clr-forest)' : 'var(--clr-border)' }} />}
            </React.Fragment>
          ))}
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginLeft: '0.5rem' }}>
            {step === 1 ? 'Account Details' : 'Business Info'}
          </span>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-control" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-control" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Next →</button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                {role === 'farmer' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Farm Name *</label>
                      <input className="form-control" name="farmName" placeholder="e.g. Green Valley Farm" value={form.farmName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Farming Type</label>
                      <select className="form-control" name="farmingType" value={form.farmingType} onChange={handleChange}>
                        <option value="organic">🌿 Organic</option>
                        <option value="conventional">🌾 Conventional</option>
                        <option value="mixed">🌱 Mixed</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Business Name *</label>
                      <input className="form-control" name="businessName" placeholder="e.g. Fresh Mart Store" value={form.businessName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Type</label>
                      <select className="form-control" name="businessType" value={form.businessType} onChange={handleChange}>
                        <option value="restaurant">🍽️ Restaurant</option>
                        <option value="grocery">🛒 Grocery Store</option>
                        <option value="supermarket">🏬 Supermarket</option>
                        <option value="wholesaler">📦 Wholesaler</option>
                        <option value="other">💼 Other</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Location */}
                <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--clr-text)' }}>Location</h4>
                <div className="form-group">
                  <input className="form-control" name="address" placeholder="Street Address" value={form.address} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input className="form-control" name="city" placeholder="City *" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <input className="form-control" name="state" placeholder="State *" value={form.state} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <input className="form-control" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                    {loading ? '⏳ Creating...' : '🎉 Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--clr-forest)', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
