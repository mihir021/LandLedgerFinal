/**
 * Government Officer Dashboard
 * Widgets: Pending User Verification, Pending Property Verification,
 *          Pending Transfers, Recent Activity with Approve/Reject actions.
 * Fetches real data from the backend.
 */
import { useEffect, useState } from 'react';
import { FiUsers, FiCheckCircle, FiRepeat, FiActivity, FiLoader, FiCheck, FiX } from 'react-icons/fi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties, verifyProperty } from '../services/propertyService';
import { getTransfers, officerApprove } from '../services/transferService';
import { getUsers } from '../services/userService';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const displayName = user?.fullName || user?.name || 'Officer';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propResult, transfers, userResult] = await Promise.all([
        getProperties({ verificationStatus: 'pending', limit: 50 }),
        getTransfers(),
        getUsers({ status: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
      ]);
      setPendingProperties(propResult.properties || []);
      setPendingTransfers((transfers || []).filter((t) => t.status !== 'completed'));
      setPendingUsers(userResult.pagination?.total || 0);
    } catch {
      // Dashboard still usable
    } finally {
      setLoading(false);
    }
  };

  /** Verify or reject a property */
  const handleVerifyProperty = async (propertyId, status) => {
    setActionLoading(propertyId);
    try {
      await verifyProperty(propertyId, status);
      toast.success(`Property ${status} successfully`);
      setPendingProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      toast.error(err.message || `Failed to ${status} property`);
    } finally {
      setActionLoading(null);
    }
  };

  /** Approve a transfer */
  const handleApproveTransfer = async (transferId) => {
    setActionLoading(transferId);
    try {
      await officerApprove(transferId);
      toast.success('Transfer approved successfully');
      setPendingTransfers((prev) => prev.filter((t) => t._id !== transferId));
    } catch (err) {
      toast.error(err.message || 'Failed to approve transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const cards = [
    { icon: FiUsers,       label: 'Pending User Verification',     value: pendingUsers,               color: 'amber' },
    { icon: FiCheckCircle, label: 'Pending Property Verification', value: pendingProperties.length,   color: 'blue' },
    { icon: FiRepeat,      label: 'Pending Transfers',             value: pendingTransfers.length,    color: 'purple' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Welcome back, {displayName}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, idx) => (
              <DashboardCard key={card.label} {...card} delay={idx * 100} />
            ))}
          </div>

          {/* Pending Properties */}
          <div className="mt-8">
            <div className="glass-card overflow-hidden animate-fade-in-up delay-400">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <FiCheckCircle className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Pending Property Verification</h2>
              </div>
              <div className="divide-y divide-white/5">
                {pendingProperties.length > 0 ? pendingProperties.map((prop) => (
                  <div key={prop._id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy-200">{prop.propertyId} — {prop.address}, {prop.city}</p>
                      <p className="text-xs text-navy-500">Owner: {prop.owner?.fullName || 'Unknown'} • {prop.landType}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyProperty(prop._id, 'verified')}
                        disabled={actionLoading === prop._id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        <FiCheck className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerifyProperty(prop._id, 'rejected')}
                        disabled={actionLoading === prop._id}
                        className="flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                      >
                        <FiX className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-navy-500">
                    No pending properties to verify.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Transfers */}
          <div className="mt-8">
            <div className="glass-card overflow-hidden animate-fade-in-up delay-500">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <FiRepeat className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Pending Transfers</h2>
              </div>
              <div className="divide-y divide-white/5">
                {pendingTransfers.length > 0 ? pendingTransfers.map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy-200">
                        {t.property?.propertyId || t.property?.address || 'Property'} — {t.buyer?.fullName || 'Buyer'} → {t.seller?.fullName || 'Seller'}
                      </p>
                      <p className="text-xs text-navy-500">Status: {t.status}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={t.sellerApproved ? (t.officerApproved ? 'verified' : 'pending') : 'pending'} />
                      {t.sellerApproved && !t.officerApproved && (
                        <button
                          onClick={() => handleApproveTransfer(t._id)}
                          disabled={actionLoading === t._id}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          <FiCheck className="h-3 w-3" /> Approve
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-sm text-navy-500">
                    No pending transfers.
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
