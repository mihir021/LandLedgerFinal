/**
 * BuyerProperties — properties owned by the logged-in buyer
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Loader2, ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getProperties } from '../services/propertyService';
import { formatPrice, getImgUrl } from '../utils/helpers';

export default function BuyerProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        // Fetch properties where the buyer is the current owner
        const res = await getProperties({ owner: user?._id || user?.id, limit: 200 });
        setProperties(res.properties || []);
      } catch (err) {
        setError(err.message || 'Failed to load your properties.');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id || user?.id) load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/buyer" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm mt-0.5">Properties you currently own</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-800 animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="ll-card p-12 text-center">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">No properties owned yet</h3>
          <p className="text-gray-500 text-sm mb-6">Purchase a property and it will appear here once the transfer is complete.</p>
          <Link to="/search" className="btn-primary text-sm">Search Properties</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop, i) => {
            const imgSrc = getImgUrl(prop.images?.[0] || prop.documents?.[0]);
            const location = [prop.location?.city, prop.location?.district, prop.location?.state]
              .filter(Boolean).join(', ');
            const status = prop.verification?.status || prop.verificationStatus || 'Pending';
            const price = prop.pricing?.priceINR || prop.price || 0;
            const area = prop.landDetails?.areaSqft || prop.area || 0;
            const landType = prop.landDetails?.landType || prop.landType || 'Property';

            return (
              <div
                key={prop._id || prop.id}
                className="ll-card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Property image */}
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {imgSrc
                      ? <img src={imgSrc} className="h-full w-full object-cover" alt="" />
                      : '🏠'
                    }
                  </div>

                  {/* Property info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {landType} — {prop.location?.city || 'Unknown'}
                      </p>
                      <StatusBadge status={status} />
                    </div>
                    {location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-mono">{prop.propertyId}</span>
                      {area > 0 && <span>• {area.toLocaleString()} sq ft</span>}
                      {price > 0 && <span>• {formatPrice(price)}</span>}
                    </div>
                  </div>

                  {/* View button */}
                  <Link
                    to={`/property/${prop._id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all shrink-0"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
