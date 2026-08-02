import { useState, useEffect } from 'react';
import axios from 'axios';
import { MoreVertical, Search, Download } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  location: string;
  orders: number;
  total_spent: string;
  profile_pic?: string;
}

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCustomers(response.data.customers);
        setTotalCount(response.data.total_count);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        
        // Fallback for visual testing
        const mockCustomers = [
          { id: "1", name: "Aisha Mohammed", location: "Kano City", orders: 12, total_spent: "₦45,000", profile_pic: "https://i.pravatar.cc/100?img=5" },
          { id: "2", name: "Bello Usman", location: "Kaduna South", orders: 8, total_spent: "₦28,500", profile_pic: "https://i.pravatar.cc/100?img=8" },
          { id: "3", name: "Fatima Y.", location: "Gwarinpa, Abuja", orders: 15, total_spent: "₦110,200", profile_pic: "https://i.pravatar.cc/100?img=9" },
          { id: "4", name: "Daniel Okafor", location: "Lekki, Lagos", orders: 3, total_spent: "₦15,000", profile_pic: "https://i.pravatar.cc/100?img=11" }
        ];
        setCustomers(mockCustomers);
        setTotalCount(1245);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading customers...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      <div className="glass-card flex-col gap-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex-col">
            <h2 className="text-lg font-bold">Customers</h2>
            <div className="text-sm text-muted mt-1">
              Total Customers: <span className="font-bold text-white">{totalCount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="input-field" 
                style={{ paddingLeft: '36px', height: '36px', fontSize: '13px', width: '200px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-outline flex items-center gap-2" style={{ padding: '8px 12px', fontSize: '13px' }}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* List Table */}
        <div className="flex-col mt-2">
          
          <div className="flex items-center text-xs font-bold text-muted uppercase tracking-wider mb-2" style={{ padding: '0 12px' }}>
            <div style={{ flex: 2.5 }}>Customer Details</div>
            <div style={{ flex: 1.5 }}>Location</div>
            <div style={{ flex: 1 }}>Orders</div>
            <div style={{ flex: 1 }}>Total Spent</div>
            <div style={{ width: '32px' }}></div>
          </div>

          <div className="flex-col gap-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center text-muted text-sm py-8">No customers found.</div>
            ) : (
              filteredCustomers.map(customer => (
                <div key={customer.id} className="flex items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div className="flex items-center gap-3" style={{ flex: 2.5 }}>
                    {customer.profile_pic ? (
                      <img src={customer.profile_pic} alt={customer.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                        {customer.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-col">
                      <span className="text-sm font-semibold">{customer.name}</span>
                      <span className="text-xs text-muted">ID: {customer.id.substring(0, 8)}...</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted" style={{ flex: 1.5 }}>
                    {customer.location}
                  </div>

                  <div className="text-sm font-bold" style={{ flex: 1 }}>
                    {customer.orders}
                  </div>

                  <div className="text-sm font-bold text-primary" style={{ flex: 1 }}>
                    {customer.total_spent}
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

export default Customers;
