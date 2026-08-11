/**
 * AdminDashboard — system-wide stats + activity feed + quick access panels
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowLeftRight, Home, ArrowRight, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { getUsers } from '../services/userService';
import { MOCK_SYSTEM_STATS } from '../data/mock';

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(MOCK_SYSTEM_STATS);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);

  const displayName = user?.fullName || user?.name || 'Admin';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propRes, transfers, userRes] = await Promise.all([
          getProperties({ status: 'Pending', limit: 5 }).catch(() => ({ properties: [], pagination: { total: 0 } })),
          getTransfers().catch(() => []),
          getUsers({ status: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        ]);
        setPendingProperties(propRes.properties || []);
        setRecentTransfers(Array.isArray(transfers) ? transfers.slice(0, 5) : []);
        setStats(s => ({
          ...s,
          pendingKyc: userRes.pagination?.total || s.pendingKyc,
          pendingProperties: propRes.pagination?.total || (propRes.properties?.length ?? s.pendingProperties),
          activeTransfers: (Array.isArray(transfers) ? transfers.filter(t => t.status !== 'completed').length : s.activeTransfers),
          completedTransfers: (Array.isArray(transfers) ? transfers.filter(t => t.status === 'completed').length : s.completedTransfers),
        }));
      } catch {
        // fallback to mock stats
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    </div>
  );
}
