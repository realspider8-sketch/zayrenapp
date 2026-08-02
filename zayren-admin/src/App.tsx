import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardOverview from './pages/DashboardOverview';
import DeliveryLogistics from './pages/DeliveryLogistics';
import Orders from './pages/Orders';
import DeliveryAgents from './pages/DeliveryAgents';
import Products from './pages/Products';
import Customers from './pages/Customers';
import MyShop from './pages/MyShop';
import Analytics from './pages/Analytics';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Marketing from './pages/Marketing';
import Reviews from './pages/Reviews';
import Staff from './pages/Staff';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Layout */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Header />
                <div className="page-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/delivery" element={<DeliveryLogistics />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/agents" element={<DeliveryAgents />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/shop" element={<MyShop />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/reviews" element={<Reviews />} />
                    <Route path="/staff" element={<Staff />} />
                    {/* Other routes will be added module by module */}
                  </Routes>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
