import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Download, RefreshCcw } from 'lucide-react';

interface WalletData {
  balance: {
    available: string;
    total_earned: string;
    pending: string;
  };
  transactions: Array<{
    id: string;
    date: string;
    type: 'Credit' | 'Debit';
    amount: string;
    description: string;
    status: string;
  }>;
}

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WalletData | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/wallet', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        
        // Fallback for visual testing
        setData({
          balance: {
            available: "₦950,000",
            total_earned: "₦1,500,000",
            pending: "₦150,000"
          },
          transactions: [
            { id: "TXN-8472", date: "2023-10-25 14:30", type: "Credit", amount: "+ ₦45,000", description: "Order Payment", status: "Completed" },
            { id: "TXN-9921", date: "2023-10-24 09:15", type: "Debit", amount: "- ₦500,000", description: "Bank Withdrawal", status: "Completed" },
            { id: "TXN-1104", date: "2023-10-23 16:45", type: "Credit", amount: "+ ₦12,500", description: "Order Payment", status: "Completed" },
            { id: "TXN-3392", date: "2023-10-22 11:20", type: "Credit", amount: "+ ₦89,000", description: "Order Payment", status: "Completed" }
          ]
        });
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (loading || !data) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading wallet...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Wallet & Earnings</h2>
        <button className="btn btn-outline flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <Download size={16} /> Download Statement
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
        
        {/* Balance Card Container */}
        <div className="flex-col gap-4">
          
          <div className="glass-card flex-col gap-6" style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted">
                <WalletIcon size={18} className="text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider">Available Balance</span>
              </div>
              <button className="text-muted hover:text-white transition-colors">
                <RefreshCcw size={16} />
              </button>
            </div>

            <div>
              <h1 className="text-4xl font-bold">{data.balance.available}</h1>
            </div>

            <button className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '15px' }}>
              Withdraw Funds
            </button>
          </div>

          <div className="glass-card flex-col gap-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Financial Summary</h3>
            
            <div className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="text-sm text-muted">Total Earned</span>
              <span className="text-sm font-bold">{data.balance.total_earned}</span>
            </div>

            <div className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="text-sm text-muted">Pending Clearance</span>
              <span className="text-sm font-bold text-warning">{data.balance.pending}</span>
            </div>
          </div>

        </div>

        {/* Transactions List */}
        <div className="glass-card flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Recent Transactions</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>

          <div className="flex-col gap-3">
            {data.transactions.length === 0 ? (
              <div className="text-center text-muted text-sm py-8">No recent transactions.</div>
            ) : (
              data.transactions.map((txn, idx) => (
                <div key={idx} className="flex justify-between items-center" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-full" style={{ width: '40px', height: '40px', background: txn.type === 'Credit' ? 'rgba(var(--success-rgb), 0.15)' : 'rgba(var(--danger-rgb), 0.15)', color: txn.type === 'Credit' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {txn.type === 'Credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    
                    <div className="flex-col">
                      <span className="text-sm font-semibold">{txn.description}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">{txn.date}</span>
                        <span className="text-xs text-muted">•</span>
                        <span className="text-xs text-muted">ID: {txn.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-col items-end">
                    <span className={`text-sm font-bold ${txn.type === 'Credit' ? 'text-success' : ''}`}>
                      {txn.amount}
                    </span>
                    <span className="text-xs text-muted mt-1">{txn.status}</span>
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

export default Wallet;
