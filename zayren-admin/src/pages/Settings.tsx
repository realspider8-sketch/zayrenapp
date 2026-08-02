import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, User as UserIcon, Building2, Bell, Shield } from 'lucide-react';

interface SettingsData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shop: {
    name: string;
    category: string;
    address: string;
  };
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'business' | 'notifications' | 'security'>('account');

  // Form State
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    shopName: '',
    shopCategory: '',
    shopAddress: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/settings/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setFormData({
          userName: response.data.user.name,
          userEmail: response.data.user.email,
          userPhone: response.data.user.phone,
          shopName: response.data.shop.name,
          shopCategory: response.data.shop.category,
          shopAddress: response.data.shop.address
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        
        // Fallback for visual testing
        const mockData = {
          user: { id: "1", name: "Zayren Admin", email: "admin@zayren.com", phone: "+234 800 111 2222" },
          shop: { name: "Zayren Premium Store", category: "Retail", address: "Victoria Island, Lagos" }
        };
        setData(mockData);
        setFormData({
          userName: mockData.user.name,
          userEmail: mockData.user.email,
          userPhone: mockData.user.phone,
          shopName: mockData.shop.name,
          shopCategory: mockData.shop.category,
          shopAddress: mockData.shop.address
        });
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading || !data) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading settings...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Settings</h2>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '10px 20px', fontSize: '14px' }}>
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '250px 1fr' }}>
        
        {/* Settings Navigation Tabs */}
        <div className="glass-card flex-col gap-2" style={{ padding: '16px' }}>
          
          <button 
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'account' ? 'bg-[rgba(var(--primary-rgb),0.15)] text-primary' : 'hover:bg-[rgba(255,255,255,0.05)] text-muted'}`}
            onClick={() => setActiveTab('account')}
          >
            <UserIcon size={18} />
            <span className="font-semibold text-sm">Account Profile</span>
          </button>

          <button 
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'business' ? 'bg-[rgba(var(--primary-rgb),0.15)] text-primary' : 'hover:bg-[rgba(255,255,255,0.05)] text-muted'}`}
            onClick={() => setActiveTab('business')}
          >
            <Building2 size={18} />
            <span className="font-semibold text-sm">Business Details</span>
          </button>

          <button 
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-[rgba(var(--primary-rgb),0.15)] text-primary' : 'hover:bg-[rgba(255,255,255,0.05)] text-muted'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            <span className="font-semibold text-sm">Notifications</span>
          </button>

          <button 
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-[rgba(var(--primary-rgb),0.15)] text-primary' : 'hover:bg-[rgba(255,255,255,0.05)] text-muted'}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} />
            <span className="font-semibold text-sm">Security</span>
          </button>

        </div>

        {/* Settings Form Area */}
        <div className="glass-card flex-col gap-6" style={{ padding: '32px' }}>
          
          {activeTab === 'account' && (
            <div className="flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1">Account Profile</h3>
                <p className="text-sm text-muted">Manage your personal administrator details.</p>
              </div>

              <div className="flex-col gap-4 max-w-md">
                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Full Name</label>
                  <input type="text" name="userName" value={formData.userName} onChange={handleChange} className="input-field" />
                </div>
                
                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Email Address</label>
                  <input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} className="input-field" />
                </div>

                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Phone Number</label>
                  <input type="text" name="userPhone" value={formData.userPhone} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1">Business Details</h3>
                <p className="text-sm text-muted">Update your shop's public information.</p>
              </div>

              <div className="flex-col gap-4 max-w-md">
                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Shop Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="input-field" />
                </div>
                
                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Business Category</label>
                  <input type="text" name="shopCategory" value={formData.shopCategory} onChange={handleChange} className="input-field" />
                </div>

                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Shop Address</label>
                  <input type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1">Notifications</h3>
                <p className="text-sm text-muted">Choose how you receive alerts.</p>
              </div>
              <div className="text-sm text-muted">Notification preferences coming soon.</div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1">Security</h3>
                <p className="text-sm text-muted">Manage your password and security settings.</p>
              </div>
              <div className="text-sm text-muted">Password reset features coming soon.</div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
