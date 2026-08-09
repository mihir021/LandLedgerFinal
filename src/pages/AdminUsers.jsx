/**
 * AdminUsers — user management with KYC verification
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { getUsers } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { MOCK_USERS } from '../data/mock';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, userId: null, action: null, userName: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getUsers({ limit: 100 })
      .then(res => setUsers(res.users || res || MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.fullName || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchF = filter === 'all' || (u.kycStatus || u.status || 'pending') === filter;
    return matchQ && matchF;
  });

  const handleAction = async () => {
    setActionLoading(true);
    try {
      // In a real app: call verifyUser API
      toast.success(`User ${modal.action === 'verify' ? 'verified' : 'rejected'} successfully.`);
      setUsers(prev => prev.map(u =>
        (u._id === modal.userId || u.id === modal.userId)
          ? { ...u, kycStatus: modal.action === 'verify' ? 'verified' : 'rejected', status: modal.action === 'verify' ? 'verified' : 'rejected' }
          : u
      ));
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setModal({ open: false, userId: null, action: null, userName: '' });
    }
  };

  const pendingCount = users.filter(u => (u.kycStatus || u.status) === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 text-sm">{pendingCount} user{pendingCount !== 1 ? 's' : ''} pending KYC verification</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Users className="h-4 w-4 text-amber-700" />
          <span className="font-semibold text-amber-800">{pendingCount} Pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="ll-card p-4 flex flex-wrap gap-3 animate-fade-in-up">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="ll-input pl-9" />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
        <div className="ll-card overflow-hidden animate-fade-in-up delay-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Registered</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u, i) => {
                const kycStatus = u.kycStatus || u.status || 'pending';
                const uId = u._id || u.id;
                const uName = u.fullName || u.name || 'User';
                return (
                  <tr key={uId || i} className="hover:bg-gray-50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {uName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{uName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell capitalize text-gray-600">{u.role}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={kycStatus} /></td>
                    <td className="px-5 py-4">
                      {kycStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => setModal({ open: true, userId: uId, action: 'verify', userName: uName })}
                            className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-3.5 w-3.5" /> Verify
                          </button>
                          <button onClick={() => setModal({ open: true, userId: uId, action: 'reject', userName: uName })}
                            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{kycStatus === 'verified' ? 'Verified ✓' : 'Rejected'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, userId: null, action: null, userName: '' })}
        onConfirm={handleAction}
        loading={actionLoading}
        variant={modal.action === 'verify' ? 'approve' : 'reject'}
        title={modal.action === 'verify' ? 'Approve KYC Verification' : 'Reject KYC Verification'}
        message={modal.action === 'verify'
          ? `You are about to approve KYC for ${modal.userName}. This will allow them to register properties and participate in transactions.`
          : `You are about to reject KYC for ${modal.userName}. They will not be able to participate in property transactions until re-verified.`}
        details={{ 'User': modal.userName, 'Action': modal.action === 'verify' ? 'Grant KYC Approval' : 'Reject KYC' }}
        confirmLabel={modal.action === 'verify' ? 'Approve KYC' : 'Reject KYC'}
      />
    </div>
  );
}
