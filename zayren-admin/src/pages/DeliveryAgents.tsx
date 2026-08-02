import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, MoreVertical } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  phone: string;
  status: string;
  deliveries: number;
  profile_pic?: string;
}

const DeliveryAgents = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/delivery/agents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAgents(response.data.agents);
        setTotalActive(response.data.total_active);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching agents:", error);
        
        // Fallback for visual testing
        const mockAgents = [
          { id: "1", name: "John Doe", phone: "08012345678", status: "Active", deliveries: 150, profile_pic: "https://i.pravatar.cc/100?img=11" },
          { id: "2", name: "Musa Ali", phone: "08123456789", status: "Active", deliveries: 89, profile_pic: "https://i.pravatar.cc/100?img=12" },
          { id: "3", name: "Chidi O.", phone: "09087654321", status: "Inactive", deliveries: 45, profile_pic: "https://i.pravatar.cc/100?img=13" },
          { id: "4", name: "Oluwa Femi", phone: "07011223344", status: "Active", deliveries: 210, profile_pic: "https://i.pravatar.cc/100?img=14" }
        ];
        setAgents(mockAgents);
        setTotalActive(mockAgents.filter(a => a.status === 'Active').length);
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading agents...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '800px' }}>
      
      <div className="glass-card flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <div className="flex-col">
            <h2 className="text-lg font-bold">Delivery Personnel</h2>
            <div className="flex gap-4 mt-1">
              <span className="text-sm text-muted">Total Agents: <span className="font-bold text-white">{agents.length}</span></span>
              <span className="text-sm text-muted">Active: <span className="font-bold text-success">{totalActive}</span></span>
            </div>
          </div>
          <button className="btn btn-primary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <UserPlus size={16} />
            Add New Agent
          </button>
        </div>

        {/* List Table */}
        <div className="flex-col mt-4">
          
          <div className="flex items-center text-xs font-bold text-muted uppercase tracking-wider mb-2" style={{ padding: '0 12px' }}>
            <div style={{ flex: 2 }}>Agent Name</div>
            <div style={{ flex: 1.5 }}>Phone Number</div>
            <div style={{ flex: 1 }}>Deliveries</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ width: '32px' }}></div>
          </div>

          <div className="flex-col gap-2">
            {agents.length === 0 ? (
              <div className="text-center text-muted text-sm py-8">No delivery agents found.</div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="flex items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div className="flex items-center gap-3" style={{ flex: 2 }}>
                    {agent.profile_pic ? (
                      <img src={agent.profile_pic} alt={agent.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-semibold">{agent.name}</span>
                  </div>

                  <div className="text-sm text-muted" style={{ flex: 1.5 }}>
                    {agent.phone}
                  </div>

                  <div className="text-sm font-bold" style={{ flex: 1 }}>
                    {agent.deliveries}
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className={`badge ${agent.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {agent.status}
                    </span>
                  </div>

                  <div style={{ width: '32px' }} className="flex justify-end">
                    <button className="btn btn-outline" style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                      <MoreVertical size={16} className="text-muted hover:text-white transition-colors" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DeliveryAgents;
