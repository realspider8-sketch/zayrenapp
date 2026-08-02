import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, MoreVertical, Mail, Shield } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_active: string;
}

const Staff = () => {
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/staff', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStaffList(response.data.staff);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
        
        // Fallback for visual testing
        setStaffList([
          { id: "1", name: "Zayren Admin", email: "admin@zayren.com", role: "Owner / Super Admin", status: "Active", last_active: "Just now" },
          { id: "STF-002", name: "Adekunle Ibrahim", email: "ade@shop.com", role: "Store Manager", status: "Active", last_active: "2 hours ago" }
        ]);
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading staff...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '1000px' }}>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="text-primary" size={24} /> 
          Staff & Team Management
        </h2>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <UserPlus size={18} /> Add New Staff
        </button>
      </div>

      <div className="glass-card flex-col mt-4">
        
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold">Team Members ({staffList.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="text-muted text-sm border-b border-white/5">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Last Active</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Mail size={14} /> {member.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield size={14} className={member.role.includes('Admin') ? 'text-primary' : 'text-muted'} />
                      {member.role}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      member.status === 'Active' 
                        ? 'bg-[rgba(var(--success-rgb),0.1)] text-success border-success/20' 
                        : 'bg-[rgba(var(--danger-rgb),0.1)] text-danger border-danger/20'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted">{member.last_active}</td>
                  <td className="p-4 text-right">
                    <button className="text-muted hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">No staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Staff;
