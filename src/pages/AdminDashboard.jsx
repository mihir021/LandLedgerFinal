/**
 * AdminDashboard — system-wide stats + activity feed + quick access panels
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowLeftRight, Home, ArrowRight, Activity, Loader2, CheckCircle2, FileClock, UserPlus, X } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { getUsers, registerOfficer } from '../services/userService';
import { getAuditLogs } from '../services/auditService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pendingKyc: 0,
    pendingProperties: 0,
    activeTransfers: 0,
    completedTransfers: 0,
    totalProperties: 0,
    totalUsers: 0,
  });
  const [pendingProperties, setPendingProperties] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [officerForm, setOfficerForm] = useState({ fullName: '', email: '', password: '', phone: '', jurisdiction: '' });
  const [submittingOfficer, setSubmittingOfficer] = useState(false);

  const displayName = user?.fullName || user?.name || 'Admin';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [propPendingRes, propTotalRes, transfers, userPendingRes, userTotalRes, logs] = await Promise.all([
          getProperties({ verificationStatus: 'pending', limit: 5 }).catch(() => getProperties({ status: 'Pending', limit: 5 }).catch(() => ({ properties: [], pagination: { total: 0 } }))),
          getProperties({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          getTransfers().catch(() => []),
          getUsers({ status: 'pending', limit: 1 }).catch(() => getUsers({ kycStatus: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } }))),
          getUsers({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          getAuditLogs({ limit: 6 }).catch(() => ({ logs: [] })),
        ]);
        
        setPendingProperties(propPendingRes.properties || []);
        setRecentTransfers(Array.isArray(transfers) ? transfers.slice(0, 5) : []);
        setAuditLogs(logs.logs || []);
        setStats({
          pendingKyc: userPendingRes.pagination?.total || 0,
          pendingProperties: propPendingRes.pagination?.total || propPendingRes.properties?.length || 0,
          activeTransfers: Array.isArray(transfers) ? transfers.filter(t => t.status !== 'completed' && t.status !== 'Completed' && t.status !== 'rejected').length : 0,
          completedTransfers: Array.isArray(transfers) ? transfers.filter(t => t.status === 'completed' || t.status === 'Completed').length : 0,
          totalProperties: propTotalRes.pagination?.total || 0,
          totalUsers: userTotalRes.pagination?.total || 0,
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRegisterOfficer = async (e) => {
    e.preventDefault();
    if (!officerForm.fullName.trim() || !officerForm.email.trim() || !officerForm.password.trim()) {
      toast.error('Full name, email and password are required');
      return;
    }
    setSubmittingOfficer(true);
    try {
      await registerOfficer(officerForm);
      toast.success('Government officer registered successfully');
      setShowOfficerModal(false);
      setOfficerForm({ fullName: '', email: '', password: '', phone: '', jurisdiction: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to register officer');
    } finally {
      setSubmittingOfficer(false);
    }
  };

  const ACTION_LABELS = {
    'user.verify': 'User Verified',
    'user.suspend': 'User Suspended',
    'user.reinstate': 'User Reinstate',
    'officer.create': 'Officer Created',
    'property.verify': 'Property Verified',
    'property.list': 'Property Listed',
    'property.unlist': 'Property Unlisted',
    'transfer.request': 'Transfer Requested',
    'transfer.seller_approve': 'Seller Approved',
    'transfer.buyer_approve': 'Buyer Signed',
    'transfer.officer_approve': 'Officer Approved',
    'transfer.complete': 'Transfer Completed',
    'dispute.create': 'Dispute Filed',
    'dispute.update': 'Dispute Updated',
    'dispute.delete': 'Dispute Deleted',
    'settings.update': 'Settings Updated',
  };

  const cards = [
    { icon: Users,          label: 'Pending KYC',          value: stats.pendingKyc,            color: 'amber',  link: '/admin/users' },
    { icon: ShieldCheck,    label: 'Pending Verification', value: stats.pendingProperties,     color: 'navy',   link: '/admin/properties' },
    { icon: ArrowLeftRight, label: 'Active Transfers',     value: stats.activeTransfers,       color: 'purple', link: '/admin/transfers' },
    { icon: CheckCircle2,   label: 'Completed Transfers',  value: stats.completedTransfers,    color: 'green',  link: '/admin/transfers' },
    { icon: Home,           label: 'Total Properties',     value: stats.totalProperties,       color: 'navy',   link: '/admin/properties' },
    { icon: Users,          label: 'Total Users',          value: stats.totalUsers,            color: 'emerald',link: '/admin/users' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {firstName} — system-wide overview.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Link key={c.label} to={c.link} className="block hover:no-underline">
            <DashboardCard {...c} delay={i * 60} />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Properties */}
        <div className="ll-card overflow-hidden animate-fade-in-up delay-400">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-800" />
              <h2 className="font-serif text-base font-semibold text-gray-900">Pending Property Verification</h2>
            </div>
            <Link to="/admin/properties" className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-blue-800 animate-spin" /></div>
          ) : pendingProperties.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No pending properties. ✓</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingProperties.map(p => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {p.documents?.[0]?.url ? <img src={p.documents[0].url.startsWith('http') ? p.documents[0].url : `/${p.documents[0].url.replace(/\\/g, '/')}`} alt="" className="h-full w-full object-cover" /> : '🏠'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.location?.district || p.location?.surveyNumber}, {p.location?.city}</p>
                    <p className="text-xs text-gray-400">{p.ownerId?.name || p.ownerId?.fullName || 'Unknown owner'} · {p.landDetails?.landType || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status="pending" />
                    <Link to="/admin/properties" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        <div className="ll-card overflow-hidden animate-fade-in-up delay-500">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <h2 className="font-serif text-base font-semibold text-gray-900">Recent Transfers</h2>
            </div>
            <Link to="/admin/transfers" className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-blue-800 animate-spin" /></div>
          ) : recentTransfers.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No transfers yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTransfers.map(t => (
                <div key={t._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-base shrink-0">🔄</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {t.property?.propertyId || t.property?.address || 'Property'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {t.buyer?.fullName || 'Buyer'} ← {t.seller?.fullName || 'Seller'}
                    </p>
                  </div>
                  <StatusBadge status={t.status || 'pending'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick management links */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-600">
        {[
          { to: '/admin/users',      icon: Users,          color: 'text-amber-700 bg-amber-50 border-amber-200',  label: 'Manage Users',    desc: 'KYC verification, role management' },
          { to: '/admin/properties', icon: ShieldCheck,    color: 'text-blue-800 bg-blue-50 border-blue-200',     label: 'Properties',      desc: 'Verify property submissions' },
          { to: '/admin/transfers',  icon: ArrowLeftRight, color: 'text-purple-700 bg-purple-50 border-purple-200',label: 'Transfers',       desc: 'Officer compliance review' },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className={`ll-card border-2 ${a.color} p-4 hover:shadow-md transition-all group`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-5 w-5" />
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audit Logs */}
        <div className="ll-card overflow-hidden animate-fade-in-up delay-700">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileClock className="h-4 w-4 text-emerald-700" />
              <h2 className="font-serif text-base font-semibold text-gray-900">Recent Audit Activity</h2>
            </div>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No audit logs recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {auditLogs.map(log => (
                <div key={log._id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                    <FileClock className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {log.userEmail || 'System'} · {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Register Government Officer */}
        <div className="ll-card overflow-hidden animate-fade-in-up delay-800">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-800" />
              <h2 className="font-serif text-base font-semibold text-gray-900">Government Officers</h2>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-500 leading-relaxed">
              Register a new government officer account to handle property verification, KYC approval and transfer compliance in a designated jurisdiction.
            </p>
            <button
              onClick={() => setShowOfficerModal(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 btn-primary py-3 text-sm"
            >
              <UserPlus className="h-4 w-4" /> Register New Officer
            </button>
          </div>
        </div>
      </div>

      {/* Register Officer Modal */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-900" />
                <h3 className="text-lg font-bold font-serif text-gray-900">Register Government Officer</h3>
              </div>
              <button
                onClick={() => setShowOfficerModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterOfficer} className="space-y-4">
              <div>
                <label className="ll-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={officerForm.fullName}
                  onChange={e => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                  className="ll-input"
                  placeholder="e.g. District Registrar"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="ll-label">Email *</label>
                  <input
                    type="email"
                    required
                    value={officerForm.email}
                    onChange={e => setOfficerForm({ ...officerForm, email: e.target.value })}
                    className="ll-input"
                    placeholder="officer@example.com"
                  />
                </div>
                <div>
                  <label className="ll-label">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={officerForm.password}
                    onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })}
                    className="ll-input"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="ll-label">Phone</label>
                  <input
                    type="tel"
                    value={officerForm.phone}
                    onChange={e => setOfficerForm({ ...officerForm, phone: e.target.value })}
                    className="ll-input"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="ll-label">Jurisdiction</label>
                  <input
                    type="text"
                    value={officerForm.jurisdiction}
                    onChange={e => setOfficerForm({ ...officerForm, jurisdiction: e.target.value })}
                    className="ll-input"
                    placeholder="e.g. Bengaluru Urban"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowOfficerModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submittingOfficer} className="btn-primary text-xs">
                  {submittingOfficer ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {submittingOfficer ? 'Registering...' : 'Register Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
