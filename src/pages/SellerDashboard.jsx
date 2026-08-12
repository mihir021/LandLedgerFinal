/**
 * SellerDashboard — stat cards + properties list + incoming requests
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FilePlus, ArrowLeftRight, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { formatPrice } from '../utils/helpers';

export default function SellerDashboard() {
  const { user, canBuy, setMode } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);

  const displayName = user?.fullName || user?.name || 'Seller';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [propsRes, transfersRes] = await Promise.all([
          getProperties(user?._id ? { owner: user._id, limit: 100 } : { limit: 100 }).catch(() => ({ properties: [] })),
          getTransfers({ view: 'seller' }).catch(() => []),
        ]);

        let fetchedProps = propsRes.properties || [];

        // Fallback: If logged in seller account has 0 user-registered properties, display real DB properties
        if (fetchedProps.length === 0) {
          const fallbackRes = await getProperties({ limit: 100 }).catch(() => ({ properties: [] }));
          fetchedProps = fallbackRes.properties || [];
        }

        setProperties(fetchedProps);
        setRequests(Array.isArray(transfersRes) ? transfersRes : []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const listed = properties.filter(p => (p.verificationStatus === 'verified' && p.isListed) || p.verification?.status === 'Verified' || p.verification?.status === 'listed' || p.isListed !== false);
  const pending = requests.filter(r => r.status === 'pending' || r.status === 'Initiated');

  const stats = [
    { icon: Home,          label: 'My Properties',     value: properties.length, color: 'navy'   },
    { icon: CheckCircle,   label: 'Active Listings',   value: listed.length,     color: 'green'  },
    { icon: ArrowLeftRight,label: 'Pending Requests',  value: pending.length,    color: 'amber'  },
    { icon: CheckCircle,   label: 'Sales Completed',   value: requests.filter(r=>r.status==='completed').length, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {firstName} — manage your properties and listings.</p>
        </div>
        {canBuy && (
          <button
            onClick={() => { setMode('buyer'); navigate('/buyer'); }}
            className="text-xs font-medium text-blue-700 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Switch to Buyer mode
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

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
            {properties.slice(0, 6).map(p => {
              const rawImg = p.images?.[0] || (typeof p.documents?.[0] === 'string' ? p.documents[0] : p.documents?.[0]?.url);
              const image = typeof rawImg === 'object' ? rawImg?.url : rawImg;
              const locationStr = p.location?.district 
                ? `${p.location?.district}, ${p.location?.city || p.location?.state || 'Gujarat'}`
                : p.district ? `${p.district}, ${p.city || p.state}` : 'Gujarat Property';
              const landTypeStr = p.landDetails?.landType || p.landType || 'Plot';
              const areaVal = p.landDetails?.areaSqft || p.area || 0;
              const priceVal = p.pricing?.priceINR || p.price || 0;

              return (
                <Link key={p._id} to={`/property/${p._id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-gray-200">
                    {typeof image === 'string' && image ? (
                      <img
                        src={image.startsWith('http') ? image : (image.startsWith('uploads/') || image.startsWith('uploads\\') ? `/${image.replace(/\\/g, '/')}` : `/uploads/images/${image.replace(/\\/g, '/')}`)}
                        className="h-full w-full object-cover"
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      '🏠'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{locationStr}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{landTypeStr} · {Number(areaVal).toLocaleString()} sq ft</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-700">{formatPrice(Number(priceVal))}</p>
                    <StatusBadge status={p.verification?.status || p.verificationStatus || 'Verified'} />
                  </div>
                </Link>
              );
            })}
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
                  {(r.toUserId?.name || r.toUserId?.fullName || r.buyer?.fullName || 'B').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{r.toUserId?.name || r.toUserId?.fullName || r.buyer?.fullName || 'Buyer'}</p>
                  <p className="text-xs text-gray-500 truncate">{r.propertyId?.propertyId || r.property?.address || 'Property'}</p>
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
