/**
 * PropertySearch — Modern LEGO-styled search hub inspired by clean job search UI.
 * Features gray box borders, persistent left filter sidebar, and LEGO property cards.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, X, SlidersHorizontal, ArrowRight, ShieldCheck, Filter, ChevronDown, Check, Building } from 'lucide-react';
import { getProperties } from '../services/propertyService';
import { filterProperties } from '../utils/searchFilters';
import StatusBadge from '../components/StatusBadge';
import VerificationBadge from '../components/VerificationBadge';
import { getImgUrl } from '../utils/helpers';

const TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'agricultural', label: 'Agricultural' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'mixed', label: 'Mixed Use' },
];

const STATES = ['All States', 'Karnataka', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Delhi', 'Rajasthan'];

function formatINR(amount) {
  if (amount == null) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function PropertySearch() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [state, setState] = useState('All States');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const params = { limit: 2000 };
        const res = await getProperties(params);
        setProperties(res.properties || []);
      } catch (err) {
        setError(err.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filterProperties(properties, { search, type, state, minPrice, maxPrice, status });

  // Sorting
  const sortedProperties = [...filtered].sort((a, b) => {
    const priceA = a.pricing?.priceINR || a.price || 0;
    const priceB = b.pricing?.priceINR || b.price || 0;
    const areaA = a.landDetails?.areaSqft || a.area || 0;
    const areaB = b.landDetails?.areaSqft || b.area || 0;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'area-high') return areaB - areaA;
    return 0; // default newest
  });

  const clearFilters = () => {
    setSearch(''); setType('all'); setState('All States');
    setMinPrice(''); setMaxPrice(''); setStatus('all');
  };

  const hasActiveFilters = type !== 'all' || state !== 'All States' || minPrice || maxPrice || status !== 'all' || search !== '';

  return (
    <div className="relative min-h-screen">
      
      {/* ── Main Foreground Content Container (z-10) ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6">

        {/* ========================================================================= */}
        {/* 1. HERO BANNER CARD (White Div with Gray Border & Gray Tactile Shadow)     */}
        {/* ========================================================================= */}
        <div className="relative rounded-2xl bg-white border-2 border-slate-300 shadow-[5px_5px_0px_#94A3B8] p-6 sm:p-10 mb-8 overflow-hidden text-[#0A1628]">
          
          {/* Subtle LEGO stud dot overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#0A1628_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

          {/* Hero Text Content */}
          <div className="relative z-10 max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 rounded-sm bg-[#0A1628] px-2.5 py-1 font-pixel text-[10px] font-bold text-amber-400 border border-slate-300 mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>OFFICIAL LAND REGISTRY HUB</span>
            </div>

            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl font-black text-[#0A1628] tracking-wider leading-tight mb-3 uppercase">
              Land Registry Properties
            </h1>
            <p className="font-pixel text-xs sm:text-sm text-gray-600 font-medium leading-relaxed uppercase">
              Discover verified land deeds, titles, and property records across top registry sectors in India.
            </p>
          </div>

          {/* Embedded Search Pill Box (White floating card with Gray Border) */}
          <div className="relative z-20 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-300 shadow-[4px_4px_0px_#CBD5E1] p-2 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Left: Query Search Input */}
            <div className="relative z-30 flex items-center gap-2 flex-1 w-full px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="h-5 w-5 text-amber-600 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, city, district, deed ID..."
                className="w-full text-xs sm:text-sm font-pixel font-bold text-[#0A1628] placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Center: State / Location Picker */}
            <div className="relative z-30 flex items-center gap-2 flex-1 w-full px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-200">
              <MapPin className="h-5 w-5 text-blue-700 shrink-0" />
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full text-xs sm:text-sm font-pixel font-bold text-[#0A1628] bg-transparent focus:outline-none cursor-pointer"
              >
                {STATES.map(s => <option key={s} value={s}>{s === 'All States' ? 'All Locations' : s}</option>)}
              </select>
            </div>

            {/* Right Actions: Clear & Find Button */}
            <div className="relative z-30 flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="font-pixel text-xs font-bold text-gray-600 hover:text-red-600 px-3 py-2 uppercase cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {}}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#0A1628] hover:bg-amber-500 hover:text-[#0A1628] text-amber-400 px-6 py-3 font-pixel text-xs font-bold uppercase tracking-wider border-2 border-[#0A1628] shadow-[2px_2px_0px_#94A3B8] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <span>Find Properties</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>


        {/* ========================================================================= */}
        {/* 2. TWO-COLUMN MAIN CONTENT: LEFT SIDEBAR FILTERS + RIGHT RESULTS           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ----------------------------------------------------------------------- */}
          {/* LEFT SIDEBAR: FILTERS PANEL (Gray Border & Gray Shadow)                 */}
          {/* ----------------------------------------------------------------------- */}
          <aside className="lg:col-span-3 bg-white rounded-xl border-2 border-slate-300 shadow-[4px_4px_0px_#94A3B8] p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-600" />
                <h3 className="font-pixel text-xs font-bold uppercase text-[#0A1628]">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="font-pixel text-[10px] text-red-600 hover:underline font-bold uppercase cursor-pointer">
                  Reset All
                </button>
              )}
            </div>

            {/* Filter 1: Property Type */}
            <div>
              <label className="font-pixel text-xs font-bold uppercase text-gray-700 mb-2 block">
                Property Type
              </label>
              <div className="space-y-1.5">
                {TYPES.map(t => {
                  const isSelected = type === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-pixel font-bold uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0A1628] text-amber-400 border border-slate-300 shadow-[2px_2px_0px_#94A3B8]'
                          : 'text-gray-600 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: State / Region */}
            <div>
              <label className="font-pixel text-xs font-bold uppercase text-gray-700 mb-2 block">
                State / Region
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs font-pixel font-bold text-[#0A1628] focus:bg-white cursor-pointer"
              >
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Filter 3: Price Range (₹ Lakhs) */}
            <div>
              <label className="font-pixel text-xs font-bold uppercase text-gray-700 mb-2 block">
                Price Range (₹ Lakhs)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="Min ₹"
                  className="w-full rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs font-pixel font-bold text-[#0A1628] focus:bg-white"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Max ₹"
                  className="w-full rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs font-pixel font-bold text-[#0A1628] focus:bg-white"
                />
              </div>
            </div>

            {/* Filter 4: Verification Status */}
            <div>
              <label className="font-pixel text-xs font-bold uppercase text-gray-700 mb-2 block">
                Verification Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'verified'].map(st => {
                  const isSelected = status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setStatus(st)}
                      className={`rounded-lg px-2.5 py-1.5 font-pixel text-[11px] font-bold uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-[#0A1628] border-2 border-slate-300 shadow-[2px_2px_0px_#94A3B8]'
                          : 'bg-slate-100 text-gray-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' ? 'All Status' : 'Verified Only'}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>


          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: RESULTS COUNT & PROPERTY CARDS LIST                        */}
          {/* ----------------------------------------------------------------------- */}
          <main className="lg:col-span-9 space-y-4">

            {/* Results Header Bar (Count + Sort) with Gray Border */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border-2 border-slate-300 shadow-[3px_3px_0px_#CBD5E1] px-4 py-3">
              <div className="text-xs sm:text-sm font-pixel font-bold text-[#0A1628] uppercase">
                <span className="font-bold text-amber-600 text-base mr-1.5">{sortedProperties.length}</span>
                <span>current <strong className="text-[#0A1628]">Land Property</strong> positions active</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-pixel uppercase text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-pixel font-bold text-[#0A1628] cursor-pointer"
                >
                  <option value="newest">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="area-high">Area: Largest First</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-600 p-4 text-xs font-pixel font-bold text-red-600 shadow-[3px_3px_0px_#94A3B8]">
                {error}
              </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-slate-300 shadow-[4px_4px_0px_#94A3B8]">
                <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="font-pixel text-xs font-bold text-[#0A1628] uppercase tracking-wider">Loading Property Records...</p>
              </div>
            ) : sortedProperties.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-xl border-2 border-slate-300 shadow-[4px_4px_0px_#94A3B8]">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-pixel text-base font-bold text-[#0A1628] uppercase mb-1">No Matching Properties Found</h3>
                <p className="text-xs text-gray-500 mb-4 font-pixel uppercase font-medium">Try broadening your search term or resetting your active filters.</p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-[#0A1628] px-5 py-2.5 font-pixel text-xs font-bold text-amber-400 uppercase border-2 border-slate-300 shadow-[3px_3px_0px_#94A3B8] hover:bg-amber-500 hover:text-[#0A1628] transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Result Cards List with Gray Borders */
              <div className="space-y-4">
                {sortedProperties.map((p) => (
                  <SearchResultListItem key={p._id || p.id} property={p} />
                ))}
              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  );
}

/**
 * SearchResultListItem — Horizontal LEGO Card with Gray Border and Gray Shadow
 */
function SearchResultListItem({ property }) {
  const propId = property._id || property.id;
  const propertyId = property.propertyId;
  const propType = property.landDetails?.landType || property.landType || property.type || 'residential';
  const propTitle = property.title || `${propType.charAt(0).toUpperCase() + propType.slice(1)} Property — ${property.location?.city || 'Unknown'}`;
  
  const address = property.location?.district || property.location?.surveyNumber || property.address || 'Unknown Address';
  const city = property.location?.city || property.city || 'Unknown City';
  const state = property.location?.state || property.state || 'Unknown State';
  const price = property.pricing?.priceINR || property.price || 0;
  const area = property.landDetails?.areaSqft || property.area || 0;
  const propStatus = property.verification?.status || property.status || 'Pending';

  const rawImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.documents?.map(d => typeof d === 'object' ? (d?.url || null) : d).filter(Boolean) || []);

  let imgSrc = getImgUrl(rawImages[0]) || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

  return (
    <Link
      to={`/property/${propId}`}
      className="group block rounded-xl bg-white border-2 border-slate-300 shadow-[4px_4px_0px_#94A3B8] hover:translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#64748B] active:translate-x-[4px] active:translate-y-[0px] active:shadow-[2px_2px_0px_#94A3B8] transition-all p-5 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side: Thumbnail + Title & Metadata */}
        <div className="flex items-start gap-4 flex-1">
          {/* Image Thumbnail with Status Badge */}
          <div className="relative h-20 w-24 sm:h-24 sm:w-28 rounded-lg overflow-hidden bg-slate-900 border-2 border-slate-300 shrink-0">
            <img
              src={imgSrc}
              alt={propTitle}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-1 left-1">
              <StatusBadge status={propStatus} />
            </div>
          </div>

          {/* Title & Metadata Pills */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 uppercase">
                {propType}
              </span>
              {propertyId && (
                <span className="font-mono text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  ID: {propertyId}
                </span>
              )}
            </div>

            <h3 className="font-pixel font-bold text-[#0A1628] text-sm sm:text-base leading-snug group-hover:text-amber-600 transition-colors uppercase mb-1.5">
              {propTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 font-pixel text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                {city}, {state}
              </span>
              <span>•</span>
              <span>{area?.toLocaleString()} SQ FT</span>
              <span>•</span>
              <span className="capitalize">{address}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Price & View Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 gap-2">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-pixel uppercase text-gray-400">Total Price</p>
            <p className="font-pixel font-bold text-[#0A1628] text-base sm:text-lg text-amber-600">
              {formatINR(price)}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#0A1628] group-hover:bg-amber-500 group-hover:text-[#0A1628] text-amber-400 px-4 py-2 font-pixel text-xs font-bold uppercase transition-colors">
            <span>View</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </Link>
  );
}
