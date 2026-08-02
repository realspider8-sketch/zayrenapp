import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Share2, MapPin, Phone, Tag } from 'lucide-react';

interface ShopProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  logo_url: string;
  banner_url: string;
  stats: {
    total_orders: number;
    total_revenue: string;
    active_products: number;
  };
}

const MyShop = () => {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopProfile | null>(null);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/shop/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShop(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shop profile:", error);
        
        // Fallback for visual testing
        const mockShop: ShopProfile = {
          id: "1",
          name: "Zayren Premium Store",
          description: "Your one-stop shop for everything premium. We provide the best clothing, electronics, and accessories with lightning fast delivery.",
          category: "Supermarket",
          address: "45 Business Avenue, Victoria Island, Lagos",
          phone: "0801 234 5678",
          logo_url: "https://i.pravatar.cc/150?img=33",
          banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
          stats: {
            total_orders: 1250,
            total_revenue: "₦1,500,000",
            active_products: 45
          }
        };
        setShop(mockShop);
        setLoading(false);
      }
    };

    fetchShopProfile();
  }, []);

  if (loading || !shop) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading profile...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Banner */}
        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
          <img src={shop.banner_url} alt="Shop Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))' }}></div>
        </div>

        {/* Profile Details Container */}
        <div className="flex-col" style={{ padding: '24px', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
          
          <div className="flex justify-between items-end">
            <div className="flex items-end gap-4">
              <img 
                src={shop.logo_url} 
                alt="Shop Logo" 
                style={{ width: '100px', height: '100px', borderRadius: '16px', border: '4px solid #1a1a24', objectFit: 'cover', background: '#2a2a36' }} 
              />
              <div className="flex-col pb-2">
                <h1 className="text-xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{shop.name}</h1>
                <span className="badge badge-primary mt-1 flex items-center gap-1 w-fit" style={{ fontSize: '11px' }}>
                  <Tag size={12} /> {shop.category}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <button className="btn btn-outline flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Share2 size={16} /> Share Link
              </button>
              <button className="btn btn-primary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Edit3 size={16} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="grid mt-6 gap-6" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
            
            <div className="flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">About Shop</h3>
                <p className="text-sm" style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                  {shop.description}
                </p>
              </div>

              <div className="flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={16} className="text-primary" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Phone size={16} className="text-primary" />
                  <span>{shop.phone}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-col gap-3">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Quick Stats</h3>
              
              <div className="flex justify-between items-center" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-muted">Total Revenue</span>
                <span className="text-sm font-bold text-success">{shop.stats.total_revenue}</span>
              </div>

              <div className="flex justify-between items-center" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-muted">Total Orders</span>
                <span className="text-sm font-bold">{shop.stats.total_orders.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-muted">Active Products</span>
                <span className="text-sm font-bold">{shop.stats.active_products}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default MyShop;
