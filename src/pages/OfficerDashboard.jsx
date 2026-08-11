/**
 * OfficerDashboard — streamlined light theme for Government Officers
 * Shows: pending KYC, pending property verifications, active transfers, inquiries
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowLeftRight, MessageSquare, Check, X, Loader2, Send, ArrowRight, Scale, Search } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProperties, verifyProperty } from '../services/propertyService';
import { getTransfers, officerApprove, completeTransfer } from '../services/transferService';
import { getUsers } from '../services/userService';
import { getInquiries, updateInquiryStatus } from '../services/inquiryService';
import { getDisputes, updateDispute } from '../services/disputeService';
import { deepSearchProperty } from '../utils/searchFilters';

import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, getSafeFeeOverrides } from '../config/web3';
import { LandLedgerABI } from '../config/LandLedgerABI.js';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [searchProp, setSearchProp] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const { writeContractAsync } = useWriteContract();
  const { address: walletAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Inquiry reply state
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');

  // Dispute resolve state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Confirmation modals
  const [propModal, setPropModal] = useState({ open: false, id: null, status: null, name: '' });
  const [transferModal, setTransferModal] = useState({ open: false, id: null });
  const [disputeModal, setDisputeModal] = useState({ open: false, id: null, status: null });

  const displayName = user?.fullName || user?.name || 'Officer';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propRes, transfers, userRes, inqData, disputeRes] = await Promise.all([
        getProperties({ verificationStatus: 'pending', limit: 100 }).catch(() => getProperties({ limit: 1000 }).catch(() => ({ properties: [] }))),
        getTransfers().catch(() => []),
        getUsers({ status: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        getInquiries().catch(() => []),
        getDisputes({ status: 'open', limit: 20 }).catch(() => ({ disputes: [] })),
      ]);

      const allFetchedProps = propRes.properties || [];
      const pendingProps = allFetchedProps.filter(
        p => (p.verification?.status || p.verificationStatus || 'Pending').toLowerCase() === 'pending'
      );

      setPendingProperties(pendingProps);
      setPendingTransfers((Array.isArray(transfers) ? transfers : []).filter(t => t.sellerApproved && t.buyerApproved && !t.officerApproved));
      setPendingUsers(userRes.pagination?.total || 0);
      setInquiries(Array.isArray(inqData) ? inqData : []);
      setDisputes(disputeRes.disputes || []);
    } catch {
      // Dashboard still usable
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async () => {
    setActionLoading(propModal.id);
    try {
      const isApprove = propModal.status?.toLowerCase() === 'verified';
      if (isApprove) {
        const prop = pendingProperties.find(p => p._id === propModal.id);
        const parcelId = prop?.blockchain?.parcelId || prop?.blockchainPropertyId || prop?.surveyNumber || prop?.propertyId || propModal.id;
        
        if (!isConnected || !walletAddress) {
          throw new Error('Connect the officer wallet in the top bar before approving a property.');
        }

        toast.info('Confirm the property verification in your wallet...');
        const feeOverrides = await getSafeFeeOverrides(publicClient);
        const txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: LandLedgerABI,
          functionName: 'verifyLand',
          args: [parcelId],
          ...feeOverrides,
        });
        toast.info(`Verification submitted on-chain: ${txHash}. Syncing with database...`);
        
        await verifyProperty(propModal.id, 'Verified', txHash);
      } else {
        await verifyProperty(propModal.id, 'Rejected');
      }
      
      toast.success(`Property ${isApprove ? 'Verified' : 'Rejected'} successfully`);
      setPendingProperties(prev => prev.filter(p => p._id !== propModal.id));
    } catch (err) {
      toast.error(err.message || 'Failed to verify property.');
    } finally {
      setActionLoading(null);
      setPropModal({ open: false, id: null, status: null, name: '' });
    }
  };

  const handleApproveTransfer = async () => {
    setActionLoading(transferModal.id);
    try {
      const transfer = pendingTransfers.find(t => t._id === transferModal.id);
      const parcelId = transfer?.property?.blockchain?.parcelId || transfer?.property?.blockchainPropertyId || transfer?.property?.surveyNumber || transfer?.property?.propertyId;
      const buyerWallet = transfer?.buyerWallet || transfer?.buyer?.walletAddress;
      
      if (!isConnected || !walletAddress) {
        throw new Error('Connect the approving wallet in the top bar before approving a transfer.');
      }
      if (!parcelId || !buyerWallet) {
        throw new Error('The transfer is missing its on-chain parcel ID or buyer wallet address.');
      }

      toast.info('Confirm the transfer transaction in your wallet...');
      const feeOverrides = await getSafeFeeOverrides(publicClient);
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: LandLedgerABI,
        functionName: 'finalizeTransfer',
        args: [parcelId],
        ...feeOverrides,
      });
      toast.info(`Transfer submitted on-chain: ${txHash}. Syncing with database...`);

      await officerApprove(transferModal.id, txHash);
      await completeTransfer(transferModal.id);
      toast.success('Transfer approved and ownership updated successfully');
      setPendingTransfers(prev => prev.filter(t => t._id !== transferModal.id));
    } catch (err) {
      toast.error(err.message || 'Failed to approve transfer.');
    } finally {
      setActionLoading(null);
      setTransferModal({ open: false, id: null });
    }
  };

  const handleInquiryReply = async (id) => {
    setActionLoading(id);
    try {
      const updated = await updateInquiryStatus(id, { status: replyStatus, response: replyText });
      toast.success('Inquiry updated in database');
      setInquiries(prev => prev.map(i => i._id === id ? updated : i));
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveDispute = async () => {
    setActionLoading(disputeModal.id);
    try {
      await updateDispute(disputeModal.id, { status: disputeModal.status, resolution: resolutionText });
      toast.success(`Dispute marked as ${disputeModal.status}`);
      setDisputes(prev => prev.filter(d => d._id !== disputeModal.id));
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setActionLoading(null);
      setDisputeModal({ open: false, id: null, status: null });
      setResolutionText('');
    }
  };

  const stats = [
    { icon: Users,          label: 'Pending KYC',           value: pendingUsers,             color: 'amber'  },
    { icon: ShieldCheck,    label: 'Pending Verification',  value: pendingProperties.length, color: 'navy'   },
    { icon: ArrowLeftRight, label: 'Awaiting Approval',     value: pendingTransfers.length,  color: 'purple' },
    { icon: MessageSquare,  label: 'Open Inquiries',        value: inquiries.filter(i=>i.status==='pending').length, color: 'green' },
    { icon: Scale,          label: 'Open Disputes',         value: disputes.length,          color: 'red'    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {displayName} — review pending items.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => <DashboardCard key={s.label} {...s} delay={i * 80} />)}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
        <>
          {/* Pending Properties */}
          <div className="ll-card overflow-hidden animate-fade-in-up delay-300">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-800" />
                <h2 className="font-serif text-base font-semibold text-gray-900">Pending Property Verification</h2>
              </div>
              {pendingProperties.length > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5">{pendingProperties.length}</span>
              )}
            </div>
            {/* Search Bar for Pending Properties */}
            {pendingProperties.length > 0 && (
              <div className="px-5 py-3 border-b border-gray-50">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={searchProp}
                    onChange={(e) => setSearchProp(e.target.value)}
                    placeholder="Search properties by ID, address, type..."
                    className="ll-input text-sm py-2"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            )}

            {pendingProperties.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10 flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> All properties reviewed!
              </p>
            ) : pendingProperties.filter(p => deepSearchProperty(p, searchProp)).length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No properties match your search.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingProperties.filter(p => deepSearchProperty(p, searchProp)).map(p => {
                  const image = p.documents?.[0]?.url;
                  return (
                  <div key={p._id} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg overflow-hidden shrink-0">
                      {image ? <img src={image.startsWith('http') ? image : `/${image.replace(/\\/g, '/')}`} alt="" className="h-full w-full object-cover" /> : '🏠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{p.propertyId || p._id?.slice(-8)} — {p.location?.district || p.location?.surveyNumber}, {p.location?.city}</p>
                      <p className="text-xs text-gray-500">Owner: {p.ownerId?.name || p.ownerId?.fullName || '—'} · {p.landDetails?.landType || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setPropModal({ open: true, id: p._id, status: 'Verified', name: `${p.location?.district || p.location?.surveyNumber}, ${p.location?.city}` })}
                        disabled={actionLoading === p._id}
                        className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => setPropModal({ open: true, id: p._id, status: 'Rejected', name: `${p.location?.district || p.location?.surveyNumber}, ${p.location?.city}` })}
                        disabled={actionLoading === p._id}
                        className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Pending Transfers */}
          <div className="ll-card overflow-hidden animate-fade-in-up delay-400">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-purple-600" />
                <h2 className="font-serif text-base font-semibold text-gray-900">Transfers Awaiting Approval</h2>
              </div>
              <Link to="/admin/transfers" className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1">
                All transfers <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {pendingTransfers.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No transfers awaiting officer approval.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingTransfers.map(t => (
                  <div key={t._id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {t.property?.propertyId || t.property?.address || 'Property'}
                      </p>
                      <p className="text-xs text-gray-500">{t.buyer?.fullName || 'Buyer'} ← {t.seller?.fullName || 'Seller'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status="seller_approved" />
                      <button
                        onClick={() => setTransferModal({ open: true, id: t._id })}
                        disabled={actionLoading === t._id}
                        className="btn-success text-xs py-1 px-2.5"
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disputes */}
          <div className="ll-card overflow-hidden animate-fade-in-up delay-500">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-red-600" />
                <h2 className="font-serif text-base font-semibold text-gray-900">Property Disputes</h2>
              </div>
              {disputes.length > 0 && (
                <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5">{disputes.length}</span>
              )}
            </div>
            {disputes.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No open disputes. ✓</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {disputes.map(d => (
                  <div key={d._id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{d.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {d.property?.propertyId || 'Property'} · Filed by {d.raiser?.fullName || 'User'}
                        </p>
                      </div>
                      <StatusBadge status={d.status || 'open'} />
                    </div>
                    <blockquote className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-700 italic leading-relaxed">
                      "{d.description}"
                    </blockquote>
                    {resolvingId === d._id ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                        <textarea
                          rows={2}
                          value={resolutionText}
                          onChange={e => setResolutionText(e.target.value)}
                          placeholder="Official resolution note..."
                          className="ll-input text-xs resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setResolvingId(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                          <button
                            onClick={() => setDisputeModal({ open: true, id: d._id, status: 'resolved' })}
                            disabled={actionLoading === d._id}
                            className="btn-success text-xs py-1.5 px-3"
                          >
                            <Check className="h-3 w-3" /> Resolve
                          </button>
                          <button
                            onClick={() => setDisputeModal({ open: true, id: d._id, status: 'rejected' })}
                            disabled={actionLoading === d._id}
                            className="btn-danger text-xs py-1.5 px-3"
                          >
                            <X className="h-3 w-3" /> Reject Claim
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => { setResolvingId(d._id); setResolutionText(''); }}
                          className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                        >
                          <Scale className="h-3.5 w-3.5" /> Review & Decide
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inquiries — MongoDB Atlas Collection */}
          <div className="ll-card overflow-hidden animate-fade-in-up delay-500">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-700" />
                <h2 className="font-serif text-base font-semibold text-gray-900">Property Inquiries</h2>
              </div>
              <span className="rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-xs font-mono text-green-700">
                MongoDB · inquiries ({inquiries.length})
              </span>
            </div>
            {inquiries.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No inquiries submitted yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {inquiries.map(inq => (
                  <div key={inq._id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">{inq.subject}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          From: <span className="font-medium text-gray-700">{inq.name}</span> ({inq.email})
                          {inq.phone ? ` · ${inq.phone}` : ''}
                          {inq.property ? ` · ${inq.property.propertyId || 'Property'}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={inq.status || 'pending'} />
                    </div>

                    <blockquote className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-700 italic leading-relaxed">
                      "{inq.message}"
                    </blockquote>

                    {inq.response && (
                      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                        <span className="font-semibold">Officer Response:</span> {inq.response}
                      </div>
                    )}

                    {replyingId === inq._id ? (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                        <div className="flex gap-3 flex-wrap">
                          <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)} className="ll-select w-auto text-xs">
                            <option value="Pending">Pending</option>
                            <option value="Open">Open</option>
                            <option value="Responded">Responded</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type official response to record in MongoDB Atlas..."
                          className="ll-input text-xs resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReplyingId(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                          <button
                            onClick={() => handleInquiryReply(inq._id)}
                            disabled={actionLoading === inq._id}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            <Send className="h-3 w-3" />
                            {actionLoading === inq._id ? 'Saving...' : 'Save Response'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => { setReplyingId(inq._id); setReplyText(inq.response || ''); setReplyStatus(inq.status || 'Responded'); }}
                          className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {inq.response ? 'Edit Response' : 'Reply & Update Status'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={propModal.open}
        onClose={() => setPropModal({ open: false, id: null, status: null, name: '' })}
        onConfirm={handleVerifyProperty}
        loading={actionLoading !== null}
        variant={propModal.status?.toLowerCase() === 'verified' ? 'approve' : 'reject'}
        title={propModal.status?.toLowerCase() === 'verified' ? 'Approve Property Verification' : 'Reject Property Verification'}
        message={propModal.status?.toLowerCase() === 'verified'
          ? 'This property will be marked as government-verified and listed on the marketplace.'
          : 'This property will be rejected. The seller must resubmit with corrected documents.'}
        details={propModal.name ? { 'Property': propModal.name } : undefined}
        confirmLabel={propModal.status?.toLowerCase() === 'verified' ? 'Approve Verification' : 'Reject Verification'}
      />
      <ConfirmationModal
        isOpen={transferModal.open}
        onClose={() => setTransferModal({ open: false, id: null })}
        onConfirm={handleApproveTransfer}
        loading={actionLoading !== null}
        variant="approve"
        title="Approve Transfer — Final Officer Compliance"
        message="This is the final officer compliance check. The smart contract will execute the ownership transfer and record it immutably on the blockchain."
        confirmLabel="Approve Transfer"
      />
      <ConfirmationModal
        isOpen={disputeModal.open}
        onClose={() => setDisputeModal({ open: false, id: null, status: null })}
        onConfirm={handleResolveDispute}
        loading={actionLoading !== null}
        variant={disputeModal.status === 'resolved' ? 'approve' : 'reject'}
        title={disputeModal.status === 'resolved' ? 'Resolve Dispute' : 'Reject Dispute Claim'}
        message={disputeModal.status === 'resolved'
          ? 'The dispute will be marked as resolved and the involved parties will be notified of the official outcome.'
          : 'The dispute claim will be rejected as unsubstantiated and the involved parties will be notified.'}
        confirmLabel={disputeModal.status === 'resolved' ? 'Confirm Resolution' : 'Confirm Rejection'}
      />
    </div>
  );
}
