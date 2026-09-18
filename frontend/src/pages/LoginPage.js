// ========= LoginPage.js =========
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      const res = await dispatch(loginUser(form)).unwrap();
      toast.success(res.message || 'Logged in!');
      navigate(res.user.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard');
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  const fillDemo = (role) => {
    setForm(role === 'farmer'
      ? { email: 'farmer1@farmlink.com', password: 'password123' }
      : { email: 'retailer1@farmlink.com', password: 'password123' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--clr-cream) 0%, var(--clr-foam) 100%)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--clr-earth-dark)', textDecoration: 'none' }}>🌾 FarmLink</Link>
          <h2 style={{ marginTop: '1rem', color: 'var(--clr-text)' }}>Welcome back</h2>
          <p style={{ color: 'var(--clr-text-muted)' }}>Login to your account</p>
        </div>

        {/* Demo accounts */}
        <div style={{ background: 'var(--clr-foam)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>⚡ Quick Demo Login</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('farmer')}>🧑‍🌾 Farmer Demo</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('retailer')}>🏪 Retailer Demo</button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" name="email" placeholder="your@email.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required />
              </div>
              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--clr-forest)' }}>Forgot password?</Link>
              </div>
              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                {loading ? '⏳ Logging in...' : '🔐 Login'}
              </button>
            </form>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--clr-forest)', fontWeight: 600 }}>Register free</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
