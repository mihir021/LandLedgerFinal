/**
 * BuyerDashboard — stat cards + recent notifications + quick actions
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Home, Bell, ArrowRight, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { MOCK_NOTIFICATIONS } from '../data/mock';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const displayName = user?.fullName || user?.name || 'Buyer';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [props, transfers] = await Promise.all([
          getProperties({ status: 'verified', limit: 6 }).catch(() => ({ properties: [] })),
          getTransfers().catch(() => []),
        ]);
        setProperties(props.properties || []);
        setPurchases(Array.isArray(transfers) ? transfers : []);
      } catch {
        // Still render with empty data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { icon: Home,        label: 'Available Properties', value: properties.length,                    color: 'navy' },
    { icon: FileText,    label: 'My Purchases',         value: purchases.length,                     color: 'green' },
    { icon: Clock,       label: 'Pending Requests',     value: purchases.filter(p => p.status === 'pending').length, color: 'amber' },
    { icon: CheckCircle, label: 'Completed',            value: purchases.filter(p => p.status === 'completed').length, color: 'emerald' },
  ];

  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.read).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Welcome back, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1">Your property dashboard — everything in one place.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <DashboardCard key={s.label} {...s} delay={i * 80} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="ll-card p-5 animate-fade-in-up delay-300">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/search" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-all group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Search className="h-4 w-4 text-blue-800" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Search Properties</p>
                <p className="text-xs text-gray-500">Browse verified listings</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-700 transition-colors" />
            </Link>
            <Link to="/buyer/purchases" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-green-50 hover:border-green-200 transition-all group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                <FileText className="h-4 w-4 text-green-800" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">My Purchases</p>
                <p className="text-xs text-gray-500">Track purchase requests</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-green-700 transition-colors" />
            </Link>
            <Link to="/buyer/wallet" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-amber-50 hover:border-amber-200 transition-all group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                <ShieldCheck className="h-4 w-4 text-amber-800" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">My Wallet</p>
                <p className="text-xs text-gray-500">Manage blockchain wallet</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-amber-700 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="lg:col-span-2 ll-card p-5 animate-fade-in-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-gray-900">Recent Notifications</h2>
            <Link to="/buyer/notifications" className="text-xs text-blue-700 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {unreadNotifs.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No new notifications</p>
            ) : (
              unreadNotifs.map(n => (
                <div key={n.id} className={`flex gap-3 rounded-lg p-3 border ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.read ? 'bg-gray-300' : 'bg-blue-600'}`} />
                  <div>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Verified Properties */}
      <div className="ll-card animate-fade-in-up delay-500">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-gray-900">Available Verified Properties</h2>
          <Link to="/search" className="text-xs text-blue-700 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 rounded-full border-2 border-blue-800 border-t-transparent animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No verified properties available.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {properties.slice(0, 5).map(prop => (
              <Link key={prop._id} to={`/property/${prop._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                  {prop.images?.[0] ? <img src={prop.images[0]} className="h-full w-full object-cover" alt="" /> : '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {prop.title || `${prop.landType} property`} — {prop.city}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{prop.address}, {prop.state}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{(prop.price / 100000).toFixed(1)}L</p>
                  <StatusBadge status={prop.status || 'verified'} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
