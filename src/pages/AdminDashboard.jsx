/**
 * AdminDashboard — system-wide stats + activity feed + quick access panels
 * Redesigned fully in a tactile LEGO Toy Brick aesthetic with Slate Gray borders.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowLeftRight, Home, ArrowRight, Activity, Loader2, CheckCircle2, FileClock, UserPlus, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { getUsers, registerOfficer } from '../services/userService';
import { getAuditLogs } from '../services/auditService';
import { getImgUrl } from '../utils/helpers';

/** LEGO Brick Pill Status Badge Component */
function LegoStatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase();
  let bg = 'bg-[#FFF8E1] text-[#856404]';
  let studBg = '#F5B800';
  let label = status;

  if (s === 'completed' || s === 'verified' || s === 'approved') {
    bg = 'bg-[#E8F5E9] text-[#1B5E20]';
    studBg = '#2E7D32';
    label = s === 'completed' ? 'Completed' : 'Verified';
  } else if (s === 'pending' || s === 'kyc_pending') {
    bg = 'bg-[#FFEBEE] text-[#C41E3A]';
    studBg = '#C41E3A';
    label = 'Pending';
  } else if (s.includes('transfer') || s === 'initiated' || s === 'requested') {
    bg = 'bg-[#E3F2FD] text-[#0D47A1]';
    studBg = '#1565C0';
    label = 'Requested';
  } else if (s === 'rejected' || s === 'failed') {
    bg = 'bg-[#FFEBEE] text-[#C62828]';
    studBg = '#C41E3A';
    label = 'Rejected';
  }

  return (
    <span className={`lego-pill ${bg}`}>
      <span className="lego-pill-stud" style={{ backgroundColor: studBg }} />
      <span>{label}</span>
    </span>
  );
}

/** LEGO KPI Stat Plate Component */
function LegoKpiCard({ label, value, icon: Icon, color, link, delay }) {
  const colorMap = {
    amber: { iconBg: 'bg-[#FFF8E1] text-[#B78103]' },
    red: { iconBg: 'bg-[#FFEBEE] text-[#C41E3A]' },
    navy: { iconBg: 'bg-[#E8EFF8] text-[#475569]' },
    blue: { iconBg: 'bg-[#E3F2FD] text-[#1565C0]' },
    green: { iconBg: 'bg-[#E8F5E9] text-[#2E7D32]' },
  };

  const config = colorMap[color] || colorMap.navy;

  return (
    <Link
      to={link}
      className="lego-card lego-card-press lego-focus block p-4 hover:no-underline animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2 mt-1">
        <span className="text-[11px] font-bold tracking-wider text-gray-600 uppercase font-sans">
          {label}
        </span>
        <div className={`h-8 w-8 rounded border-2 border-[#475569] flex items-center justify-center shadow-[2px_2px_0px_#475569] shrink-0 ${config.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 font-pixel text-3xl font-bold text-[#1E293B]">
        {value}
      </div>
    </Link>
  );
}

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
          getProperties({ verificationStatus: 'pending', limit: 100 }).catch(() => ({ properties: [], pagination: { total: 0 } })),
          getProperties({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          getTransfers().catch(() => []),
          getUsers({ status: 'pending', limit: 1 }).catch(() => getUsers({ kycStatus: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } }))),
          getUsers({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
          getAuditLogs({ limit: 6 }).catch(() => ({ logs: [] })),
        ]);
        
        const fetchedPendingProps = (propPendingRes.properties || []).filter(
          p => (p.verification?.status || p.verificationStatus || 'Pending').toLowerCase() === 'pending'
        );

        setPendingProperties(fetchedPendingProps.slice(0, 5));
        setRecentTransfers(Array.isArray(transfers) ? transfers.slice(0, 5) : []);
        setAuditLogs(logs.logs || []);
        setStats({
          pendingKyc: userPendingRes.pagination?.total || 0,
          pendingProperties: fetchedPendingProps.length,
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
    { icon: Users,          label: 'Pending KYC',          value: stats.pendingKyc,            color: 'amber', link: '/admin/users' },
    { icon: ShieldCheck,    label: 'Pending Verification', value: stats.pendingProperties,     color: 'red',   link: '/admin/properties' },
    { icon: ArrowLeftRight, label: 'Active Transfers',     value: stats.activeTransfers,       color: 'blue',  link: '/admin/transfers' },
    { icon: CheckCircle2,   label: 'Completed Transfers',  value: stats.completedTransfers,    color: 'green', link: '/admin/transfers' },
    { icon: Home,           label: 'Total Properties',     value: stats.totalProperties,       color: 'navy',  link: '/admin/properties' },
    { icon: Users,          label: 'Total Users',          value: stats.totalUsers,            color: 'navy',  link: '/admin/users' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Left-aligned Page Header with 2x2 LEGO Stud Badge */}
      <div className="animate-fade-in flex items-start gap-3.5">
        <div className="inline-grid grid-cols-2 gap-1 rounded bg-[#F5B800] border-2 border-[#475569] p-2 shadow-[3px_3px_0px_#475569] shrink-0 mt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
        </div>
        <div>
          <h1 className="font-pixel text-3xl font-bold text-[#1E293B] tracking-wide">Admin Dashboard</h1>
          <p className="font-sans text-sm text-gray-600 mt-0.5">
            Welcome back, {firstName} — system-wide registry overview.
          </p>
        </div>
      </div>

      {error && (
        <div className="lego-card p-4 bg-[#FFEBEE] border-[#C41E3A] text-sm text-[#C41E3A] font-bold">
          {error}
        </div>
      )}

      {/* 2. KPI Stat Row (Staggered Load) */}
      <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-3">
        {cards.map((c, i) => (
          <LegoKpiCard key={c.label} {...c} delay={i * 70} />
        ))}
      </div>

      {/* 3. Pending Property Verification & Recent Transfers Side-by-Side Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Properties Panel */}
        <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '420ms' }}>
          {/* Header Accent Strip */}
          <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C41E3A]" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#C41E3A]" />
                <h2 className="font-pixel text-lg font-bold text-[#1E293B]">Pending Property Verification</h2>
              </div>
              <Link to="/admin/properties" className="lego-focus text-xs text-[#1565C0] font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#475569] animate-spin" /></div>
          ) : pendingProperties.length === 0 ? (
            <p className="text-center text-sm font-sans text-gray-500 py-10">No pending properties. ✓</p>
          ) : (
            <div className="divide-y-2 divide-[#475569]/10">
              {pendingProperties.map(p => (
                <div key={p._id} className="lego-notch-item flex items-center gap-3 px-5 py-3.5 hover:bg-[#475569]/5 transition-colors">
                  <div className="h-10 w-10 rounded border-2 border-[#475569] bg-[#E8EFF8] flex items-center justify-center text-base shrink-0 overflow-hidden shadow-[2px_2px_0px_#475569]">
                    {getImgUrl(p.images?.[0] || p.documents?.[0]) ? (
                      <img src={getImgUrl(p.images?.[0] || p.documents?.[0])} alt="" className="h-full w-full object-cover" />
                    ) : (
                      '🏠'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1E293B] truncate font-sans">
                      {p.location?.district || p.location?.surveyNumber}, {p.location?.city}
                    </p>
                    <p className="text-xs text-gray-600 truncate font-sans">
                      {p.ownerId?.name || p.ownerId?.fullName || 'Unknown owner'} · {p.landDetails?.landType || 'Property'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <LegoStatusBadge status="pending" />
                    <Link 
                      to={`/property/${p._id}`} 
                      className="lego-focus inline-flex items-center gap-1 text-xs font-bold text-[#1E293B] bg-[#F5B800] border-2 border-[#475569] rounded px-2.5 py-1 shadow-[2px_2px_0px_#475569] hover:translate-y-0.5 transition-transform" 
                      title="View Property"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transfers Panel */}
        <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '490ms' }}>
          {/* Header Accent Strip */}
          <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1565C0]" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-[#1565C0]" />
                <h2 className="font-pixel text-lg font-bold text-[#1E293B]">Recent Transfers</h2>
              </div>
              <Link to="/admin/transfers" className="lego-focus text-xs text-[#1565C0] font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#475569] animate-spin" /></div>
          ) : recentTransfers.length === 0 ? (
            <p className="text-center text-sm font-sans text-gray-500 py-10">No transfers recorded yet.</p>
          ) : (
            <div className="divide-y-2 divide-[#475569]/10">
              {recentTransfers.map(t => (
                <div key={t._id} className="lego-notch-item flex items-center gap-3 px-5 py-3.5 hover:bg-[#475569]/5 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded border-2 border-[#475569] bg-[#E3F2FD] text-base shrink-0 shadow-[2px_2px_0px_#475569]">
                    🔄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1E293B] truncate font-sans">
                      {t.property?.propertyId || t.property?.address || 'Property Record'}
                    </p>
                    <p className="text-xs text-gray-600 truncate font-sans">
                      {t.buyer?.fullName || 'Buyer'} ← {t.seller?.fullName || 'Seller'}
                    </p>
                  </div>
                  <LegoStatusBadge status={t.status || 'pending'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Quick Action Tiles (Large Brick Cards with Press-down physics) */}
      <div className="grid gap-4.5 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
        {[
          { 
            to: '/admin/users',      
            icon: Users,          
            iconBg: 'bg-[#FFF8E1] text-[#B78103]', 
            label: 'Manage Users',    
            desc: 'KYC verification, roles & user registry' 
          },
          { 
            to: '/admin/properties', 
            icon: ShieldCheck,    
            iconBg: 'bg-[#FFEBEE] text-[#C41E3A]', 
            label: 'Properties',      
            desc: 'Review property deeds and approvals' 
          },
          { 
            to: '/admin/transfers',  
            icon: ArrowLeftRight, 
            iconBg: 'bg-[#E3F2FD] text-[#1565C0]', 
            label: 'Transfers',       
            desc: 'Officer compliance & escrow oversight' 
          },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link 
              key={a.to} 
              to={a.to} 
              className="lego-card lego-card-press lego-focus p-5 block group hover:no-underline"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className={`h-11 w-11 rounded border-2 border-[#475569] flex items-center justify-center shadow-[2.5px_2.5px_0px_#475569] ${a.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="h-7 w-7 rounded-full bg-[#475569] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <p className="font-pixel text-xl font-bold text-[#1E293B]">{a.label}</p>
              <p className="font-sans text-xs text-gray-600 mt-1">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* 5. Audit Activity & Officer Management Bottom Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Audit Activity Panel */}
        <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '630ms' }}>
          {/* Header Accent Strip */}
          <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2E7D32]" />
            <div className="flex items-center gap-2.5 pt-1">
              <FileClock className="h-5 w-5 text-[#2E7D32]" />
              <h2 className="font-pixel text-lg font-bold text-[#1E293B]">Recent Audit Activity</h2>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-center text-sm font-sans text-gray-500 py-10">No audit logs recorded yet.</p>
          ) : (
            <div className="divide-y-2 divide-[#475569]/10">
              {auditLogs.map(log => (
                <div key={log._id} className="lego-notch-item flex items-start gap-3 px-5 py-3.5 hover:bg-[#475569]/5 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded border-2 border-[#475569] bg-[#E8F5E9] text-[#2E7D32] shrink-0 shadow-[2px_2px_0px_#475569]">
                    <FileClock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 font-sans">
                    <p className="text-sm font-bold text-[#1E293B]">
                      {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {log.userEmail || 'System'} · {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Register Government Officer Panel */}
        <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          {/* Header Accent Strip */}
          <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F5B800]" />
            <div className="flex items-center gap-2.5 pt-1">
              <UserPlus className="h-5 w-5 text-[#1E293B]" />
              <h2 className="font-pixel text-lg font-bold text-[#1E293B]">Government Officers</h2>
            </div>
          </div>

          <div className="p-5 font-sans">
            <p className="text-sm text-gray-700 leading-relaxed">
              Register a new government officer account to handle property verification, KYC approval and transfer compliance in a designated jurisdiction.
            </p>
            <button
              onClick={() => setShowOfficerModal(true)}
              className="lego-focus mt-5 flex w-full items-center justify-center gap-2 font-pixel text-base font-bold bg-[#F5B800] text-[#1E293B] border-2.5 border-[#475569] rounded px-4 py-3 shadow-[4px_4px_0px_#475569] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#475569] active:translate-y-1 active:shadow-[0px_0px_0px_#475569] transition-all cursor-pointer"
            >
              <UserPlus className="h-5 w-5" /> Register New Officer
            </button>
          </div>
        </div>
      </div>

      {/* Register Officer Modal */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="lego-card w-full max-w-lg p-6 space-y-4 bg-[#F8FAFC]">
            <div className="flex items-center justify-between border-b-2 border-[#475569] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#1E293B]" />
                <h3 className="text-xl font-bold font-pixel text-[#1E293B]">Register Government Officer</h3>
              </div>
              <button
                onClick={() => setShowOfficerModal(false)}
                className="lego-focus rounded-md p-1 text-[#1E293B] hover:bg-[#475569]/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterOfficer} className="space-y-4 font-sans">
              <div>
                <label className="ll-label text-[#1E293B] font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={officerForm.fullName}
                  onChange={e => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                  className="ll-input-brick"
                  placeholder="e.g. District Registrar"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="ll-label text-[#1E293B] font-bold">Email *</label>
                  <input
                    type="email"
                    required
                    value={officerForm.email}
                    onChange={e => setOfficerForm({ ...officerForm, email: e.target.value })}
                    className="ll-input-brick"
                    placeholder="officer@example.com"
                  />
                </div>
                <div>
                  <label className="ll-label text-[#1E293B] font-bold">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={officerForm.password}
                    onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })}
                    className="ll-input-brick"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="ll-label text-[#1E293B] font-bold">Phone</label>
                  <input
                    type="tel"
                    value={officerForm.phone}
                    onChange={e => setOfficerForm({ ...officerForm, phone: e.target.value })}
                    className="ll-input-brick"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="ll-label text-[#1E293B] font-bold">Jurisdiction</label>
                  <input
                    type="text"
                    value={officerForm.jurisdiction}
                    onChange={e => setOfficerForm({ ...officerForm, jurisdiction: e.target.value })}
                    className="ll-input-brick"
                    placeholder="e.g. Bengaluru Urban"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowOfficerModal(false)} 
                  className="lego-focus px-4 py-2 font-bold font-sans text-xs border-2 border-[#475569] rounded bg-white text-[#1E293B] shadow-[2px_2px_0px_#475569] hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingOfficer} 
                  className="lego-focus px-4 py-2 font-pixel text-sm font-bold border-2.5 border-[#475569] rounded bg-[#F5B800] text-[#1E293B] shadow-[3px_3px_0px_#475569] hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                >
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
