/**
 * SellerProperties — list of all properties owned by seller
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, FilePlus, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import VerificationBadge from '../components/VerificationBadge';
import { getProperties } from '../services/propertyService';

export default function SellerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getProperties({ limit: 1000 })
      .then(res => setProperties(res.properties || []))
      .catch(err => setError(err.message || 'Failed to load properties.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to="/seller" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500 text-sm mt-0.5">{properties.length} properties registered</p>
          </div>
        </div>
        <Link to="/register-property" className="btn-primary text-sm">
          <FilePlus className="h-4 w-4" />
          Register New
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : properties.length === 0 ? (
        <div className="ll-card p-14 text-center">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">No properties yet</h3>
          <p className="text-gray-500 text-sm mb-6">Register your first property to get started.</p>
          <Link to="/register-property" className="btn-primary">Register Property</Link>
        </div>
      ) : (
        <div className="ll-card overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Price</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((p, i) => {
                const status = p.verification?.status || 'Pending';
                const image = p.documents?.[0]?.url || null;
                const getImgUrl = (img) => {
                  if (!img) return null;
                  if (img.startsWith('http')) return img;
                  if (img.startsWith('uploads/') || img.startsWith('uploads\\')) return `/${img.replace(/\\/g, '/')}`;
                  return `/uploads/images/${img.replace(/\\/g, '/')}`;
                };

                return (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
                        {image ? <img src={getImgUrl(image)} alt="" className="h-full w-full object-cover" /> : '🏠'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.location?.district || p.location?.surveyNumber}, {p.location?.city}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.propertyId || p._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell capitalize text-gray-600">{p.landDetails?.landType || 'Unknown'}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="font-semibold text-gray-800">₹{((p.pricing?.priceINR || 0)/100000).toFixed(1)}L</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={status} /></td>
                  <td className="px-5 py-4">
                    <VerificationBadge
                      status={status === 'Verified' || status === 'listed' || status === 'under_transfer' || status === 'transferred' ? 'verified' : status === 'Rejected' ? 'rejected' : 'pending'}
                      showLabel={false}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/property/${p._id}`} className="flex items-center gap-1 text-xs text-blue-700 hover:underline font-medium">
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
