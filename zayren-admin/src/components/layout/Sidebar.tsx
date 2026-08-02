import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Package, ShoppingCart, 
  Users, Wallet, Truck, Megaphone, Star, 
  BarChart2, Settings, UserPlus, HelpCircle, 
  Bell, LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Shop', path: '/shop', icon: <Store size={20} /> },
    { name: 'Products / Items', path: '/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Earnings & Wallet', path: '/earnings', icon: <Wallet size={20} /> },
    { name: 'Delivery & Logistics', path: '/delivery', icon: <Truck size={20} /> },
    { name: 'Marketing & Ads', path: '/marketing', icon: <Megaphone size={20} /> },
    { name: 'Reviews & Ratings', path: '/reviews', icon: <Star size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Shop Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Staff / Team', path: '/staff', icon: <UserPlus size={20} /> },
    { name: 'Support Center', path: '/support', icon: <HelpCircle size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="flex items-center gap-3" style={{ padding: '0 16px 32px 16px' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          Z
        </div>
        <h2 className="text-lg font-bold">ZAYREN</h2>
      </div>

      <nav className="flex-col gap-1" style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <button 
          onClick={handleLogout}
          className="nav-item hover:text-danger transition-colors cursor-pointer" 
          style={{ width: '100%', border: 'none', background: 'none' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
