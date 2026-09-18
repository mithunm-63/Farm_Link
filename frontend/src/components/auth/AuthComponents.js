/**
 * Auth Components
 * Route guards, role protection, and auth layout wrapper
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store';
import { LoadingSpinner } from '../common/LoadingSpinner';

// ── PrivateRoute ──────────────────────────────────────────────
// Redirects unauthenticated users to /login
export const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    const redirectTo = user?.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// ── PublicRoute ───────────────────────────────────────────────
// Redirects authenticated users away from login/register
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (isAuthenticated) {
    const redirectTo = user?.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// ── RoleGuard ─────────────────────────────────────────────────
// Conditionally renders content based on user role
export const RoleGuard = ({ role, children, fallback = null }) => {
  const { user } = useSelector((s) => s.auth);
  if (user?.role !== role) return fallback;
  return children;
};

// ── MultiRoleGuard ────────────────────────────────────────────
export const MultiRoleGuard = ({ roles = [], children, fallback = null }) => {
  const { user } = useSelector((s) => s.auth);
  if (!roles.includes(user?.role)) return fallback;
  return children;
};

// ── AuthInit ──────────────────────────────────────────────────
// Initialize auth state on app load — place at the top of App
export const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    // Refresh user data from server if token exists
    if (isAuthenticated && !user) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, dispatch]);

  return children;
};

// ── AuthLayout ────────────────────────────────────────────────
// Centered card layout for login/register pages
export const AuthLayout = ({ children, title, subtitle }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--clr-cream) 0%, var(--clr-foam) 60%, var(--clr-wheat) 100%)',
    padding: '2rem 1rem',
  }}>
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--clr-earth-dark)', marginBottom: '0.5rem' }}>
          🌾 FarmLink
        </div>
        {title && <h2 style={{ color: 'var(--clr-text)', marginBottom: '0.25rem' }}>{title}</h2>}
        {subtitle && <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

// ── useRequireAuth ────────────────────────────────────────────
// Imperative hook — use inside components to check auth
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const location = useLocation();

  return {
    isAuthenticated,
    user,
    redirectProps: !isAuthenticated
      ? { to: redirectTo, state: { from: location }, replace: true }
      : null,
  };
};

export default PrivateRoute;
