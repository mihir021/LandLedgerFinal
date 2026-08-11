/**
 * BuyerWallet — mock blockchain wallet page
 */
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import WalletConnectButton from '../components/WalletConnectButton';
import { useEffect, useState } from 'react';
import { getTransfers } from '../services/transferService';
import { Loader2 } from 'lucide-react';
function formatINR(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000)   return `₹${(abs / 100000).toFixed(1)} L`;
  return `₹${abs.toLocaleString('en-IN')}`;
}

const TX_ICONS = {
  purchase: TrendingDown,
  deposit:  TrendingUp,
  fee:      Minus,
};

const TX_COLORS = {
  purchase: 'text-red-600 bg-red-50',
  deposit:  'text-green-700 bg-green-50',
  fee:      'text-gray-600 bg-gray-100',
};

export default function BuyerWallet() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTransfers()
      .then(data => setTransfers(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load wallet transactions.'))
      .finally(() => setLoading(false));
  }, []);

  const totalInvested = transfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.agreedPrice || t.property?.pricing?.priceINR || 0), 0);
  
  // Assume mock starting balance of 5 Cr for demonstration if no investments
  const INITIAL_BALANCE = 50000000;
  const balance = INITIAL_BALANCE - totalInvested;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 animate-fade-in">
        <Link to="/buyer" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your blockchain wallet and transactions</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* Wallet connect + balance */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-800 animate-spin" />
        </div>
      ) : (
      <>
        <div className="ll-card p-6 animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-white/60 mb-1">Total Balance</p>
            <p className="font-serif text-4xl font-bold text-white">{formatINR(balance)}</p>
            <p className="text-sm text-white/50 mt-1">≈ {(balance / 83).toFixed(0)} USD</p>
          </div>
          <WalletConnectButton className="shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Invested', value: formatINR(totalInvested), sub: 'in properties' },
            { label: 'Fees Paid',      value: formatINR(totalInvested * 0.05), sub: '5% registration fees' },
            { label: 'Transactions',   value: transfers.length.toString(), sub: 'total tx' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/10 border border-white/15 px-3 py-3">
              <p className="text-xs text-white/60">{s.label}</p>
              <p className="text-base font-bold text-white mt-0.5">{s.value}</p>
              <p className="text-xs text-white/40">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="ll-card animate-fade-in-up delay-200">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {transfers.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No transactions found.</p>
          ) : (
            transfers.map((tx, i) => {
              const Icon = TX_ICONS.purchase;
              const colorClass = TX_COLORS.purchase;
              const amount = tx.agreedPrice || tx.property?.pricing?.priceINR || 0;
              const propTitle = tx.property?.title || tx.property?.location?.district || tx.property?.location?.surveyNumber || 'Property Transfer';
              return (
                <div key={tx._id || i} className="flex items-center gap-4 px-5 py-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Purchase Request: {propTitle}</p>
                    <p className="mono-data text-xs truncate mt-0.5">{tx._id || tx.id}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <p className={`text-base font-bold shrink-0 text-red-600`}>
                    −{formatINR(amount)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="ll-card p-4 bg-amber-50 border-amber-200 flex gap-3 animate-fade-in-up delay-300">
        <span className="text-xl shrink-0">🔐</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Wallet Security Notice</p>
          <p className="text-xs text-amber-700 mt-0.5">All transactions on LandLedger are secured by multi-signature smart contracts. No funds move without your explicit cryptographic signature and government officer approval.</p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
