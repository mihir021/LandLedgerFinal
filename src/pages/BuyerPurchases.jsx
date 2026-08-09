/**
 * BuyerPurchases — list of all purchase requests for the logged-in buyer
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LifecycleTracker from '../components/LifecycleTracker';
import { getTransfers } from '../services/transferService';
import { MOCK_PURCHASE_REQUESTS } from '../data/mock';

export default function BuyerPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTransfers();
        setPurchases(Array.isArray(data) ? data : MOCK_PURCHASE_REQUESTS);
      } catch {
        setPurchases(MOCK_PURCHASE_REQUESTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusToLifecycle = (status) => {
    const map = {
      pending: 'transfer_requested',
      seller_approved: 'seller_approved',
      buyer_signed: 'buyer_signed',
      officer_approved: 'officer_approved',
      completed: 'completed',
    };
    return map[status] || 'transfer_requested';
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
            const propId = req.property?._id || req.property || req.propertyId;
            const propTitle = req.property?.title || req.property?.address || req.propertyTitle || 'Property';
            const status = req.status || 'pending';
            const amount = req.agreedPrice || req.property?.price || req.amount;
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
                      {amount && <span>• ₹{(amount / 100000).toFixed(1)}L</span>}
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

                    {/* Timeline */}
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
    </div>
  );
}
