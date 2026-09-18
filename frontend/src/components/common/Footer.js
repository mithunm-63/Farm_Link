// ========== Footer.js ==========
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer style={{ background: 'var(--clr-earth-dark)', color: 'var(--clr-mint)', padding: '3rem 0 1.5rem' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
            🌾 FarmLink
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-mint)', lineHeight: 1.7 }}>
            Connecting farmers directly with retailers. Fresh produce, fair prices, no middlemen.
          </p>
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Platform</h4>
          {[['Marketplace', '/marketplace'], ['For Farmers', '/register'], ['For Retailers', '/register']].map(([label, href]) => (
            <div key={label} style={{ marginBottom: '0.5rem' }}>
              <Link to={href} style={{ color: 'var(--clr-mint)', fontSize: '0.875rem', textDecoration: 'none' }}>{label}</Link>
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Contact</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-mint)' }}>support@farmlink.com</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-mint)', marginTop: '0.5rem' }}>+91 1800-FARMLINK</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #2d4a2d', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#5a8c5a' }}>© 2024 FarmLink. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', color: '#5a8c5a' }}>Made with 🌱 for India's farmers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
