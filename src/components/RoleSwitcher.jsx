/**
 * RoleSwitcher — lets a 'both' account flip between Buyer and Seller mode.
 * Single-role accounts (buyer-only or seller-only) don't render a switch.
 */
import { ShoppingBag, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OPTIONS = [
  { key: 'buyer', label: 'Buyer', icon: ShoppingBag },
  { key: 'seller', label: 'Seller', icon: Home },
];

export default function RoleSwitcher({ isHovered = true }) {
  const { canBuy, canSell, mode, setMode } = useAuth();

  // Only 'both' accounts get a switch
  if (!(canBuy && canSell)) return null;

  const options = OPTIONS.filter((o) => (o.key === 'buyer' ? canBuy : canSell));

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 mb-4" role="tablist" aria-label="Switch Buyer or Seller mode">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(opt.key)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
              active
                ? 'bg-white text-blue-900 shadow-sm border border-blue-100'
                : 'text-gray-500 hover:text-gray-800'
            } ${!isHovered ? 'px-0' : ''}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {isHovered && opt.label}
          </button>
        );
      })}
    </div>
  );
}
