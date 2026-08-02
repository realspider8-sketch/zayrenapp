import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API login delay
    setTimeout(() => {
      // Mocking a successful login by storing a token
      localStorage.setItem('token', 'mock_zayren_admin_token_123');
      setLoading(false);
      navigate('/dashboard'); // Redirect to dashboard
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-[#0a0a0f]">
      
      {/* Decorative background blurs matching the dashboard */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '30%',
        width: '400px', height: '400px',
        background: 'var(--primary-color)',
        filter: 'blur(150px)', opacity: 0.15,
        borderRadius: '50%', zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%', right: '30%',
        width: '300px', height: '300px',
        background: 'var(--secondary-color)',
        filter: 'blur(120px)', opacity: 0.1,
        borderRadius: '50%', zIndex: 0
      }} />

      {/* Login Card */}
      <div className="glass-card flex-col gap-6 animate-fade-in z-10" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        
        <div className="flex-col items-center gap-2 text-center mb-4">
          <div className="flex items-center justify-center bg-primary text-white font-bold rounded-xl" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
            Z
          </div>
          <h1 className="text-2xl font-bold mt-2">ZAYREN Admin</h1>
          <p className="text-sm text-muted">Enter your credentials to access the shop dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="flex-col gap-5">
          <div className="flex-col gap-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@zayren.com"
                className="input-field w-full pl-10" 
              />
            </div>
          </div>

          <div className="flex-col gap-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field w-full pl-10" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 mt-2"
            style={{ padding: '12px' }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

      </div>

    </div>
  );
};

export default Login;
