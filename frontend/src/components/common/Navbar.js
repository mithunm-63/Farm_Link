import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store';
import { notificationsAPI } from '../../services/api';
import { setNotifications, markAllRead } from '../../store';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { unreadCount, items: notifications } = useSelector((s) => s.notifications);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsAPI.getAll({ limit: 10 })
        .then((data) => dispatch(setNotifications(data)))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleMarkAllRead = () => {
    notificationsAPI.markAllRead().then(() => dispatch(markAllRead())).catch(() => {});
  };

  const dashboardLink = user?.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">Farm<span className="logo-accent">Link</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          <Link to="/marketplace" className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}>
            Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link to={dashboardLink} className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
                Orders
              </Link>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="notif-wrapper" ref={notifRef}>
                <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                  <span>🔔</span>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span className="bold">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                            <div className="notif-message">{n.message}</div>
                            <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="user-menu-wrapper">
                <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="user-avatar">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
                  <span className="chevron">▾</span>
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user?.name}</strong>
                      <span className="role-badge">{user?.role}</span>
                    </div>
                    <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                    <Link to={dashboardLink} className="dropdown-item">📊 Dashboard</Link>
                    {user?.role === 'farmer' && (
                      <Link to="/farmer/crops/add" className="dropdown-item">➕ Add Crop</Link>
                    )}
                    <Link to="/orders" className="dropdown-item">📦 Orders</Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/marketplace" className="mobile-nav-link">Marketplace</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} className="mobile-nav-link">Dashboard</Link>
              <Link to="/orders" className="mobile-nav-link">Orders</Link>
              <Link to="/profile" className="mobile-nav-link">Profile</Link>
              <button className="mobile-nav-link logout-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link">Login</Link>
              <Link to="/register" className="mobile-nav-link">Register</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 500;
          background: rgba(250, 247, 240, 0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .navbar-scrolled {
          border-bottom-color: var(--clr-border);
          box-shadow: var(--shadow-sm);
        }
        .navbar-container {
          display: flex; align-items: center; gap: var(--space-lg);
          max-width: 1280px; margin: 0 auto; padding: 0.9rem var(--space-lg);
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--clr-text);
          font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;
          flex-shrink: 0;
        }
        .logo-icon { font-size: 1.6rem; }
        .logo-accent { color: var(--clr-forest); }
        .navbar-links { display: flex; align-items: center; gap: var(--space-lg); margin-left: var(--space-lg); flex: 1; }
        .nav-link { color: var(--clr-text-muted); font-size: 0.9rem; font-weight: 500; text-decoration: none; padding: 0.3rem 0; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .nav-link:hover, .nav-link.active { color: var(--clr-forest); border-bottom-color: var(--clr-forest); }
        .navbar-actions { display: flex; align-items: center; gap: var(--space-sm); margin-left: auto; }
        .notif-wrapper { position: relative; }
        .notif-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; position: relative; padding: 6px; border-radius: var(--radius-sm); }
        .notif-btn:hover { background: var(--clr-surface); }
        .notif-badge { position: absolute; top: 0; right: 0; background: #e53935; color: white; font-size: 0.65rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .notif-dropdown { position: absolute; right: 0; top: calc(100% + 10px); width: 320px; background: var(--clr-white); border-radius: var(--radius-lg); border: 1px solid var(--clr-border); box-shadow: var(--shadow-xl); z-index: 600; overflow: hidden; animation: scaleIn 0.15s ease; }
        .notif-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--clr-border); font-size: 0.9rem; }
        .mark-read-btn { background: none; border: none; color: var(--clr-forest); font-size: 0.8rem; cursor: pointer; }
        .notif-list { max-height: 300px; overflow-y: auto; }
        .notif-item { padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--clr-border); cursor: pointer; transition: background 0.15s; }
        .notif-item:hover { background: var(--clr-surface); }
        .notif-item.unread { background: var(--clr-foam); }
        .notif-message { font-size: 0.85rem; color: var(--clr-text); margin-bottom: 2px; }
        .notif-time { font-size: 0.75rem; color: var(--clr-text-muted); }
        .notif-empty { padding: var(--space-xl); text-align: center; color: var(--clr-text-muted); font-size: 0.85rem; }
        .user-menu-wrapper { position: relative; }
        .user-avatar-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid var(--clr-border); border-radius: var(--radius-full); padding: 5px 12px 5px 5px; cursor: pointer; transition: all 0.2s; }
        .user-avatar-btn:hover { border-color: var(--clr-sage); background: var(--clr-surface); }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--clr-forest); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; overflow: hidden; }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name-short { font-size: 0.85rem; font-weight: 500; color: var(--clr-text); }
        .chevron { font-size: 0.7rem; color: var(--clr-text-muted); }
        .user-dropdown { position: absolute; right: 0; top: calc(100% + 10px); width: 220px; background: var(--clr-white); border-radius: var(--radius-lg); border: 1px solid var(--clr-border); box-shadow: var(--shadow-xl); overflow: hidden; z-index: 600; animation: scaleIn 0.15s ease; }
        .user-dropdown-header { padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--clr-border); display: flex; flex-direction: column; gap: 4px; }
        .role-badge { font-size: 0.7rem; background: var(--clr-foam); color: var(--clr-forest); padding: 2px 8px; border-radius: 9px; width: fit-content; text-transform: capitalize; font-weight: 500; }
        .dropdown-item { display: flex; align-items: center; gap: 8px; padding: 0.7rem var(--space-lg); font-size: 0.88rem; color: var(--clr-text); text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; transition: background 0.15s; }
        .dropdown-item:hover { background: var(--clr-surface); }
        .dropdown-divider { border: none; border-top: 1px solid var(--clr-border); margin: 4px 0; }
        .logout-item { color: var(--clr-danger); }
        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 6px; }
        .hamburger { display: block; width: 22px; height: 2px; background: var(--clr-text); position: relative; transition: all 0.3s; }
        .hamburger::before, .hamburger::after { content: ''; position: absolute; width: 100%; height: 2px; background: var(--clr-text); transition: all 0.3s; }
        .hamburger::before { top: -7px; }
        .hamburger::after { top: 7px; }
        .mobile-menu { display: none; background: var(--clr-white); border-top: 1px solid var(--clr-border); padding: var(--space-md); }
        .mobile-nav-link { display: block; padding: 0.75rem var(--space-md); color: var(--clr-text); text-decoration: none; font-size: 0.95rem; font-weight: 500; border-radius: var(--radius-md); transition: background 0.15s; border: none; background: none; width: 100%; text-align: left; cursor: pointer; }
        .mobile-nav-link:hover { background: var(--clr-surface); }
        .logout-link { color: var(--clr-danger); }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .user-name-short { display: none; }
          .mobile-toggle { display: block; }
          .mobile-menu { display: block; animation: slideUp 0.2s ease; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
