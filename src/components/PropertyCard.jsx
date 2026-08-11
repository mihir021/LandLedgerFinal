/**
 * PropertyCard — light-theme card for property listings
 * Shows thumbnail, address, type badge, price, lifecycle pill, and verification.
 */
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Tag, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerificationBadge from './VerificationBadge';

const TYPE_COLORS = {
  residential: 'bg-blue-50 text-blue-700',
  commercial:  'bg-purple-50 text-purple-700',
  agricultural:'bg-green-50 text-green-700',
  industrial:  'bg-orange-50 text-orange-700',
  mixed:       'bg-teal-50 text-teal-700',
};

function formatINR(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function PropertyCard({ property, delay = 0 }) {
  const {
    _id, id, propertyId, title, address, city, state,
    landType, type, price, area,
    status,
    images = [],
  } = property;

  const propId = _id || id;
  const propType = landType || type || 'residential';
  const propStatus = status || 'draft';
  const propTitle = title || `${propType.charAt(0).toUpperCase() + propType.slice(1)} Property — ${city}`;
  let imgSrc = null;
  if (images[0]) {
    if (images[0].startsWith('http')) {
      imgSrc = images[0];
    } else if (images[0].startsWith('uploads/') || images[0].startsWith('uploads\\')) {
      imgSrc = `/${images[0].replace(/\\/g, '/')}`;
    } else if (!images[0].startsWith('#')) {
      imgSrc = `/uploads/images/${images[0].replace(/\\/g, '/')}`;
    }
  }

  return (
    <Link
      to={`/property/${propId}`}
      className="ll-card ll-card-hover block animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
        {imgSrc ? (
          <img src={imgSrc} alt={propTitle} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl">🏡</div>
          </div>
        )}
        {/* Type badge overlay */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[propType] || TYPE_COLORS.residential}`}>
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
          <VerificationBadge status={propStatus === 'verified' || propStatus === 'listed' || propStatus === 'completed' ? 'verified' : propStatus === 'rejected' ? 'rejected' : 'pending'} size="sm" showLabel={false} />
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-800 hover:text-blue-900">
            View Details <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
