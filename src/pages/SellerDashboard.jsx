/**
 * Seller Dashboard
 * Widgets: Total Properties, Pending Verification, Listed for Sale,
 *          Transfer Requests, Recent Activity
 * Fetches real data from the backend.
 */
import { useEffect, useState } from 'react';
import { FiFileText, FiClock, FiTag, FiRepeat, FiActivity, FiPlusCircle, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propResult, transferResult] = await Promise.all([
          getProperties({ owner: user?._id, limit: 100 }),
          getTransfers(),
        ]);
        setProperties(propResult.properties || []);
        setTransfers(transferResult || []);
      } catch {
        // Silently handle — dashboard is still usable
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  // Compute stats from real data
  const totalProperties = properties.length;
  const pendingVerification = properties.filter((p) => p.verificationStatus === 'pending').length;
  const listedForSale = properties.filter((p) => p.verificationStatus === 'verified').length;
  const transferRequests = transfers.filter((t) => t.status !== 'completed').length;

  const cards = [
    { icon: FiFileText, label: 'Total Properties',      value: totalProperties,      color: 'blue' },
    { icon: FiClock,    label: 'Pending Verification',   value: pendingVerification,  color: 'amber' },
    { icon: FiTag,      label: 'Verified Properties',    value: listedForSale,        color: 'emerald' },
    { icon: FiRepeat,   label: 'Transfer Requests',      value: transferRequests,      color: 'purple' },
  ];

  /** Icon map for activity types */
  const activityIcons = {
    listing: 'bg-blue-500/15 text-blue-400',
    transfer: 'bg-purple-500/15 text-purple-400',
    document: 'bg-amber-500/15 text-amber-400',
    verified: 'bg-emerald-500/15 text-emerald-400',
    registration: 'bg-indigo-500/15 text-indigo-400',
  };

  // Build recent activity from transfers
  const recentActivity = transfers.slice(0, 5).map((t, i) => ({
    id: t._id || i,
    action: `Transfer ${t.status} — ${t.property?.propertyId || t.property?.address || 'Property'}`,
    time: new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    type: 'transfer',
  }));

  const displayName = user?.fullName || user?.name || 'Seller';

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-navy-400">Welcome back, {displayName}</p>
        </div>
        <Link
          to="/register-property"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
        >
          <FiPlusCircle className="h-4 w-4" />
          Register New Property
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

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="glass-card overflow-hidden animate-fade-in-up delay-500">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <FiActivity className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="divide-y divide-white/5">
                {recentActivity.length > 0 ? recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activityIcons[item.type] || activityIcons.listing}`}>
                      <FiActivity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy-200">{item.action}</p>
                      <p className="text-xs text-navy-500">{item.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-navy-500">
                    No recent activity yet. Start by registering a property!
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
