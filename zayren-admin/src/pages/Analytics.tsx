import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsData {
  kpis: {
    total_revenue: string;
    total_orders: number;
    average_order_value: string;
    active_customers: number;
  };
  chart_data: Array<{
    day: string;
    revenue: number;
  }>;
  top_products: Array<{
    name: string;
    sales: number;
    revenue: string;
  }>;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        
        // Fallback for visual testing
        setData({
          kpis: {
            total_revenue: "₦1,500,000",
            total_orders: 1250,
            average_order_value: "₦1,200",
            active_customers: 840
          },
          chart_data: [
            { day: "Mon", revenue: 45000 },
            { day: "Tue", revenue: 62000 },
            { day: "Wed", revenue: 38000 },
            { day: "Thu", revenue: 85000 },
            { day: "Fri", revenue: 110000 },
            { day: "Sat", revenue: 135000 },
            { day: "Sun", revenue: 95000 }
          ],
          top_products: [
            { name: "Classic White T-Shirt", sales: 120, revenue: "₦600,000" },
            { name: "Wireless Earbuds", sales: 85, revenue: "₦2,125,000" },
            { name: "Leather Crossbody Bag", sales: 40, revenue: "₦600,000" }
          ]
        });
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading analytics...</div></div>;
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...data.chart_data.map(d => d.revenue), 1);

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '1000px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Analytics & Performance</h2>
        <button className="btn btn-outline flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <Calendar size={16} /> Last 7 Days
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        
        <div className="glass-card flex-col gap-3" style={{ padding: '20px' }}>
          <div className="flex items-center gap-3 text-muted">
            <div className="flex items-center justify-center rounded-full" style={{ width: '40px', height: '40px', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary-color)' }}>
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">{data.kpis.total_revenue}</div>
          <div className="text-xs text-success flex items-center gap-1"><TrendingUp size={12} /> +12.5% vs last week</div>
        </div>

        <div className="glass-card flex-col gap-3" style={{ padding: '20px' }}>
          <div className="flex items-center gap-3 text-muted">
            <div className="flex items-center justify-center rounded-full" style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', color: '#a0a0b0' }}>
              <ShoppingCart size={20} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">Total Orders</span>
          </div>
          <div className="text-2xl font-bold">{data.kpis.total_orders.toLocaleString()}</div>
          <div className="text-xs text-success flex items-center gap-1"><TrendingUp size={12} /> +5.2% vs last week</div>
        </div>

        <div className="glass-card flex-col gap-3" style={{ padding: '20px' }}>
          <div className="flex items-center gap-3 text-muted">
            <div className="flex items-center justify-center rounded-full" style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', color: '#a0a0b0' }}>
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">Avg Order Value</span>
          </div>
          <div className="text-2xl font-bold">{data.kpis.average_order_value}</div>
          <div className="text-xs text-muted">Stable</div>
        </div>

        <div className="glass-card flex-col gap-3" style={{ padding: '20px' }}>
          <div className="flex items-center gap-3 text-muted">
            <div className="flex items-center justify-center rounded-full" style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', color: '#a0a0b0' }}>
              <Users size={20} />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider">Active Customers</span>
          </div>
          <div className="text-2xl font-bold">{data.kpis.active_customers.toLocaleString()}</div>
          <div className="text-xs text-success flex items-center gap-1"><TrendingUp size={12} /> +2.1% vs last week</div>
        </div>

      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* CSS Chart */}
        <div className="glass-card flex-col gap-6">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Revenue Over Time</h3>
          
          <div className="flex items-end justify-between gap-2" style={{ height: '200px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {data.chart_data.map((point, index) => {
              const heightPercent = Math.max((point.revenue / maxRevenue) * 100, 5); // min 5% height
              return (
                <div key={index} className="flex-col items-center gap-2" style={{ flex: 1 }}>
                  {/* Tooltip visible on hover would go here, currently just static label */}
                  <div className="text-xs text-muted opacity-0 hover:opacity-100 transition-opacity" style={{ position: 'absolute', transform: 'translateY(-20px)' }}>
                    ₦{(point.revenue / 1000).toFixed(0)}k
                  </div>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '40px', 
                      height: `${heightPercent}%`, 
                      background: 'var(--primary-color)',
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.8,
                      transition: 'height 1s ease-out'
                    }} 
                    className="hover:opacity-100 cursor-pointer"
                  ></div>
                  <span className="text-xs text-muted mt-2">{point.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card flex-col gap-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Top Products</h3>
          
          <div className="flex-col gap-3 mt-2">
            {data.top_products.length === 0 ? (
              <div className="text-center text-sm text-muted py-4">No product data available.</div>
            ) : (
              data.top_products.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="flex-col">
                    <span className="text-sm font-semibold">{product.name}</span>
                    <span className="text-xs text-muted">{product.sales} sales</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{product.revenue}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
