/**
 * Property Search Page
 * Search bar, filter panel, and property card grid.
 */
import { useState, useMemo } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { properties, states, cities, landTypes, priceRanges } from '../services/mockData';

export default function PropertySearch() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ state: '', city: '', landType: '', priceRange: '' });

  /** Filter and search properties */
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Text search
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.landType.toLowerCase().includes(q);

      // Filter by state
      const matchesState = !filters.state || p.state === filters.state;

      // Filter by city
      const matchesCity = !filters.city || p.city === filters.city;

      // Filter by land type
      const matchesLandType = !filters.landType || p.landType === filters.landType;

      // Filter by price range
      let matchesPrice = true;
      if (filters.priceRange) {
        const range = priceRanges.find((r) => r.label === filters.priceRange);
        if (range) {
          matchesPrice = p.price >= range.min && p.price < range.max;
        }
      }

      return matchesQuery && matchesState && matchesCity && matchesLandType && matchesPrice;
    });
  }, [query, filters]);

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
          Browse {properties.length} blockchain-registered properties
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

      {/* Results Count */}
      <p className="mb-6 text-sm text-navy-400">
        Showing <span className="font-semibold text-white">{filtered.length}</span> properties
      </p>

      {/* Property Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property, idx) => (
            <PropertyCard key={property.id} property={property} delay={idx * 80} />
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
    </div>
  );
}

/** Filter select dropdown */
function FilterSelect({ label, value, options, onChange }) {
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
          <option key={opt} value={opt} className="bg-navy-800">{opt}</option>
        ))}
      </select>
    </div>
  );
}
