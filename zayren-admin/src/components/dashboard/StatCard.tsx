import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: ReactNode;
  subtitle?: string;
  color: string;
}

const StatCard = ({ title, value, trend, isPositive, icon, subtitle, color }: StatCardProps) => {
  return (
    <div className="glass-card flex-col gap-3" style={{ flex: 1, minWidth: '200px' }}>
      <div className="flex items-center gap-3">
        <div style={{ 
          width: '40px', height: '40px', 
          borderRadius: '10px', 
          background: color, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          {icon}
        </div>
        <div className="flex-col">
          <span className="text-sm font-semibold">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{value}</span>
            <span className={`text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{trend}
            </span>
          </div>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
