import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import RecentOrders from '../components/dashboard/RecentOrders';
import { TrendingUp, ShoppingBag, DollarSign, Wallet, PackageOpen } from 'lucide-react';

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // We will connect this to the real FastAPI backend later
    const fetchStats = async () => {
      try {
        // Mock token for development, in a real app this comes from auth context/storage
        const token = localStorage.getItem('token') || 'mock_token';
        
        const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/shop-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        
        // Fallback to mock data if backend is not running or fails (to ensure UI is visible during dev)
        console.log("Falling back to demo data due to connection error.");
        setStats({
          totalSales: { value: '₦258,450', trend: '18.6%', isPositive: true },
          totalOrders: { value: '162', trend: '22.4%', isPositive: true },
          totalEarnings: { value: '₦3,245,800', trend: '28.7%', isPositive: true },
          walletBalance: { value: '₦845,600', trend: 'Available', isPositive: true },
          activeProducts: { value: '248', trend: 'in your shop', isPositive: true },
          salesChart: [
            { name: '1 Jul', sales: 100000 },
            { name: '8 Jul', sales: 150000 },
            { name: '15 Jul', sales: 200000 },
            { name: '22 Jul', sales: 180000 },
            { name: '31 Jul', sales: 258450 },
          ],
          categoryChart: [
            { name: 'Clothing', value: 45 },
            { name: 'Accessories', value: 22 },
            { name: 'Electronics', value: 15 },
            { name: 'Beauty', value: 10 },
            { name: 'Others', value: 8 },
          ],
          recentOrders: [
            { id: '#ORD-785421', customer: 'John Doe', items: 2, status: 'Pending', time: '10 mins ago' },
            { id: '#ORD-785419', customer: 'Maryam S.', items: 1, status: 'Processing', time: '25 mins ago' },
            { id: '#ORD-785416', customer: 'Aliyu M.', items: 3, status: 'Shipped', time: '1 hour ago' },
            { id: '#ORD-785405', customer: "Fatima A.", items: 1, status: 'Delivered', time: '2 hours ago' },
            { id: '#ORD-785398', customer: 'Ibrahim Y.', items: 2, status: 'Delivered', time: '3 hours ago' },
          ]
        });
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading dashboard...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {/* Stat Cards Row */}
      <div className="flex gap-4 overflow-x-auto" style={{ paddingBottom: '8px' }}>
        <StatCard 
          title="Total Sales (Today)" 
          value={stats.totalSales.value} 
          trend={stats.totalSales.trend} 
          isPositive={stats.totalSales.isPositive} 
          icon={<TrendingUp size={20} />} 
          subtitle="vs yesterday"
          color="#7e22ce"
        />
        <StatCard 
          title="Total Orders (Today)" 
          value={stats.totalOrders.value} 
          trend={stats.totalOrders.trend} 
          isPositive={stats.totalOrders.isPositive} 
          icon={<ShoppingBag size={20} />} 
          subtitle="vs yesterday"
          color="#3b82f6"
        />
        <StatCard 
          title="Total Earnings (This Month)" 
          value={stats.totalEarnings.value} 
          trend={stats.totalEarnings.trend} 
          isPositive={stats.totalEarnings.isPositive} 
          icon={<DollarSign size={20} />} 
          subtitle="vs last month"
          color="#10b981"
        />
        <StatCard 
          title="Wallet Balance" 
          value={stats.walletBalance.value} 
          trend={stats.walletBalance.trend} 
          isPositive={stats.walletBalance.isPositive} 
          icon={<Wallet size={20} />} 
          subtitle="Available"
          color="#f59e0b"
        />
        <StatCard 
          title="Active Products" 
          value={stats.activeProducts.value} 
          trend={stats.activeProducts.trend} 
          isPositive={stats.activeProducts.isPositive} 
          icon={<PackageOpen size={20} />} 
          subtitle="in your shop"
          color="#ef4444"
        />
      </div>

      {/* Main Charts Row */}
      <div className="flex gap-6 flex-wrap">
        <SalesChart data={stats.salesChart} />
        <CategoryChart data={stats.categoryChart} />
        <RecentOrders orders={stats.recentOrders} />
      </div>
    </div>
  );
};

export default DashboardOverview;
