/**
 * SellerRequests — incoming purchase requests with accept/reject
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, ArrowLeftRight, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { getTransfers, sellerApprove } from '../services/transferService';
import { useToast } from '../context/ToastContext';
import { MOCK_PURCHASE_REQUESTS } from '../data/mock';

export default function SellerRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, id: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getTransfers()
      .then(data => setRequests(Array.isArray(data) ? data : MOCK_PURCHASE_REQUESTS))
      .catch(() => setRequests(MOCK_PURCHASE_REQUESTS))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (id, action) => setModal({ open: true, id, action });
  const closeModal = () => setModal({ open: false, id: null, action: null });

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      if (modal.action === 'approve') {
        await sellerApprove(modal.id);
        toast.success('Request approved! Buyer will be notified.');
        setRequests(prev => prev.map(r =>
          (r._id === modal.id || r.id === modal.id) ? { ...r, status: 'seller_approved', sellerApproved: true } : r
        ));
      } else {
        toast.success('Request rejected.');
        setRequests(prev => prev.filter(r => r._id !== modal.id && r.id !== modal.id));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      closeModal();
    }
  };

  const pending  = requests.filter(r => r.status === 'pending');
  const others   = requests.filter(r => r.status !== 'pending');

  const selectedReq = requests.find(r => r._id === modal.id || r.id === modal.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/seller" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Purchase Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pending.length} request{pending.length !== 1 ? 's' : ''} awaiting your decision</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Awaiting Your Decision ({pending.length})</h2>
              {pending.map((req, i) => (
                <div key={req._id || req.id || i} className="ll-card border-l-4 border-amber-400 p-5 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 shrink-0">
                        {(req.buyer?.name || req.buyer?.fullName || req.buyerName || 'B').charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">{req.buyer?.name || req.buyer?.fullName || req.buyerName || 'Buyer'}</p>
                        <p className="text-xs text-gray-500">
                          {req.property?.location?.district || req.property?.location?.surveyNumber || req.propertyTitle || 'Property'}
                          {(req.agreedPrice || req.amount) && ` · ₹${((req.agreedPrice || req.amount)/100000).toFixed(1)}L`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{req.createdAt && `Submitted ${new Date(req.createdAt).toLocaleDateString('en-IN')}`}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {req.property?._id && (
                        <Link to={`/property/${req.property._id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-700" title="View Property">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button onClick={() => openModal(req._id || req.id, 'reject')} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button onClick={() => openModal(req._id || req.id, 'approve')} className="btn-success text-sm">
                        <CheckCircle className="h-4 w-4" /> Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other requests */}
          {others.length > 0 && (
            <div className="ll-card overflow-hidden animate-fade-in-up delay-300">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-serif text-base font-semibold text-gray-700">Past Requests</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {others.map((req, i) => (
                  <div key={req._id || req.id || i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                      {(req.buyer?.name || req.buyer?.fullName || req.buyerName || 'B').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{req.buyer?.name || req.buyer?.fullName || req.buyerName}</p>
                      <p className="text-xs text-gray-400 truncate">{req.property?.location?.district || req.property?.location?.surveyNumber || req.propertyTitle}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="ll-card p-12 text-center">
              <ArrowLeftRight className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No purchase requests yet.</p>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        loading={actionLoading}
        variant={modal.action === 'approve' ? 'approve' : 'reject'}
        title={modal.action === 'approve' ? 'Accept Purchase Request' : 'Reject Purchase Request'}
        message={modal.action === 'approve'
          ? 'By accepting, you agree to initiate the transfer process. The buyer will be notified and a blockchain transaction will be prepared.'
          : 'This will reject the purchase request. The buyer will be notified and no transfer will proceed.'}
        details={selectedReq ? {
          'Buyer': selectedReq.buyer?.name || selectedReq.buyer?.fullName || selectedReq.buyerName || '—',
          'Property': (selectedReq.property?.location?.district || selectedReq.property?.location?.surveyNumber || selectedReq.propertyTitle || '—').slice(0, 40),
          'Amount': selectedReq.agreedPrice || selectedReq.amount ? `₹${((selectedReq.agreedPrice || selectedReq.amount)/100000).toFixed(1)}L` : '—',
        } : undefined}
      />
    </div>
  );
}
