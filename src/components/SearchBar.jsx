/**
 * SearchBar Component
 * Reusable search input with icon and optional placeholder.
 */
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Search properties...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-navy-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
