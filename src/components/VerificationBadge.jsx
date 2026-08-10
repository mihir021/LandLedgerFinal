/**
 * VerificationBadge — official seal/stamp style badge
 * States: verified | pending | rejected
 */
import { ShieldCheck, Clock, ShieldX, Shield } from 'lucide-react';

const CONFIGS = {
  verified: {
    Icon: ShieldCheck,
    label: 'Government Verified',
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-700',
    text: 'text-green-800',
    ring: 'ring-green-200',
  },
  pending: {
    Icon: Clock,
    label: 'Pending Verification',
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    ring: 'ring-amber-200',
  },
  rejected: {
    Icon: ShieldX,
    label: 'Verification Rejected',
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
    ring: 'ring-red-200',
  },
  draft: {
    Icon: Shield,
    label: 'Not Submitted',
    container: 'bg-gray-50 border-gray-200',
    icon: 'text-gray-400',
    text: 'text-gray-600',
    ring: 'ring-gray-200',
  },
};

export default function VerificationBadge({ status = 'pending', size = 'md', showLabel = true }) {
  const cfg = CONFIGS[status] || CONFIGS.pending;
  const { Icon } = cfg;
  const isLg = size === 'lg';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${cfg.container}`}>
      {/* Seal circle */}
      <div className={`flex items-center justify-center rounded-full ring-2 ${cfg.ring} ${isLg ? 'h-7 w-7' : 'h-5 w-5'}`}>
        <Icon className={`${isLg ? 'h-4 w-4' : 'h-3 w-3'} ${cfg.icon}`} strokeWidth={2} />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold ${cfg.text} whitespace-nowrap`}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}
