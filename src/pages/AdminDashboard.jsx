/**
 * Admin Dashboard
 * Widgets: Total Users, Verified Users, Government Officers,
 *          Pending Transfers, Blockchain Status, Audit Logs
 */
import { FiUsers, FiCheckCircle, FiShield, FiRepeat, FiDatabase, FiActivity } from 'react-icons/fi';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { adminStats } from '../services/mockData';

export default function AdminDashboard() {
  const { user } = useAuth();

  const cards = [
    { icon: FiUsers,       label: 'Total Users',         value: adminStats.totalUsers.toLocaleString(),    color: 'blue',    trend: 'up', trendValue: '+5.2%' },
    { icon: FiCheckCircle, label: 'Verified Users',      value: adminStats.verifiedUsers.toLocaleString(), color: 'emerald', trend: 'up', trendValue: '+3.1%' },
    { icon: FiShield,      label: 'Government Officers', value: adminStats.governmentOfficers,              color: 'purple' },
    { icon: FiRepeat,      label: 'Pending Transfers',   value: adminStats.pendingTransfers,                color: 'amber' },
    { icon: FiDatabase,    label: 'Blockchain Status',   value: adminStats.blockchainStatus,                color: 'cyan' },
    { icon: FiActivity,    label: 'Total Blocks',        value: adminStats.blockchainBlocks.toLocaleString(), color: 'indigo' },
  ];

  /** Log level color mapping */
  const levelColors = {
    info:    'bg-blue-500/15 text-blue-400',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    error:   'bg-red-500/15 text-red-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Platform overview • {user?.name || 'Administrator'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <DashboardCard key={card.label} {...card} delay={idx * 100} />
        ))}
      </div>

      {/* Audit Logs */}
      <div className="mt-8">
        <div className="glass-card overflow-hidden animate-fade-in-up delay-600">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <FiActivity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Audit Logs</h2>
          </div>

          {/* Table header */}
          <div className="hidden grid-cols-[1fr_120px_100px_80px] gap-4 border-b border-white/5 px-6 py-3 text-xs font-medium uppercase tracking-wider text-navy-500 sm:grid">
            <span>Action</span>
            <span>User</span>
            <span>Time</span>
            <span>Level</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/5">
            {adminStats.auditLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-1 gap-2 px-6 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1fr_120px_100px_80px] sm:items-center sm:gap-4">
                <p className="text-sm text-navy-200">{log.action}</p>
                <p className="text-xs text-navy-400">{log.user}</p>
                <p className="text-xs text-navy-500">{log.time}</p>
                <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${levelColors[log.level] || levelColors.info}`}>
                  {log.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
