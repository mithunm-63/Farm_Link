import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedCrops } from '../store';
import CropCard from '../components/common/CropCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((s) => s.crops);

  useEffect(() => { dispatch(fetchFeaturedCrops()); }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--clr-earth-dark) 0%, var(--clr-earth-deep) 50%, var(--clr-forest) 100%)',
        padding: '5rem 0 4rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(168,213,168,0.15)', color: 'var(--clr-mint)', padding: '0.4rem 1.2rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem', border: '1px solid rgba(168,213,168,0.3)' }}>
              🌱 Direct Farm-to-Table Marketplace
            </div>
            <h1 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              From Farm to Retail —<br />
              <span style={{ color: 'var(--clr-moss)' }}>No Middlemen</span>
            </h1>
            <p style={{ color: 'var(--clr-mint)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
              FarmLink connects farmers directly with retailers. Get fresh produce at fair prices, with complete transparency and trust.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/marketplace" className="btn btn-amber btn-lg">
                🛒 Browse Marketplace
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ borderColor: 'var(--clr-mint)', color: 'var(--clr-mint)' }}>
                Get Started Free
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
              {[['500+', 'Farmers'], ['2000+', 'Retailers'], ['50K+', 'Orders'], ['₹2Cr+', 'Transactions']].map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{val}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-mint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'var(--clr-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">How FarmLink Works</h2>
            <p className="section-subtitle">Simple, transparent, and fair for everyone</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🌾', step: '01', title: 'Farmer Lists Crops', desc: 'Farmers post fresh harvest listings with photos, prices, and availability.' },
              { icon: '🔍', step: '02', title: 'Retailer Discovers', desc: 'Retailers browse the marketplace with smart filters by location, price, and type.' },
              { icon: '🤝', step: '03', title: 'Order & Confirm', desc: 'Place orders directly. Farmers review and accept or decline within 24 hours.' },
              { icon: '🚚', step: '04', title: 'Deliver & Pay', desc: 'Produce is delivered fresh. Payments are processed securely and directly.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-mint)', letterSpacing: '0.1em', fontFamily: 'var(--font-display)' }}>{item.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured crops */}
      <section className="section" style={{ background: 'var(--clr-foam)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title">Featured Harvests</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Fresh picks from top-rated farmers</p>
            </div>
            <Link to="/marketplace" className="btn btn-secondary">View All →</Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="crop-grid">
              {featured.slice(0, 6).map((crop) => (
                <CropCard key={crop._id} crop={crop} />
              ))}
            </div>
          )}
          {!loading && featured.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
              <p>No featured crops yet. <Link to="/marketplace">Browse all crops →</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* CTA banners */}
      <section className="section" style={{ background: 'var(--clr-cream)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Farmer CTA */}
            <div style={{ background: 'var(--clr-earth-dark)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑‍🌾</div>
              <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Are you a Farmer?</h3>
              <p style={{ color: 'var(--clr-mint)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
                List your crops, manage orders, and get paid fairly — no agents, no commissions.
              </p>
              <Link to="/register?role=farmer" className="btn btn-amber">Start Selling</Link>
            </div>
            {/* Retailer CTA */}
            <div style={{ background: 'linear-gradient(135deg, var(--clr-forest), var(--clr-sage))', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Are you a Retailer?</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
                Source fresh produce directly from verified farmers. Competitive prices, guaranteed quality.
              </p>
              <Link to="/register?role=retailer" className="btn" style={{ background: 'white', color: 'var(--clr-forest)', borderColor: 'white' }}>Start Buying</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section" style={{ background: 'var(--clr-wheat)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Why Choose FarmLink?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '💰', title: 'Better Prices', desc: 'Eliminate middlemen. Farmers earn more, retailers save more.' },
              { icon: '🌿', title: 'Fresh Quality', desc: 'Direct from farm ensures peak freshness and nutritional value.' },
              { icon: '🔒', title: 'Verified Farmers', desc: 'All farmers are verified with ratings from real transactions.' },
              { icon: '📱', title: 'Easy Tracking', desc: 'Real-time order tracking from farm to your doorstep.' },
              { icon: '⚡', title: 'Fast Matching', desc: 'Smart filters connect you with the right produce instantly.' },
              { icon: '🤝', title: 'Direct Deals', desc: 'Negotiate and communicate directly with farmers.' },
            ].map((item) => (
              <div key={item.title} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--clr-border)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h4 style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--clr-text)', fontFamily: 'var(--font-body)' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
