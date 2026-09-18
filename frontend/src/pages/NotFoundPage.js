import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <div>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌾</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--clr-forest)', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem', maxWidth: 400 }}>
        Looks like this crop has been harvested already. The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">🏠 Back to Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
