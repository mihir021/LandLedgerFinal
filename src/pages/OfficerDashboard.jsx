/**
 * Government Officer Dashboard
 * Widgets: Pending User Verification, Pending Property Verification,
 *          Pending Transfers, Disputes, Blockchain Activity
 */
import { FiUsers, FiCheckCircle, FiRepeat, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { officerStats } from '../services/mockData';

export default function OfficerDashboard() {
  const { user } = useAuth();

  const cards = [
    { icon: FiUsers,         label: 'Pending User Verification',     value: officerStats.pendingUserVerification,     color: 'amber' },
    { icon: FiCheckCircle,   label: 'Pending Property Verification', value: officerStats.pendingPropertyVerification, color: 'blue' },
    { icon: FiRepeat,        label: 'Pending Transfers',             value: officerStats.pendingTransfers,            color: 'purple' },
    { icon: FiAlertTriangle, label: 'Active Disputes',               value: officerStats.disputes,                     color: 'red' },
  ];

  /** Status-to-badge mapping */
  const statusMap = { pending: 'pending', approved: 'verified', investigating: 'transfer', completed: 'verified' };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Welcome back, {user?.name || 'Officer'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <DashboardCard key={card.label} {...card} delay={idx * 100} />
        ))}
      </div>

      {/* Blockchain Activity Feed */}
      <div className="mt-8">
        <div className="glass-card overflow-hidden animate-fade-in-up delay-500">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <FiActivity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Blockchain Activity</h2>
          </div>
          <div className="divide-y divide-white/5">
            {officerStats.blockchainActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-navy-200">{item.action}</p>
                  <p className="text-xs text-navy-500">{item.time}</p>
                </div>
                <StatusBadge status={statusMap[item.status] || 'pending'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
