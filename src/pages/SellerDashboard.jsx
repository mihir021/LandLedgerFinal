/**
 * SellerDashboard — stat cards + properties list + incoming requests
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, FilePlus, ArrowLeftRight, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);

  const displayName = user?.fullName || user?.name || 'Seller';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [props, transfers] = await Promise.all([
          getProperties({ owner: user?._id, limit: 20 }).catch(() => ({ properties: [] })),
          getTransfers().catch(() => []),
        ]);
        setProperties(props.properties || []);
        setRequests(Array.isArray(transfers) ? transfers : []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const listed = properties.filter(p => p.verificationStatus === 'verified' && p.isListed);
  const pending = requests.filter(r => r.status === 'pending');

  const stats = [
    { icon: Home,          label: 'My Properties',     value: properties.length, color: 'navy'   },
    { icon: CheckCircle,   label: 'Active Listings',   value: listed.length,     color: 'green'  },
    { icon: ArrowLeftRight,label: 'Pending Requests',  value: pending.length,    color: 'amber'  },
    { icon: CheckCircle,   label: 'Sales Completed',   value: requests.filter(r=>r.status==='completed').length, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {firstName} — manage your properties and listings.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => <DashboardCard key={s.label} {...s} delay={i * 80} />)}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-300">
        {[
          { to: '/register-property',  icon: FilePlus,       color: 'text-blue-800 bg-blue-50 border-blue-200', label: 'Register New Property', desc: 'Upload documents and submit for verification' },
          { to: '/seller/properties',  icon: Home,           color: 'text-green-800 bg-green-50 border-green-200', label: 'Manage Properties',    desc: 'View, edit and manage your listings' },
          { to: '/seller/requests',    icon: ArrowLeftRight, color: 'text-amber-800 bg-amber-50 border-amber-200', label: 'Purchase Requests',    desc: 'Accept or reject incoming buyer requests' },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className={`ll-card p-4 border-2 ${a.color} hover:shadow-md transition-all group`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-6 w-6" />
                <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Properties */}
      <div className="ll-card animate-fade-in-up delay-400">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-gray-900">My Properties</h2>
          <Link to="/seller/properties" className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-blue-800 animate-spin" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No properties registered yet.</p>
            <Link to="/register-property" className="btn-primary text-sm">Register First Property</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {properties.slice(0, 5).map(p => (
              <Link key={p._id} to={`/property/${p._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} className="h-full w-full object-cover" alt="" /> : '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.address}, {p.city}</p>
                  <p className="text-xs text-gray-500">{p.landType} · {p.area?.toLocaleString()} sq ft</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{(p.price/100000).toFixed(1)}L</p>
                  <StatusBadge status={p.verificationStatus || 'pending'} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {pending.length > 0 && (
        <div className="ll-card animate-fade-in-up delay-500">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-gray-900">Pending Requests</h2>
              <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5">{pending.length}</span>
            </div>
            <Link to="/seller/requests" className="text-xs text-blue-700 font-medium hover:underline">Review all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.slice(0,3).map(r => (
              <div key={r._id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 shrink-0">
                  {(r.buyer?.fullName || 'B').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{r.buyer?.fullName || 'Buyer'}</p>
                  <p className="text-xs text-gray-500 truncate">{r.property?.address || 'Property'}</p>
                </div>
                <Link to="/seller/requests" className="btn-primary text-xs py-1.5 px-3">Review</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
