/**
 * StatusBadge Component
 * Displays a color-coded status indicator with a pulsing dot.
 */
import { getStatusConfig } from '../utils/helpers';

export default function StatusBadge({ status, size = 'sm' }) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}
