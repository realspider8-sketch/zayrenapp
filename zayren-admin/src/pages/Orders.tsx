import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  customer_avatar?: string;
  items: number;
  status: string;
  amount: string;
  time: string;
}

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrders(response.data.orders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        
        // Fallback for visual testing
        setOrders([
          { id: "#ORD-785421", customer: "John Doe", customer_avatar: "https://i.pravatar.cc/100?img=11", items: 2, status: "Pending", amount: "₦5,000", time: "10 mins ago" },
          { id: "#ORD-785419", customer: "Maryam S.", customer_avatar: "https://i.pravatar.cc/100?img=12", items: 1, status: "Processing", amount: "₦12,500", time: "25 mins ago" },
          { id: "#ORD-785416", customer: "Aliyu M.", customer_avatar: "https://i.pravatar.cc/100?img=13", items: 3, status: "Shipped", amount: "₦45,000", time: "1 hour ago" },
          { id: "#ORD-785405", customer: "Fatima A.", customer_avatar: "https://i.pravatar.cc/100?img=14", items: 1, status: "Delivered", amount: "₦3,200", time: "2 hours ago" },
          { id: "#ORD-785398", customer: "Ibrahim Y.", customer_avatar: "https://i.pravatar.cc/100?img=15", items: 2, status: "Delivered", amount: "₦8,900", time: "3 hours ago" }
        ]);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(ord => {
    const s = ord.status.toLowerCase();
    const matchesTab = activeTab === 'all' || s === activeTab;
    const matchesSearch = ord.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ord.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-info'; // could be a different shade
      case 'delivered': return 'badge-success';
      default: return 'badge-warning';
    }
  };

  const getCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status.toLowerCase() === status).length;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading orders...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '800px' }}>
      
      <div className="glass-card flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Orders</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map(tab => (
             <button 
               key={tab}
               className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
               style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', whiteSpace: 'nowrap', border: activeTab === tab ? 'none' : 'none' }}
               onClick={() => setActiveTab(tab)}
             >
               {tab.charAt(0).toUpperCase() + tab.slice(1)} <span style={{ opacity: 0.7, marginLeft: '4px' }}>{getCount(tab)}</span>
             </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-2 mb-2" style={{ maxWidth: '300px' }}>
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="input-field" 
            style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-col gap-2 mt-2">
          {filteredOrders.length === 0 ? (
            <div className="text-center text-muted text-sm py-4">No orders found.</div>
          ) : (
            filteredOrders.map(ord => (
              <div key={ord.id} className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-4" style={{ flex: 1 }}>
                  <span className="text-sm font-bold text-primary w-24">{ord.id}</span>
                  
                  <div className="flex items-center gap-2 w-40">
                    {ord.customer_avatar ? (
                       <img src={ord.customer_avatar} alt={ord.customer} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                         {ord.customer.charAt(0)}
                       </div>
                    )}
                    <span className="text-sm font-semibold truncate">{ord.customer}</span>
                  </div>

                  <span className="text-sm text-muted w-20">{ord.items} {ord.items === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`badge ${getStatusBadge(ord.status)}`} style={{ width: '80px', textAlign: 'center' }}>
                    {ord.status}
                  </span>
                  
                  <button className="btn btn-outline" style={{ padding: '4px', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                    <ChevronRight size={16} className="text-muted" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-4">
            <button className="btn btn-outline" style={{ fontSize: '13px' }}>
              View All Orders →
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
