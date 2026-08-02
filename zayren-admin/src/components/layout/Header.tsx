import { Search, Bell, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="flex-col">
        <h1 className="text-xl font-bold">Good morning, Zay Mart</h1>
        <p className="text-sm text-muted">Here's what's happening with your shop today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div style={{ position: 'relative' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text" 
            placeholder="Search orders, products, customers..." 
            className="search-input"
          />
        </div>

        <button style={{ position: 'relative', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', top: '-4px', right: '-4px', 
            background: 'var(--danger)', color: 'white', 
            fontSize: '10px', fontWeight: 'bold', 
            width: '16px', height: '16px', 
            borderRadius: '8px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center' 
          }}>12</span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer" style={{ cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#333', overflow: 'hidden' }}>
            <img src="https://i.pravatar.cc/100?img=33" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="flex-col">
            <span className="text-sm font-bold">Zay Mart Owner</span>
            <span className="text-xs text-muted">Shop Admin</span>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>
      </div>
    </header>
  );
};

export default Header;
