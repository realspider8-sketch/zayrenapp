import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, TrendingUp, Users, Target } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Ended';
  type: string;
  reach: string;
  clicks: string;
  conversions: string;
}

const Marketing = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const fetchMarketing = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/marketing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCampaigns(response.data.campaigns);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching marketing data:", error);
        
        // Fallback for visual testing
        setCampaigns([
          { id: "CAMP-001", name: "Summer Flash Sale", status: "Active", type: "Discount", reach: "12,450", clicks: "1,204", conversions: "342" },
          { id: "CAMP-002", name: "New Arrivals Push", status: "Scheduled", type: "Banner Ad", reach: "-", clicks: "-", conversions: "-" },
          { id: "CAMP-003", name: "Weekend Free Delivery", status: "Ended", type: "Promo Code", reach: "8,200", clicks: "950", conversions: "128" }
        ]);
        setLoading(false);
      }
    };

    fetchMarketing();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[rgba(var(--success-rgb),0.1)] text-success border-success/20';
      case 'Scheduled': return 'bg-[rgba(var(--warning-rgb),0.1)] text-warning border-warning/20';
      default: return 'bg-white/5 text-muted border-white/10';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading marketing data...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '1000px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Megaphone className="text-primary" size={24} /> 
          Marketing & Campaigns
        </h2>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      {/* KPI Summary for active marketing */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-card flex items-center gap-4 p-4">
          <div className="flex items-center justify-center rounded-full bg-[rgba(var(--primary-rgb),0.15)] text-primary w-12 h-12">
            <Users size={24} />
          </div>
          <div className="flex-col">
            <span className="text-sm text-muted uppercase font-semibold tracking-wider">Total Reach</span>
            <span className="text-2xl font-bold">20,650</span>
          </div>
        </div>
        
        <div className="glass-card flex items-center gap-4 p-4">
          <div className="flex items-center justify-center rounded-full bg-[rgba(var(--primary-rgb),0.15)] text-primary w-12 h-12">
            <Target size={24} />
          </div>
          <div className="flex-col">
            <span className="text-sm text-muted uppercase font-semibold tracking-wider">Total Clicks</span>
            <span className="text-2xl font-bold">2,154</span>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4 p-4">
          <div className="flex items-center justify-center rounded-full bg-[rgba(var(--primary-rgb),0.15)] text-primary w-12 h-12">
            <TrendingUp size={24} />
          </div>
          <div className="flex-col">
            <span className="text-sm text-muted uppercase font-semibold tracking-wider">Conversions</span>
            <span className="text-2xl font-bold">470</span>
          </div>
        </div>
      </div>

      <div className="glass-card flex-col mt-2">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-bold">Campaigns</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="text-muted text-sm border-b border-white/5">
                <th className="p-4 font-semibold">Campaign Name</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Reach</th>
                <th className="p-4 font-semibold text-right">Clicks</th>
                <th className="p-4 font-semibold text-right">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold">{camp.name}</div>
                    <div className="text-xs text-muted">{camp.id}</div>
                  </td>
                  <td className="p-4 text-sm">{camp.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(camp.status)}`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">{camp.reach}</td>
                  <td className="p-4 text-right font-medium">{camp.clicks}</td>
                  <td className="p-4 text-right font-medium text-success">{camp.conversions}</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">No campaigns found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Marketing;
