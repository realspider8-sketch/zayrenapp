import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: any[];
}

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <div className="glass-card flex-col gap-4" style={{ flex: 2, minWidth: '400px' }}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-muted">Sales Overview <span style={{ fontSize: '0.75rem' }}>(This Month)</span></h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">₦3,245,800</span>
            <span className="text-sm font-bold text-success">+ 18.6%</span>
          </div>
          <span className="text-xs text-muted">vs last month</span>
        </div>
        <select style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div style={{ height: '240px', width: '100%', marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val/1000}k`} />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              itemStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
