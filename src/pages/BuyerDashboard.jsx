/**
 * Buyer Dashboard
 * Widgets: Search Properties, Purchase Requests, Owned Properties, Wallet, Notifications
 */
import { FiSearch, FiShoppingCart, FiHome, FiDollarSign, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { buyerStats } from '../services/mockData';
import { formatCurrency } from '../utils/helpers';

export default function BuyerDashboard() {
  const { user } = useAuth();

  const cards = [
    { icon: FiSearch,       label: 'Available Properties',  value: buyerStats.searchProperties,  color: 'blue' },
    { icon: FiShoppingCart, label: 'Purchase Requests',     value: buyerStats.purchaseRequests,  color: 'purple' },
    { icon: FiHome,         label: 'Owned Properties',      value: buyerStats.ownedProperties,   color: 'emerald' },
    { icon: FiDollarSign,   label: 'Wallet Balance',        value: formatCurrency(buyerStats.walletBalance), color: 'cyan' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buyer Dashboard</h1>
          <p className="mt-1 text-sm text-navy-400">Welcome back, {user?.name || 'Buyer'}</p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
        >
          <FiSearch className="h-4 w-4" />
          Search Properties
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <DashboardCard key={card.label} {...card} delay={idx * 100} />
        ))}
      </div>

      {/* Notifications */}
      <div className="mt-8">
        <div className="glass-card overflow-hidden animate-fade-in-up delay-500">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <FiBell className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <span className="ml-auto rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
              {buyerStats.notifications.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {buyerStats.notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] ${
                  !notif.read ? 'bg-blue-500/[0.03]' : ''
                }`}
              >
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!notif.read ? 'bg-blue-400' : 'bg-navy-600'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!notif.read ? 'text-white' : 'text-navy-300'}`}>{notif.message}</p>
                  <p className="mt-1 text-xs text-navy-500">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
