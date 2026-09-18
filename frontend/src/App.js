import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store, { getMe } from './store';
import { SocketProvider } from './context/SocketContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import CropDetailPage from './pages/CropDetailPage';
import FarmerDashboard from './pages/FarmerDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddCropPage from './pages/AddCropPage';
import EditCropPage from './pages/EditCropPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route guards
const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard'} replace />;
  }
  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(getMe());
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/crops/:id" element={<CropDetailPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Private - Farmer */}
          <Route path="/farmer/dashboard" element={<PrivateRoute role="farmer"><FarmerDashboard /></PrivateRoute>} />
          <Route path="/farmer/crops/add" element={<PrivateRoute role="farmer"><AddCropPage /></PrivateRoute>} />
          <Route path="/farmer/crops/edit/:id" element={<PrivateRoute role="farmer"><EditCropPage /></PrivateRoute>} />

          {/* Private - Retailer */}
          <Route path="/retailer/dashboard" element={<PrivateRoute role="retailer"><RetailerDashboard /></PrivateRoute>} />

          {/* Private - Both */}
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <AppContent />
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;
