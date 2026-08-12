/**
 * BuyerPurchases — list of all purchase requests for the logged-in buyer
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, ExternalLink, Loader2, ArrowLeft, PenLine } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LifecycleTracker from '../components/LifecycleTracker';
import ConfirmationModal from '../components/ConfirmationModal';
import { getTransfers, buyerApprove } from '../services/transferService';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/helpers';

export default function BuyerPurchases() {
  const toast = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [signModal, setSignModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const data = await getTransfers({ view: 'buyer' });
        setPurchases(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load purchase requests.');
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(() => {
      getTransfers().then(data => {
        if (Array.isArray(data)) setPurchases(data);
      }).catch(console.error);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const statusToLifecycle = (status) => {
    const map = {
      pending: 'seller_approved',
      pendingRequest: 'seller_approved',
      pending_request: 'seller_approved',
      Initiated: 'seller_approved',
      seller_approved: 'buyer_signed',
      sellerApproved: 'buyer_signed',
      'Pending Verification': 'buyer_signed',
      buyer_signed: 'officer_approved',
      buyerApproved: 'officer_approved',
      officer_approved: 'chain_processing',
      officerApproved: 'chain_processing',
      pendingConfirmation: 'chain_processing',
      failedConfirmation: 'chain_processing', // Will show as stuck, or we could add a dedicated failed stage
      Approved: 'chain_processing',
      completed: 'completed',
      Completed: 'completed',
    };
    return map[status] || 'seller_approved';
  };

  const handleBuyerSign = async () => {
    setActionLoading(true);
    try {
      const updated = await buyerApprove(signModal.transferId);
      setPurchases(prev => prev.map(p => (p._id === signModal.transferId || p.id === signModal.transferId) ? updated : p));
      toast.success('You have signed and approved the transfer');
    } catch (err) {
      toast.error(err.message || 'Failed to sign transfer');
    } finally {
      setActionLoading(false);
      setSignModal(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/buyer" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all your property purchase requests</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-800 animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="ll-card p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">No purchase requests yet</h3>
          <p className="text-gray-500 text-sm mb-6">Browse verified properties and submit your first purchase request.</p>
          <Link to="/search" className="btn-primary text-sm">Search Properties</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((req, i) => {
            const isExpanded = expanded === (req._id || req.id);
            // API responses populate `propertyId`; older records may use
            // `property`. Always extract its MongoDB id before creating a URL.
            const property = (req.propertyId && typeof req.propertyId === 'object')
              ? req.propertyId
              : (req.property && typeof req.property === 'object' ? req.property : null);
            const propId = property?._id || (typeof req.propertyId === 'string' ? req.propertyId : null) || (typeof req.property === 'string' ? req.property : null);
            const propTitle = property?.title || property?.location?.district || property?.location?.surveyNumber || req.propertyTitle || 'Property';
            const status = req.status || 'pending';
            const amount = req.agreedPrice || req.property?.pricing?.priceINR || req.amount;
            const lifecycleStage = statusToLifecycle(status);

            return (
              <div
                key={req._id || req.id || i}
                className="ll-card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : (req._id || req.id))}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl shrink-0">🏠</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">{propTitle}</p>
                      {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">{req._id?.slice(-8) || req.id}</span>
                      {amount && <span>• {formatPrice(amount)}</span>}
                      {req.createdAt && <span>• {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={status} />
                    {propId && (
                      <Link
                        to={`/property/${propId}`}
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700"
                        title="View Property"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Expanded lifecycle */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 animate-fade-in">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Transfer Progress</h4>
                    <LifecycleTracker currentStage={lifecycleStage} compact />

                    {/* Buyer sign CTA */}
                    {(status === 'sellerApproved' || status === 'Pending Verification') && (
                      <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                            <PenLine className="h-4 w-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-blue-900">Your signature is required</h5>
                            <p className="text-xs text-blue-700 mt-1">
                              The seller has approved this transfer. You must now cryptographically sign the agreement to proceed to officer verification.
                            </p>
                            <button
                              onClick={() => setSignModal({ open: true, transferId: req._id || req.id, propTitle })}
                              className="mt-3 btn-primary text-xs py-1.5 px-3"
                            >
                              Sign Transfer Agreement
                            </button>
                          </div>
                        </div>
                      </div>
                    )}{/* Timeline */}
                    {req.timeline && req.timeline.length > 0 && (
                      <div className="mt-5">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity Log</h4>
                        <div className="space-y-2">
                          {req.timeline.map((t, j) => (
                            <div key={j} className="flex items-center gap-3 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                              <span className="font-medium text-gray-700">{t.stage}</span>
                              <span className="text-gray-400 text-xs ml-auto">{new Date(t.timestamp).toLocaleDateString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sign transfer confirmation */}
      <ConfirmationModal
        isOpen={!!signModal}
        onClose={() => setSignModal(null)}
        onConfirm={handleBuyerSign}
        loading={actionLoading}
        variant="approve"
        title="Sign & Approve Transfer"
        message="By signing, you confirm the agreed price and terms for this property transfer. Your digital signature will be recorded in the immutable title chain."
        details={signModal ? { 'Property': signModal.propertyTitle, 'Action': 'Digitally Sign Transfer' } : undefined}
        confirmLabel="Sign & Approve"
      />
    </div>
  );
}
