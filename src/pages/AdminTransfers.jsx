/**
 * AdminTransfers — active transfer requests for officer compliance review
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, ArrowLeftRight, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LifecycleTracker from '../components/LifecycleTracker';
import ConfirmationModal from '../components/ConfirmationModal';
import { getTransfers, officerApprove, completeTransfer } from '../services/transferService';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/helpers';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, getSafeFeeOverrides } from '../config/web3';
import { LandLedgerABI } from '../config/LandLedgerABI.js';

export default function AdminTransfers() {
  const toast = useToast();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const { address: walletAddress, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchTransfers = () => {
      getTransfers()
        .then(data => setTransfers(Array.isArray(data) ? data : []))
        .catch(() => setTransfers([]))
        .finally(() => setLoading(false));
    };
    
    fetchTransfers();
    const interval = setInterval(() => {
      getTransfers()
        .then(data => { if (Array.isArray(data)) setTransfers(data); })
        .catch(console.error);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const pending  = transfers.filter(t => t.sellerApproved && t.buyerApproved && !t.officerApproved && t.status !== 'completed');
  const processing = transfers.filter(t => t.officerApproved && t.status !== 'completed');
  const active   = transfers.filter(t => (!t.sellerApproved || !t.buyerApproved) && t.status !== 'completed');
  const completed= transfers.filter(t => t.status === 'completed');

  const finalizeOnChain = async (transfer) => {
    const parcelId = transfer?.property?.blockchain?.parcelId
      || transfer?.property?.blockchainPropertyId
      || transfer?.property?.surveyNumber
      || transfer?.property?.propertyId;

    if (!isConnected || !walletAddress) {
      throw new Error('Connect the registry-admin wallet in the top bar before completing this transfer.');
    }
    if (!parcelId) {
      throw new Error('This transfer is missing its on-chain parcel ID.');
    }

    toast.info('Confirm the final transfer transaction in your wallet...');
    const feeOverrides = await getSafeFeeOverrides(publicClient);
    const txHash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: LandLedgerABI,
      functionName: 'finalizeTransfer',
      args: [parcelId],
      ...feeOverrides,
    });
    toast.info(`Transfer submitted on-chain: ${txHash}. Background monitoring started...`);
    
    return txHash;
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const transfer = transfers.find(t => t._id === modal.id);
      if (!transfer) throw new Error('Transfer not found. Refresh and try again.');
      const txHash = await finalizeOnChain(transfer);
      await officerApprove(modal.id, txHash);
      toast.success('Transfer approved. Background job is monitoring the blockchain.');
      setTransfers(prev => prev.map(t =>
        t._id === modal.id ? { ...t, officerApproved: true, status: 'pendingConfirmation', blockchainTxHash: txHash } : t
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
      setModal({ open: false, id: null });
    }
  };

  const handleComplete = async (transfer) => {
    setActionLoading(transfer._id);
    try {
      await finalizeOnChain(transfer);
      await officerApprove(transfer._id, '0x...'); // Fallback manual trigger, tx already exists
      toast.success('Transfer completed manually');
      setTransfers(prev => prev.map(t => t._id === transfer._id ? { ...t, status: 'pendingConfirmation' } : t));
    } catch (err) {
      toast.error(err.message || 'Failed to complete transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const TransferRow = ({ t, showApprove = false }) => {
    const isExpanded = expanded === t._id;
    return (
      <div className="ll-card overflow-hidden mb-3 animate-fade-in-up" style={{ opacity: 0 }}>
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(isExpanded ? null : t._id)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg shrink-0">🔄</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              {t.property?.propertyId || t.property?.location?.district || t.property?.location?.surveyNumber || 'Property'} — {t.buyer?.name || t.buyer?.fullName || 'Buyer'} ← {t.seller?.name || t.seller?.fullName || 'Seller'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {t.agreedPrice && <span>{formatPrice(t.agreedPrice)}</span>}
              {t.createdAt && <span>· {new Date(t.createdAt).toLocaleDateString('en-IN')}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={t.status || (t.sellerApproved ? 'seller_approved' : 'pending')} />
            {t.property && (
              <Link to={`/property/${t.property._id || t.property}`} onClick={e => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700">
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
            {showApprove && (
              <button
                onClick={e => { e.stopPropagation(); setModal({ open: true, id: t._id }); }}
                className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
            )}
            {t.officerApproved && t.status !== 'completed' && (
              <button
                disabled={actionLoading === t._id}
                onClick={e => { e.stopPropagation(); handleComplete(t); }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {actionLoading === t._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Complete on-chain
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Transfer Progress</p>
            <LifecycleTracker
              currentStage={t.status === 'Completed' || t.status === 'completed' ? 'completed' : t.status === 'Approved' || t.officerApproved ? 'chain_processing' : t.status === 'buyerApproved' || t.buyerApproved ? 'officer_approved' : t.status === 'Pending Verification' || t.sellerApproved ? 'buyer_signed' : 'seller_approved'}
              compact
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/admin" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Transfer Management</h1>
          <p className="text-gray-500 text-sm">{pending.length} transfer{pending.length !== 1 ? 's' : ''} awaiting officer approval</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Awaiting Officer Approval ({pending.length})
              </h2>
              {pending.map(t => <TransferRow key={t._id} t={t} showApprove />)}
            </div>
          )}

          {processing.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ready for On-Chain Completion ({processing.length})</h2>
              <p className="text-sm text-gray-500 mb-3">Use the registry-admin wallet to finalize these previously approved transfers.</p>
              {processing.map(t => <TransferRow key={t._id} t={t} />)}
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Transfers ({active.length})</h2>
              {active.map(t => <TransferRow key={t._id} t={t} />)}
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Completed ({completed.length})</h2>
              {completed.map(t => <TransferRow key={t._id} t={t} />)}
            </div>
          )}

          {transfers.length === 0 && (
            <div className="ll-card p-12 text-center">
              <ArrowLeftRight className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No transfers found.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, id: null })}
        onConfirm={handleApprove}
        loading={actionLoading}
        variant="approve"
        title="Approve Transfer — Officer Compliance"
        message="You are performing the final officer compliance check. Once approved, the smart contract will execute the ownership transfer and record it immutably on the blockchain."
        confirmLabel="Approve Transfer"
      />
    </div>
  );
}
