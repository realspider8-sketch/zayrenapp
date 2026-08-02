interface Order {
  id: string;
  customer: string;
  items: number;
  status: string;
  time: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="glass-card flex-col gap-4" style={{ flex: 1, minWidth: '300px' }}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted">Recent Orders</h3>
        <button className="text-xs text-primary font-medium">View All →</button>
      </div>

      <div className="flex-col gap-3 mt-2">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: '#333', overflow: 'hidden' }}>
                <img src={`https://i.pravatar.cc/100?u=${order.id}`} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="flex-col">
                <span className="text-xs font-bold">{order.id}</span>
                <span className="text-xs text-muted">{order.customer}</span>
              </div>
            </div>
            
            <div className="text-xs text-muted">{order.items} items</div>
            
            <div className="flex-col items-end gap-1">
              <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
              <span className="text-xs text-muted" style={{ fontSize: '10px' }}>{order.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
