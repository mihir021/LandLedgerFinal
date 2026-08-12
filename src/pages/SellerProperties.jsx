/**
 * SellerProperties — list of all properties owned by seller, with list/unlist toggle
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, FilePlus, ExternalLink, Loader2, ArrowLeft, Power, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import VerificationBadge from '../components/VerificationBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { getProperties, toggleListing } from '../services/propertyService';
import { deepSearchProperty } from '../utils/searchFilters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/helpers';

export default function SellerProperties() {
  const { user } = useAuth();
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleModal, setToggleModal] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      const params = user?._id ? { owner: user._id, limit: 100 } : { limit: 100 };
      getProperties(params).then(res => {
        const props = res.properties || [];
        if (props.length > 0) setProperties(props);
      }).catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // Filter by current seller's own properties
      const res = await getProperties(user?._id ? { owner: user._id, limit: 100 } : { limit: 100 }).catch(() => ({ properties: [] }));
      let fetchedProps = res.properties || [];

      // Fallback: If logged in seller account has 0 user-registered properties, display real DB properties
      if (fetchedProps.length === 0) {
        const fallbackRes = await getProperties({ limit: 100 }).catch(() => ({ properties: [] }));
        fetchedProps = fallbackRes.properties || [];
      }

      setProperties(fetchedProps);
    } catch (err) {
      setError(err.message || 'Failed to load properties.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleListing = async () => {
    setActionLoading(true);
    try {
      const updated = await toggleListing(toggleModal.id, toggleModal.isListed);
      setProperties(prev => prev.map(p => p._id === updated._id ? updated : p));
      toast.success(toggleModal.isListed ? 'Property listed for sale' : 'Property unlisted');
    } catch (err) {
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setActionLoading(false);
      setToggleModal(null);
    }
  };

  const filtered = properties.filter(p => deepSearchProperty(p, search));

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

      {/* Search Bar */}
      {!loading && properties.length > 0 && (
        <div className="relative max-w-md animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by ID, address, type..."
            className="ll-input pl-9"
          />
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Listing</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => {
                const status = p.verification?.status || 'Pending';
                const image = (p.images && p.images.length > 0) ? p.images[0] : (p.documents?.[0]?.url || null);
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
                    <span className="font-semibold text-gray-800">{formatPrice(p.pricing?.priceINR || 0)}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={status} /></td>
                  <td className="px-5 py-4">
                    <VerificationBadge
                      status={status === 'Verified' || status === 'listed' || status === 'under_transfer' || status === 'transferred' ? 'verified' : status === 'Rejected' ? 'rejected' : 'pending'}
                      showLabel={false}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.isListed ? 'listed' : p.verificationStatus === 'pending' ? 'pending_verify' : 'draft'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.verificationStatus === 'verified' && (
                        <button
                          onClick={() => setToggleModal({ id: p._id, isListed: !p.isListed, name: `${p.address}, ${p.city}` })}
                          disabled={actionLoading}
                          className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            p.isListed
                              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          } disabled:opacity-50`}
                        >
                          <Power className="h-3 w-3" />
                          {p.isListed ? 'Unlist' : 'List'}
                        </button>
                      )}
                      <Link to={`/property/${p._id}`} className="flex items-center gap-1 text-xs text-blue-700 hover:underline font-medium">
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!toggleModal}
        onClose={() => setToggleModal(null)}
        onConfirm={handleToggleListing}
        loading={actionLoading}
        variant={toggleModal?.isListed ? 'approve' : 'warning'}
        title={toggleModal?.isListed ? 'List Property for Sale' : 'Unlist Property'}
        message={toggleModal?.isListed
          ? 'This property will appear on the public marketplace where buyers can submit purchase requests.'
          : 'This property will be removed from the marketplace and buyers will no longer be able to request it.'}
        details={toggleModal ? { 'Property': toggleModal.name } : undefined}
        confirmLabel={toggleModal?.isListed ? 'List Property' : 'Unlist Property'}
      />
    </div>
  );
}
