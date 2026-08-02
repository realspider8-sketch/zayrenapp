import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryChartProps {
  data: any[];
}

const COLORS = ['#7e22ce', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CategoryChart = ({ data }: CategoryChartProps) => {
  return (
    <div className="glass-card flex-col gap-4" style={{ flex: 1, minWidth: '250px' }}>
      <h3 className="text-sm font-semibold text-muted">Sales by Category</h3>
      
      <div style={{ height: '200px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              itemStyle={{ color: 'white' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <span className="text-xl font-bold">248</span>
          <br/>
          <span className="text-xs text-muted">Total Items</span>
        </div>
      </div>

      <div className="flex-col gap-2 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: COLORS[index % COLORS.length] }}></div>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
