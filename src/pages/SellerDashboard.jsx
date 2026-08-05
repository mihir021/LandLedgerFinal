/**
 * Seller Dashboard
 * Widgets: Total Properties, Pending Verification, Listed for Sale,
 *          Transfer Requests, Recent Activity
 */
import { FiFileText, FiClock, FiTag, FiRepeat, FiActivity, FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { sellerStats } from '../services/mockData';

export default function SellerDashboard() {
  const { user } = useAuth();

  const cards = [
    { icon: FiFileText, label: 'Total Properties',      value: sellerStats.totalProperties,      color: 'blue' },
    { icon: FiClock,    label: 'Pending Verification',   value: sellerStats.pendingVerification,  color: 'amber' },
    { icon: FiTag,      label: 'Listed for Sale',        value: sellerStats.listedForSale,        color: 'emerald' },
    { icon: FiRepeat,   label: 'Transfer Requests',      value: sellerStats.transferRequests,      color: 'purple' },
  ];

  /** Icon map for activity types */
  const activityIcons = {
    listing: 'bg-blue-500/15 text-blue-400',
    transfer: 'bg-purple-500/15 text-purple-400',
    document: 'bg-amber-500/15 text-amber-400',
    verified: 'bg-emerald-500/15 text-emerald-400',
    registration: 'bg-indigo-500/15 text-indigo-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-navy-400">Welcome back, {user?.name || 'Seller'}</p>
        </div>
        <Link
          to="/register-property"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
        >
          <FiPlusCircle className="h-4 w-4" />
          Register New Property
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <DashboardCard key={card.label} {...card} delay={idx * 100} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="glass-card overflow-hidden animate-fade-in-up delay-500">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <FiActivity className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-white/5">
            {sellerStats.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activityIcons[item.type] || activityIcons.listing}`}>
                  <FiActivity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-navy-200">{item.action}</p>
                  <p className="text-xs text-navy-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
