import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Package } from 'lucide-react';

interface DeliveryRequest {
  id: string;
  provider: string;
  origin: string;
  destination: string;
  fee: string;
  status: string;
  created_at: string;
}

const DeliveryLogistics = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'completed'>('requests');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/delivery/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRequests(response.data.requests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching delivery requests:", error);
        
        // Fallback for visual testing
        setRequests([
          { id: "#DLV-765401", provider: "Zay Express", origin: "Kano", destination: "Kaduna", fee: "₦2,500", status: "Pending", created_at: "2026-08-01T10:00:00Z" },
          { id: "#DLV-765292", provider: "Speedy Delivery", origin: "Kano", destination: "Abuja", fee: "₦3,000", status: "On the Way", created_at: "2026-08-01T09:30:00Z" },
          { id: "#DLV-785380", provider: "Zay Express", origin: "Kano", destination: "Lagos", fee: "₦2,000", status: "Delivered", created_at: "2026-07-31T15:00:00Z" },
          { id: "#DLV-755370", provider: "Fast Track Logistics", origin: "Kano", destination: "Jos", fee: "₦1,800", status: "Delivered", created_at: "2026-07-30T11:20:00Z" }
        ]);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const getFilteredRequests = () => {
    return requests.filter(req => {
      const s = req.status.toLowerCase();
      if (activeTab === 'requests') return s === 'pending';
      if (activeTab === 'active') return s === 'on the way' || s === 'verifying' || s === 'pickup';
      if (activeTab === 'completed') return s === 'delivered';
      return true;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'on the way': return 'badge-info';
      case 'delivered': return 'badge-success';
      default: return 'badge-warning';
    }
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading deliveries...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '600px' }}>
      
      <div className="glass-card flex-col gap-4">
        <h2 className="text-lg font-bold">Delivery & Logistics</h2>
        
        {/* Tabs */}
        <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button 
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px' }}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
          <button 
            className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', border: activeTab === 'active' ? 'none' : 'none' }}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', border: activeTab === 'completed' ? 'none' : 'none' }}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* List */}
        <div className="flex-col gap-4 mt-2">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-muted text-sm py-4">No {activeTab} deliveries found.</div>
          ) : (
            filteredRequests.map(req => (
              <div key={req.id} className="flex justify-between items-center" style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} className="text-muted" />
                  </div>
                  <div className="flex-col">
                    <span className="text-sm font-bold text-primary">{req.id}</span>
                    <span className="text-sm font-semibold">{req.provider}</span>
                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                      <MapPin size={12} />
                      <span>{req.origin} → {req.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-col items-end gap-2">
                  <span className="text-sm font-bold">{req.fee}</span>
                  <span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
          Create Delivery Request
        </button>
      </div>

    </div>
  );
};

export default DeliveryLogistics;
