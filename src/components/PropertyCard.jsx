import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerificationBadge from './VerificationBadge';
import { getImgUrl } from '../utils/helpers';

const TYPE_COLORS = {
  residential: 'bg-blue-600 text-white',
  commercial:  'bg-purple-600 text-white',
  agricultural:'bg-emerald-600 text-white',
  industrial:  'bg-amber-600 text-white',
  mixed:       'bg-teal-600 text-white',
};

function formatINR(amount) {
  if (amount == null) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function PropertyCard({ property, delay = 0 }) {
  const propId = property._id || property.id;
  const propertyId = property.propertyId;
  const propType = property.landDetails?.landType || property.landType || property.type || 'residential';
  const propTitle = property.title || `${propType.split(' ')[0]} Property — ${property.location?.city || 'Unknown'}`;
  
  const address = property.location?.district || property.location?.surveyNumber || property.address || 'Unknown Address';
  const city = property.location?.city || property.city || 'Unknown City';
  const state = property.location?.state || property.state || 'Unknown State';
  const price = property.pricing?.priceINR || property.price || 0;
  const area = property.landDetails?.areaSqft || property.area || 0;
  const propStatus = property.verification?.status || property.status || 'Pending';

  const getPropTypeKey = (typeStr) => {
    const lower = typeStr.toLowerCase();
    if (lower.includes('residential')) return 'residential';
    if (lower.includes('commercial')) return 'commercial';
    if (lower.includes('agricultural')) return 'agricultural';
    if (lower.includes('industrial')) return 'industrial';
    if (lower.includes('mixed')) return 'mixed';
    return 'residential';
  };
  const propTypeKey = getPropTypeKey(propType);

  const rawImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.documents?.map(d => typeof d === 'object' ? (d?.url || null) : d).filter(Boolean) || []);

  let imgSrc = getImgUrl(rawImages[0]) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

  return (
    <Link
      to={`/property/${propId}`}
      className="group relative block rounded-sm bg-white border-2 border-slate-300 shadow-[4px_4px_0px_#94A3B8] hover:translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#64748B] active:translate-x-[4px] active:translate-y-[0px] active:shadow-[2px_2px_0px_#94A3B8] transition-all duration-200 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Mecabricks Top Stud Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 flex items-center justify-around px-2">
        <div className="h-1 w-2 rounded-full bg-white/40" />
        <div className="h-1 w-2 rounded-full bg-white/40" />
        <div className="h-1 w-2 rounded-full bg-white/40" />
        <div className="h-1 w-2 rounded-full bg-white/40" />
      </div>

      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-slate-900">
        <img
          src={imgSrc}
          alt={propTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        
        {/* Mecabricks-style LEGO Stud Icon Badge (Top Left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-sm bg-[#0A1628] px-2 py-1 border border-amber-400/60 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-white/60 shadow-inner" />
          <span className="font-pixel text-[10px] font-bold text-amber-400 uppercase tracking-wide">
            {propType}
          </span>
        </div>

        {/* Status pill overlay (Top Right) */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={propStatus} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 bg-white">
        <h3 className="font-serif font-bold text-[#0A1628] text-base leading-snug mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
          {propTitle}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3 font-medium">
          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{address}, {city}, {state}</span>
        </div>

        <div className="border-t border-gray-200/80 my-3" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
          <div>
            <p className="text-gray-400 font-pixel text-[10px] uppercase">Price</p>
            <p className="font-bold text-[#0A1628] font-pixel text-sm text-amber-600">{formatINR(price)}</p>
          </div>
          <div>
            <p className="text-gray-400 font-pixel text-[10px] uppercase">Total Area</p>
            <p className="font-semibold text-gray-800 font-pixel text-xs">{area?.toLocaleString()} SQ FT</p>
          </div>
          {propertyId && (
            <div className="col-span-2">
              <p className="text-gray-400 font-pixel text-[10px] uppercase">Deed / Parcel ID</p>
              <p className="mono-data text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200 inline-block">{propertyId}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <VerificationBadge status={propStatus === 'Verified' || propStatus === 'verified' || propStatus === 'listed' || propStatus === 'completed' ? 'verified' : propStatus === 'Rejected' || propStatus === 'rejected' ? 'rejected' : 'pending'} size="sm" showLabel={false} />
          <span className="flex items-center gap-1 font-pixel text-xs font-bold text-[#0A1628] group-hover:text-amber-600 transition-colors uppercase">
            Details <ArrowRight className="h-3.5 w-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
