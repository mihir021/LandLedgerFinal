/**
 * Buyer Dashboard
 * Widgets: Available Properties, Purchase Requests, Owned Properties, Notifications
 * Fetches real data from the backend.
 */
import { useEffect, useState } from 'react';
import { FiSearch, FiShoppingCart, FiHome, FiBell, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ availableProperties: 0, purchaseRequests: 0, ownedProperties: 0 });
  const displayName = user?.fullName || user?.name || 'Buyer';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propResult, transfers] = await Promise.all([
          getProperties({ verificationStatus: 'verified', limit: 1 }),
          getTransfers(),
        ]);

        const purchaseRequests = (transfers || []).filter((t) => t.status !== 'completed').length;
        const ownedProperties = (transfers || []).filter((t) => t.status === 'completed').length;

        setStats({
          availableProperties: propResult.pagination?.total || 0,
          purchaseRequests,
          ownedProperties,
        });
      } catch {
        // Dashboard still usable with defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { icon: FiSearch,       label: 'Available Properties',  value: stats.availableProperties,  color: 'blue' },
    { icon: FiShoppingCart, label: 'Purchase Requests',     value: stats.purchaseRequests,      color: 'purple' },
    { icon: FiHome,         label: 'Owned Properties',      value: stats.ownedProperties,       color: 'emerald' },
    { icon: FiBell,         label: 'Unread Notifications',  value: unreadCount,                 color: 'cyan' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buyer Dashboard</h1>
          <p className="mt-1 text-sm text-navy-400">Welcome back, {displayName}</p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
        >
          <FiSearch className="h-4 w-4" />
          Search Properties
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
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
                {unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="divide-y divide-white/5">
                {notifications.length > 0 ? notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && markRead(notif._id)}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] cursor-pointer ${
                      !notif.isRead ? 'bg-blue-500/[0.03]' : ''
                    }`}
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!notif.isRead ? 'bg-blue-400' : 'bg-navy-600'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notif.isRead ? 'text-white' : 'text-navy-300'}`}>{notif.message}</p>
                      <p className="mt-1 text-xs text-navy-500">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-navy-500">
                    No notifications yet.
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
