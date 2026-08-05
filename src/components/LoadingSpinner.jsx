/**
 * LoadingSpinner Component
 * Animated loading indicator with optional label.
 */
export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size] || sizeClasses.md}`}
        style={{ borderStyle: 'solid' }}
      />
      {label && <p className="text-sm text-navy-400">{label}</p>}
    </div>
  );
}
