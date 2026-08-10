/**
 * Property Details Page
 * Displays full property info, images, owner, status, blockchain fields, and purchase CTA.
 * Fetches data from the backend API.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiMapPin, FiMaximize, FiTag, FiUser, FiCalendar,
  FiFileText, FiShield, FiArrowLeft, FiShoppingCart, FiCopy,
  FiLoader, FiAlertCircle, FiClock, FiMessageSquare, FiX,
} from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import StatusBadge from '../components/StatusBadge';
import { getPropertyById } from '../services/propertyService';
import { requestTransfer } from '../services/transferService';
import { createInquiry } from '../services/inquiryService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function PropertyDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  // Inquiry state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryName, setInquiryName] = useState(user?.fullName || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    if (user) {
      setInquiryName(user.fullName || '');
      setInquiryEmail(user.email || '');
      setInquiryPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  /** Handle purchase request */
  const handlePurchase = async () => {
    if (!isAuthenticated || !property) return;
    setPurchasing(true);
    try {
      const ownerId = typeof property.owner === 'object' ? property.owner._id : property.owner;
      await requestTransfer({ propertyId: property._id, sellerId: ownerId });
      toast.success('Purchase request submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit purchase request');
    } finally {
      setPurchasing(false);
    }
  };

  /** Handle inquiry submission */
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim() || !inquiryName.trim() || !inquiryEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmittingInquiry(true);
    try {
      await createInquiry({
        propertyId: property._id,
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        subject: inquirySubject,
        message: inquiryMessage,
      });
      toast.success('Inquiry submitted and saved to database!');
      setShowInquiryModal(false);
      setInquirySubject('');
      setInquiryMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <FiLoader className="h-10 w-10 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-navy-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <FiAlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Failed to Load</h2>
          <p className="mt-2 text-navy-400">{error}</p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-5 py-2.5 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Not Found
  if (!property) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-white">Property Not Found</h2>
          <p className="mt-2 text-navy-400">The property you're looking for doesn't exist.</p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-5 py-2.5 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Normalize data
  const status = property.verificationStatus || 'pending';
  const ownerName = typeof property.owner === 'object' ? property.owner.fullName : (property.owner || 'Unknown');
  const ownerId = typeof property.owner === 'object' ? property.owner._id : property.owner;
  const images = property.images || [];
  const documents = property.documents || [];
  const hasRealImages = images.length > 0 && images[0] && !images[0].startsWith('#');
  const hasBlockchain = !!(property.blockchainTx || property.blockchainPropertyId);
  const title = property.title || `${(property.landType || 'property').charAt(0).toUpperCase() + (property.landType || 'property').slice(1)} Land — ${property.city || ''}`;

  const getImgUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('uploads/') || img.startsWith('uploads\\')) return `/${img.replace(/\\/g, '/')}`;
    return `/uploads/images/${img.replace(/\\/g, '/')}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors animate-fade-in"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Search
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="ll-card overflow-hidden animate-fade-in-up">
            {/* Main image */}
            {hasRealImages ? (
              <img
                src={getImgUrl(images[0])}
                alt={title}
                className="h-72 w-full object-cover sm:h-96"
              />
            ) : (
              <div
                className="h-72 w-full sm:h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
              >
                <span className="text-6xl">🏡</span>
              </div>
            )}
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
                {images.map((img, i) => (
                  <div key={i}>
                    {hasRealImages ? (
                      <img
                        src={getImgUrl(img)}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-16 w-20 rounded-lg border-2 border-transparent cursor-pointer object-cover transition-all hover:border-blue-700 first:border-blue-700"
                      />
                    ) : (
                      <div
                        className="h-16 w-20 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:border-blue-700 first:border-blue-700 bg-blue-100 flex items-center justify-center text-xl"
                      >
                        🏡
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="ll-card p-6 animate-fade-in-up delay-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold font-serif text-gray-900 sm:text-2xl">{title}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  {property.address}, {property.city}, {property.state}
                </div>
              </div>
              <StatusBadge status={status} size="md" />
            </div>

            {property.description && (
              <p className="mt-4 text-sm leading-relaxed text-gray-700">{property.description}</p>
            )}

            {/* Key info grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoItem icon={FiHash} label="Property ID" value={property.propertyId || property._id?.slice(-8)} />
              <InfoItem icon={FiMaximize} label="Area" value={`${property.area?.toLocaleString() || 0} sq ft`} />
              <InfoItem icon={FiTag} label="Land Type" value={(property.landType || '').charAt(0).toUpperCase() + (property.landType || '').slice(1)} />
              <InfoItem icon={FiCalendar} label="Listed" value={formatDate(property.createdAt)} />
            </div>
          </div>

          {/* Documents */}
          <div className="ll-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText className="h-5 w-5 text-blue-900" />
              <h2 className="text-lg font-bold font-serif text-gray-900">Documents</h2>
            </div>
            {documents.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((doc, i) => {
                  const fileName = typeof doc === 'string' ? doc.split(/[/\\]/).pop() : doc;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                      <FiFileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-800 truncate">{fileName}</span>
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Uploaded</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded yet.</p>
            )}
          </div>

          {/* Blockchain Section */}
          <div className="ll-card p-6 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 mb-6">
              <SiBlockchaindotcom className="h-5 w-5 text-blue-900" />
              <h2 className="text-lg font-bold font-serif text-gray-900">Blockchain Record</h2>
            </div>

            {hasBlockchain ? (
              <div className="space-y-4">
                {property.blockchainTx && (
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div>
                      <p className="text-xs text-gray-500">Transaction Hash</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-blue-950">{property.blockchainTx}</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(property.blockchainTx); toast.info('Hash copied!'); }}
                      className="text-gray-400 hover:text-blue-900 transition-colors"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {property.blockchainPropertyId && (
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div>
                      <p className="text-xs text-gray-500">On-Chain Property ID</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-blue-950">{property.blockchainPropertyId}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-4">
                <FiClock className="h-5 w-5 text-amber-700 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Pending Blockchain Registration</p>
                  <p className="text-xs text-amber-700">This property has not yet been registered on the blockchain.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column (Sidebar) ── */}
        <div className="space-y-6 sticky top-20 self-start">
          {/* Price Card */}
          <div className="ll-card p-6 animate-fade-in-up delay-100">
            <p className="text-sm text-gray-500">Listed Price</p>
            <p className="mt-1 text-3xl font-bold font-serif text-gray-900">{formatCurrency(property.price)}</p>

            {/* Verification badge */}
            {status === 'verified' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <FiShield className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Verified</p>
                  <p className="text-xs text-emerald-700">Property has been verified by a government officer</p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            {isAuthenticated && user?.role === 'buyer' && status === 'verified' && (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="mt-6 flex w-full items-center justify-center gap-2 btn-primary py-3.5 text-sm"
              >
                {purchasing ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiShoppingCart className="h-4 w-4" />
                )}
                {purchasing ? 'Submitting...' : 'Request to Purchase'}
              </button>
            )}

            {/* Inquiry Button */}
            <button
              onClick={() => setShowInquiryModal(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 btn-secondary py-3 text-sm"
            >
              <FiMessageSquare className="h-4 w-4 text-blue-900" />
              Inquire About Property
            </button>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="mt-6 flex w-full items-center justify-center gap-2 btn-primary py-3.5 text-sm"
              >
                Sign In to Purchase
              </Link>
            )}

            <p className="mt-3 text-center text-xs text-gray-500">
              Secured by smart contract • Escrow protected
            </p>
          </div>

          {/* Owner Card */}
          <div className="ll-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <FiUser className="h-5 w-5 text-blue-900" />
              <h3 className="text-base font-bold font-serif text-gray-900">Owner Information</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-lg font-bold text-white">
                {ownerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{ownerName}</p>
                {typeof property.owner === 'object' && property.owner.email && (
                  <p className="text-xs text-gray-500">{property.owner.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Survey Info */}
          <div className="ll-card p-6 animate-fade-in-up delay-300">
            <h3 className="mb-3 text-base font-bold font-serif text-gray-900">Survey Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Survey No.</span>
                <span className="font-mono text-xs font-semibold text-gray-800">{property.surveyNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">District</span>
                <span className="font-semibold text-gray-800">{property.district || 'N/A'}</span>
              </div>
              {property.currentOwnerWallet && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Owner Wallet</span>
                  <span className="font-mono text-xs text-gray-700">{property.currentOwnerWallet.slice(0, 10)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="h-5 w-5 text-blue-900" />
                <h3 className="text-lg font-bold font-serif text-gray-900">Property Inquiry</h3>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="ll-label">Your Name *</label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="ll-input"
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="ll-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="ll-input"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="ll-label">Phone Number</label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="ll-input"
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div>
                <label className="ll-label">Subject *</label>
                <input
                  type="text"
                  required
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="ll-input"
                  placeholder="e.g. Zoning question, Document verification..."
                />
              </div>

              <div>
                <label className="ll-label">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="ll-input resize-none"
                  placeholder="Write your questions or details about this property..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="btn-primary text-xs"
                >
                  {submittingInquiry ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiMessageSquare className="h-4 w-4" />}
                  {submittingInquiry ? 'Submitting...' : 'Send Inquiry to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small info item with icon */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/** Needed for the InfoItem hash icon */
function FiHash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

