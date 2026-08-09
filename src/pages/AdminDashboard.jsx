/**
 * Admin Dashboard
 * Widgets: Total Users, Verified Users, Government Officers,
 *          Pending Transfers, Statistics
 * Fetches real data from the backend.
 */
import { useEffect, useState } from 'react';
import { FiUsers, FiCheckCircle, FiShield, FiRepeat, FiDatabase, FiActivity, FiLoader } from 'react-icons/fi';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/userService';
import { getTransfers } from '../services/transferService';
import { getProperties } from '../services/propertyService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    officers: 0,
    pendingTransfers: 0,
    totalProperties: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  const displayName = user?.fullName || user?.name || 'Administrator';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allUsers, officers, transfers, properties] = await Promise.all([
          getUsers({ limit: 100 }),
          getUsers({ role: 'officer', limit: 100 }),
          getTransfers(),
          getProperties({ limit: 1 }),
        ]);

        const users = allUsers.users || [];
        const verifiedCount = users.filter((u) => u.status === 'verified').length;
        const pendingTransferCount = (transfers || []).filter((t) => t.status !== 'completed').length;

        setStats({
          totalUsers: allUsers.pagination?.total || users.length,
          verifiedUsers: verifiedCount,
          officers: officers.pagination?.total || (officers.users || []).length,
          pendingTransfers: pendingTransferCount,
          totalProperties: properties.pagination?.total || 0,
        });

        setRecentUsers(users.slice(0, 6));
      } catch {
        // Dashboard still usable with defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { icon: FiUsers,       label: 'Total Users',         value: stats.totalUsers.toLocaleString(),    color: 'blue' },
    { icon: FiCheckCircle, label: 'Verified Users',      value: stats.verifiedUsers.toLocaleString(), color: 'emerald' },
    { icon: FiShield,      label: 'Government Officers', value: stats.officers,                        color: 'purple' },
    { icon: FiRepeat,      label: 'Pending Transfers',   value: stats.pendingTransfers,                color: 'amber' },
    { icon: FiDatabase,    label: 'Total Properties',    value: stats.totalProperties,                 color: 'cyan' },
    { icon: FiActivity,    label: 'Blockchain Status',   value: 'Pending',                             color: 'indigo' },
  ];

  /** Status color mapping */
  const statusColors = {
    verified: 'bg-emerald-500/15 text-emerald-400',
    pending:  'bg-amber-500/15 text-amber-400',
    rejected: 'bg-red-500/15 text-red-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Platform overview • {displayName}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, idx) => (
              <DashboardCard key={card.label} {...card} delay={idx * 100} />
            ))}
          </div>

          {/* Recent Users Table */}
          <div className="mt-8">
            <div className="glass-card overflow-hidden animate-fade-in-up delay-600">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <FiUsers className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Recent Users</h2>
              </div>

              {/* Table header */}
              <div className="hidden grid-cols-[1fr_120px_100px_80px] gap-4 border-b border-white/5 px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-500 sm:grid">
                <span>User</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Status</span>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-white/5">
                {recentUsers.length > 0 ? recentUsers.map((u) => (
                  <div key={u._id} className="grid grid-cols-1 gap-2 px-6 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1fr_120px_100px_80px] sm:items-center sm:gap-4">
                    <div>
                      <p className="text-sm text-navy-200">{u.fullName}</p>
                      <p className="text-xs text-navy-500">{u.email}</p>
                    </div>
                    <p className="text-xs text-navy-400 capitalize">{u.role}</p>
                    <p className="text-xs text-navy-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[u.status] || statusColors.pending}`}>
                      {u.status}
                    </span>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-navy-500">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
