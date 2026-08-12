import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerificationBadge from './VerificationBadge';
import { getImgUrl } from '../utils/helpers';

const TYPE_COLORS = {
  residential: 'bg-blue-50 text-blue-700',
  commercial:  'bg-purple-50 text-purple-700',
  agricultural:'bg-green-50 text-green-700',
  industrial:  'bg-orange-50 text-orange-700',
  mixed:       'bg-teal-50 text-teal-700',
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

  // Prioritize property.images array, fallback to documents or high-res default
  const rawImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.documents?.map(d => typeof d === 'object' ? (d?.url || null) : d).filter(Boolean) || []);

  let imgSrc = getImgUrl(rawImages[0]) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

  return (
    <Link
      to={`/property/${propId}`}
      className="ll-card ll-card-hover block animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={propTitle}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        {/* Type badge overlay */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[propTypeKey]}`}>
            {propType}
          </span>
        </div>
        {/* Status pill overlay */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={propStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif font-semibold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{propTitle}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{address}, {city}, {state}</span>
        </div>

        <hr className="ll-divider mb-3" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          <div>
            <p className="text-gray-400 text-xs">Price</p>
            <p className="font-bold text-gray-900 font-serif">{formatINR(price)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Area</p>
            <p className="font-semibold text-gray-700">{area?.toLocaleString()} sq ft</p>
          </div>
          {propertyId && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs">Property ID</p>
              <p className="mono-data text-gray-600">{propertyId}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <VerificationBadge status={propStatus === 'Verified' || propStatus === 'verified' || propStatus === 'listed' || propStatus === 'completed' ? 'verified' : propStatus === 'Rejected' || propStatus === 'rejected' ? 'rejected' : 'pending'} size="sm" showLabel={false} />
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-800 hover:text-blue-900">
            View Details <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
