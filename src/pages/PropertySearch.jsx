/**
 * Property Search Page
 * Search bar, filter panel, and property card grid.
 * Fetches properties from the backend API.
 */
import { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiX, FiLoader } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';

/** Static filter options (matching backend enum values) */
const states = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Delhi', 'Telangana'];
const cities = ['Pune', 'Bangalore', 'Greater Noida', 'Chennai', 'Jaipur', 'Ahmedabad', 'Mumbai', 'Hyderabad'];
const landTypes = ['residential', 'commercial', 'agricultural', 'industrial', 'mixed'];
const landTypeLabels = { residential: 'Residential', commercial: 'Commercial', agricultural: 'Agricultural', industrial: 'Industrial', mixed: 'Mixed' };
const priceRanges = [
  { label: 'Under ₹50 Lakh', min: 0, max: 5000000 },
  { label: '₹50 Lakh – ₹1 Cr', min: 5000000, max: 10000000 },
  { label: '₹1 Cr – ₹3 Cr', min: 10000000, max: 30000000 },
  { label: 'Above ₹3 Cr', min: 30000000, max: Infinity },
];

export default function PropertySearch() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ state: '', city: '', landType: '', priceRange: '' });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Fetch properties from backend */
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query params for backend-supported filters
        const params = { limit: 100 };
        if (filters.state) params.state = filters.state;
        if (filters.city) params.city = filters.city;
        if (filters.landType) params.landType = filters.landType;

        const result = await getProperties(params);
        setProperties(result.properties || []);
      } catch (err) {
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters.state, filters.city, filters.landType]);

  /** Client-side text search and price range filter */
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Text search (client-side)
      const q = query.toLowerCase();
      const title = p.title || `${p.landType || ''} ${p.city || ''}`;
      const matchesQuery =
        !query ||
        title.toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.state || '').toLowerCase().includes(q) ||
        (p.propertyId || '').toLowerCase().includes(q) ||
        (p.landType || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q);

      // Price range filter (client-side)
      let matchesPrice = true;
      if (filters.priceRange) {
        const range = priceRanges.find((r) => r.label === filters.priceRange);
        if (range) {
          matchesPrice = p.price >= range.min && p.price < range.max;
        }
      }

      return matchesQuery && matchesPrice;
    });
  }, [query, properties, filters.priceRange]);

  /** Clear all filters */
  const clearFilters = () => {
    setFilters({ state: '', city: '', landType: '', priceRange: '' });
    setQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Search Properties</h1>
        <p className="mt-1 text-sm text-navy-400">
          Browse {loading ? '...' : properties.length} blockchain-registered properties
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row animate-fade-in-up delay-100">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name, city, state, ID..."
          className="flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
            showFilters || activeFilterCount
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
              : 'border-white/10 bg-white/5 text-navy-300 hover:bg-white/10'
          }`}
        >
          <FiFilter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 glass-card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Filter By</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-navy-400 hover:text-red-400 transition-colors"
              >
              <FiX className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="State"
              value={filters.state}
              options={states}
              onChange={(v) => setFilters({ ...filters, state: v })}
            />
            <FilterSelect
              label="City"
              value={filters.city}
              options={cities}
              onChange={(v) => setFilters({ ...filters, city: v })}
            />
            <FilterSelect
              label="Land Type"
              value={filters.landType}
              options={landTypes}
              labels={landTypeLabels}
              onChange={(v) => setFilters({ ...filters, landType: v })}
            />
            <FilterSelect
              label="Price Range"
              value={filters.priceRange}
              options={priceRanges.map((r) => r.label)}
              onChange={(v) => setFilters({ ...filters, priceRange: v })}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <FiLoader className="h-10 w-10 text-blue-400 animate-spin mb-4" />
          <p className="text-sm text-navy-400">Loading properties...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 mb-4">
            <FiX className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Failed to Load Properties</h3>
          <p className="mt-2 text-sm text-navy-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results Count */}
          <p className="mb-6 text-sm text-navy-400">
            Showing <span className="font-semibold text-white">{filtered.length}</span> properties
          </p>

          {/* Property Grid */}
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property, idx) => (
                <PropertyCard key={property._id || property.id} property={property} delay={idx * 80} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 mb-4">
                <FiFilter className="h-8 w-8 text-navy-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">No Properties Found</h3>
              <p className="mt-2 text-sm text-navy-400">Try adjusting your search or filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Filter select dropdown */
function FilterSelect({ label, value, options, labels, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-navy-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="" className="bg-navy-800">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-navy-800">
            {labels ? (labels[opt] || opt) : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
