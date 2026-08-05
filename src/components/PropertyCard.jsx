/**
 * PropertyCard Component
 * Card component for displaying a property listing in search results and dashboards.
 */
import { Link } from 'react-router-dom';
import { FiMapPin, FiMaximize, FiTag } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import { formatCurrency, truncateText } from '../utils/helpers';

export default function PropertyCard({ property, delay = 0 }) {
  const { id, title, address, city, state, area, landType, price, status, images } = property;

  return (
    <Link
      to={`/property/${id}`}
      className="glass-card group block overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-glass-hover animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Image Placeholder ── */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${images?.[0] || '#3b82f6'}DD, ${images?.[1] || '#6366f1'}99)`,
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </div>
        {/* Land type chip */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            <FiTag className="h-3 w-3" />
            {landType}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-white transition-colors group-hover:text-blue-400">
          {truncateText(title, 40)}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-400">
          <FiMapPin className="h-3.5 w-3.5 shrink-0 text-navy-500" />
          <span className="truncate">{city}, {state}</span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-navy-400">
          <span className="flex items-center gap-1">
            <FiMaximize className="h-3 w-3" /> {area}
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <p className="text-lg font-bold text-white">{formatCurrency(price)}</p>
          <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 transition-colors group-hover:bg-blue-500/20">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
