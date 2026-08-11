import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  error = '',
  helperText = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Select trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : error
            ? 'bg-red-50/50 border-red-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20'
            : isOpen
            ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 text-gray-900 shadow-sm'
            : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400 shadow-sm'
        }`}
      >
        <span className={`truncate ${!value ? 'text-gray-400 font-normal' : 'font-semibold text-gray-900'}`}>
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
        </div>
      </button>

      {/* Helper text / Error message */}
      {error ? (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden animate-fade-in">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search options..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-900"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-center text-gray-400">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
