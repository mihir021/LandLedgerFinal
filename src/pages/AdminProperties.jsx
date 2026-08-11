/**
 * AdminProperties — property verification management for admin/officer
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Search, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { getProperties, verifyProperty } from '../services/propertyService';
import { useToast } from '../context/ToastContext';
import { deepSearchProperty } from '../utils/searchFilters';

export default function AdminProperties() {
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');
  const [modal, setModal] = useState({ open: false, id: null, action: null, propName: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const params = filter !== 'all' ? { status: filter.charAt(0).toUpperCase() + filter.slice(1), limit: 1000 } : { limit: 1000 };
    getProperties(params)
      .then(res => setProperties(res.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = properties.filter(p => deepSearchProperty(p, search));

  const handleAction = async () => {
    setActionLoading(true);
    try {
      await verifyProperty(modal.id, modal.action === 'approve' ? 'Verified' : 'Rejected');
      toast.success(`Property ${modal.action === 'approve' ? 'verified' : 'rejected'} successfully.`);
      setProperties(prev => prev.filter(p => p._id !== modal.id));
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setModal({ open: false, id: null, action: null, propName: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/admin" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Property Verification</h1>
          <p className="text-gray-500 text-sm">Review and verify property document submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="ll-card p-4 flex flex-wrap gap-3 animate-fade-in-up">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by address, city, property ID..." className="ll-input pl-9" />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {['pending', 'verified', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
        <div className="ll-card overflow-hidden animate-fade-in-up delay-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type / Area</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => {
                const image = p.documents?.[0]?.url;
                return (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
                        {image ? <img src={image.startsWith('http') ? image : `/${image.replace(/\\/g, '/')}`} alt="" className="h-full w-full object-cover" /> : '🏠'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[160px]">{p.location?.district || p.location?.surveyNumber}, {p.location?.city}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.propertyId || p._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-gray-600 text-sm">{p.ownerId?.name || p.ownerId?.fullName || '—'}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="capitalize text-gray-600">{p.landDetails?.landType || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{p.landDetails?.areaSqft?.toLocaleString() || 0} sq ft</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={p.verification?.status || 'Pending'} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link to={`/property/${p._id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-700" title="View Property">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      {(p.verification?.status === 'Pending' || !p.verification?.status) && (
                        <>
                          <button onClick={() => setModal({ open: true, id: p._id, action: 'approve', propName: `${p.location?.district || p.location?.surveyNumber}, ${p.location?.city}` })}
                            className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button onClick={() => setModal({ open: true, id: p._id, action: 'reject', propName: `${p.location?.district || p.location?.surveyNumber}, ${p.location?.city}` })}
                            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No properties found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, id: null, action: null, propName: '' })}
        onConfirm={handleAction}
        loading={actionLoading}
        variant={modal.action === 'approve' ? 'approve' : 'reject'}
        title={modal.action === 'approve' ? 'Approve Property Verification' : 'Reject Property Verification'}
        message={modal.action === 'approve'
          ? 'This property will be marked as government-verified and visible to buyers on the marketplace.'
          : 'This property will be rejected. The seller will need to resubmit with corrected documents.'}
        details={{ 'Property': (modal.propName || '—').slice(0, 45) }}
        confirmLabel={modal.action === 'approve' ? 'Approve Verification' : 'Reject Verification'}
      />
    </div>
  );
}
