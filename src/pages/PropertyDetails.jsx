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
  FiLoader, FiAlertCircle, FiClock,
} from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import StatusBadge from '../components/StatusBadge';
import { getPropertyById } from '../services/propertyService';
import { requestTransfer } from '../services/transferService';
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm text-navy-400 transition-colors hover:text-white animate-fade-in"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Search
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="glass-card overflow-hidden animate-fade-in-up">
            {/* Main image */}
            {hasRealImages ? (
              <img
                src={`/uploads/${images[0].replace(/\\/g, '/')}`}
                alt={title}
                className="h-72 w-full object-cover sm:h-96"
              />
            ) : (
              <div
                className="h-72 w-full sm:h-96"
                style={{
                  background: `linear-gradient(135deg, ${images[0] || '#3b82f6'}DD, ${images[1] || '#6366f1'}99)`,
                }}
              />
            )}
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3">
                {images.map((img, i) => (
                  <div key={i}>
                    {hasRealImages ? (
                      <img
                        src={`/uploads/${img.replace(/\\/g, '/')}`}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-16 w-20 rounded-lg border-2 border-transparent cursor-pointer object-cover transition-all hover:border-blue-500 first:border-blue-500"
                      />
                    ) : (
                      <div
                        className="h-16 w-20 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:border-blue-500 first:border-blue-500"
                        style={{ background: `linear-gradient(135deg, ${img}CC, ${img}88)` }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="glass-card p-6 animate-fade-in-up delay-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-400">
                  <FiMapPin className="h-4 w-4 text-navy-500" />
                  {property.address}, {property.city}, {property.state}
                </div>
              </div>
              <StatusBadge status={status} size="md" />
            </div>

            {property.description && (
              <p className="mt-4 text-sm leading-relaxed text-navy-300">{property.description}</p>
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
          <div className="glass-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Documents</h2>
            </div>
            {documents.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((doc, i) => {
                  const fileName = typeof doc === 'string' ? doc.split(/[/\\]/).pop() : doc;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5">
                      <FiFileText className="h-4 w-4 text-navy-400" />
                      <span className="text-sm text-navy-200 truncate">{fileName}</span>
                      <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Uploaded</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-navy-500">No documents uploaded yet.</p>
            )}
          </div>

          {/* Blockchain Section */}
          <div className="glass-card p-6 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 mb-6">
              <SiBlockchaindotcom className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Blockchain Record</h2>
            </div>

            {hasBlockchain ? (
              <div className="space-y-4">
                {property.blockchainTx && (
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-4">
                    <div>
                      <p className="text-xs text-navy-500">Transaction Hash</p>
                      <p className="mt-1 font-mono text-sm text-navy-200">{property.blockchainTx}</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(property.blockchainTx); toast.info('Hash copied!'); }}
                      className="text-navy-500 hover:text-blue-400 transition-colors"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {property.blockchainPropertyId && (
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-4">
                    <div>
                      <p className="text-xs text-navy-500">On-Chain Property ID</p>
                      <p className="mt-1 font-mono text-sm text-navy-200">{property.blockchainPropertyId}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-4">
                <FiClock className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Pending Blockchain Registration</p>
                  <p className="text-xs text-amber-400/70">This property has not yet been registered on the blockchain.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column (Sidebar) ── */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="glass-card p-6 animate-fade-in-up delay-100 sticky top-24">
            <p className="text-sm text-navy-400">Listed Price</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(property.price)}</p>

            {/* Verification badge */}
            {status === 'verified' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <FiShield className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Verified</p>
                  <p className="text-xs text-emerald-400/70">Property has been verified by a government officer</p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            {isAuthenticated && user?.role === 'buyer' && status === 'verified' && (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-60"
              >
                {purchasing ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiShoppingCart className="h-4 w-4" />
                )}
                {purchasing ? 'Submitting...' : 'Request to Purchase'}
              </button>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
              >
                Sign In to Purchase
              </Link>
            )}

            <p className="mt-3 text-center text-xs text-navy-500">
              Secured by smart contract • Escrow protected
            </p>
          </div>

          {/* Owner Card */}
          <div className="glass-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <FiUser className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Owner Information</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                {ownerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{ownerName}</p>
                {typeof property.owner === 'object' && property.owner.email && (
                  <p className="text-xs text-navy-500">{property.owner.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Survey Info */}
          <div className="glass-card p-6 animate-fade-in-up delay-300">
            <h3 className="mb-3 text-base font-semibold text-white">Survey Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400">Survey No.</span>
                <span className="font-mono text-xs text-navy-200">{property.surveyNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400">District</span>
                <span className="text-navy-200">{property.district || 'N/A'}</span>
              </div>
              {property.currentOwnerWallet && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-400">Owner Wallet</span>
                  <span className="font-mono text-xs text-navy-200">{property.currentOwnerWallet.slice(0, 10)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small info item with icon */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
      <div className="flex items-center gap-1.5 text-navy-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
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
