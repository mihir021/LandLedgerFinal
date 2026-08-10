/**
 * PropertySearch — filter sidebar + property grid
 */
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';
import { MOCK_PROPERTIES } from '../data/mock';

const TYPES = ['all', 'residential', 'commercial', 'agricultural', 'industrial', 'mixed'];
const STATES = ['All States', 'Karnataka', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Delhi', 'Rajasthan'];

export default function PropertySearch() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [state, setState] = useState('All States');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (type !== 'all') params.landType = type;
        if (status !== 'all') params.verificationStatus = status;
        const res = await getProperties(params);
        setProperties(res.properties || []);
      } catch {
        setProperties(MOCK_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, status]);

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (p.city || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.state || '').toLowerCase().includes(q) ||
      (p.district || '').toLowerCase().includes(q);

    const matchState = state === 'All States' || (p.state || '').toLowerCase() === state.toLowerCase();

    const price = p.price || 0;
    const matchMin = !minPrice || price >= Number(minPrice) * 100000;
    const matchMax = !maxPrice || price <= Number(maxPrice) * 100000;

    return matchSearch && matchState && matchMin && matchMax;
  });

  const clearFilters = () => {
    setSearch(''); setType('all'); setState('All States');
    setMinPrice(''); setMaxPrice(''); setStatus('all');
  };

  const hasActiveFilters = type !== 'all' || state !== 'All States' || minPrice || maxPrice || status !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Search Properties</h1>
        <p className="text-gray-500 mt-1">Browse verified land records with full blockchain audit trails</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by city, address, property type..."
            className="ll-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'border-blue-800 bg-blue-50 text-blue-900'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-blue-800" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="ll-card p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Filter Properties</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="ll-label">Property Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="ll-select">
                {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="ll-label">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="ll-select">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="ll-label">Min Price (₹L)</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="e.g. 10" className="ll-input" />
            </div>
            <div>
              <label className="ll-label">Max Price (₹L)</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="e.g. 200" className="ll-input" />
            </div>
            <div>
              <label className="ll-label">Verification Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="ll-select">
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          {loading ? 'Loading...' : `${filtered.length} propert${filtered.length !== 1 ? 'ies' : 'y'} found`}
        </div>
        <select className="ll-select w-auto text-xs">
          <option>Sort: Newest First</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Area: Largest First</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-800 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-secondary text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => <PropertyCard key={p._id || p.id} property={p} delay={i * 60} />)}
        </div>
      )}
    </div>
  );
}
