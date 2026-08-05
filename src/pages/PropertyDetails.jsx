/**
 * Property Details Page
 * Displays full property info, images, owner, status, blockchain timeline, and purchase CTA.
 */
import { useParams, Link } from 'react-router-dom';
import {
  FiMapPin, FiMaximize, FiTag, FiUser, FiCalendar,
  FiFileText, FiShield, FiArrowLeft, FiShoppingCart, FiCopy,
} from 'react-icons/fi';
import { SiBlockchaindotcom } from 'react-icons/si';
import StatusBadge from '../components/StatusBadge';
import { properties } from '../services/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function PropertyDetails() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);

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
            <div
              className="h-72 w-full sm:h-96"
              style={{
                background: `linear-gradient(135deg, ${property.images[0]}DD, ${property.images[1] || property.images[0]}99)`,
              }}
            />
            {/* Thumbnail strip */}
            <div className="flex gap-2 p-3">
              {property.images.map((color, i) => (
                <div
                  key={i}
                  className="h-16 w-20 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:border-blue-500 first:border-blue-500"
                  style={{ background: `linear-gradient(135deg, ${color}CC, ${color}88)` }}
                />
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="glass-card p-6 animate-fade-in-up delay-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">{property.title}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-400">
                  <FiMapPin className="h-4 w-4 text-navy-500" />
                  {property.address}, {property.city}, {property.state}
                </div>
              </div>
              <StatusBadge status={property.status} size="md" />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-navy-300">{property.description}</p>

            {/* Key info grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoItem icon={FiHash} label="Property ID" value={property.id} />
              <InfoItem icon={FiMaximize} label="Area" value={property.area} />
              <InfoItem icon={FiTag} label="Land Type" value={property.landType} />
              <InfoItem icon={FiCalendar} label="Listed" value={formatDate(property.listedDate)} />
            </div>
          </div>

          {/* Documents */}
          <div className="glass-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Documents</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {property.documents.map((doc) => (
                <div key={doc} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5">
                  <FiFileText className="h-4 w-4 text-navy-400" />
                  <span className="text-sm text-navy-200">{doc}</span>
                  <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Verified</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain History Timeline */}
          <div className="glass-card p-6 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 mb-6">
              <SiBlockchaindotcom className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Blockchain History</h2>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-blue-500/40 to-transparent" />

              <div className="space-y-6">
                {property.blockchainHistory.map((entry, idx) => (
                  <div key={idx} className="relative flex gap-4 pl-1">
                    {/* Dot */}
                    <div className={`relative z-10 mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 ${
                      idx === 0 ? 'border-blue-500 bg-blue-500/20' : 'border-navy-600 bg-navy-800'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-blue-400' : 'bg-navy-500'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">{entry.event}</p>
                          <p className="mt-1 text-xs text-navy-500">by {entry.actor}</p>
                        </div>
                        <span className="text-xs text-navy-500">{formatDate(entry.date)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="font-mono text-xs text-navy-600">Tx: {entry.hash}</span>
                        <button className="text-navy-600 hover:text-blue-400 transition-colors" title="Copy hash">
                          <FiCopy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (Sidebar) ── */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="glass-card p-6 animate-fade-in-up delay-100 sticky top-24">
            <p className="text-sm text-navy-400">Listed Price</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(property.price)}</p>

            {/* Verification badge */}
            {property.status === 'verified' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <FiShield className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Blockchain Verified</p>
                  <p className="text-xs text-emerald-400/70">Verified on {formatDate(property.verifiedDate)}</p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110">
              <FiShoppingCart className="h-4 w-4" />
              Request to Purchase
            </button>

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
                {property.owner.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{property.owner}</p>
                <p className="text-xs text-navy-500">ID: {property.ownerId}</p>
              </div>
            </div>
          </div>

          {/* Survey Info */}
          <div className="glass-card p-6 animate-fade-in-up delay-300">
            <h3 className="mb-3 text-base font-semibold text-white">Survey Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400">Survey No.</span>
                <span className="font-mono text-xs text-navy-200">{property.surveyNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400">District</span>
                <span className="text-navy-200">{property.district}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-400">Blockchain Tx</span>
                <span className="font-mono text-xs text-navy-200">{property.blockchainTxHash}</span>
              </div>
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
