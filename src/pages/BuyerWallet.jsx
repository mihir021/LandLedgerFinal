/**
 * BuyerWallet — blockchain wallet page backed by real user wallet + transfer data
 */
import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WalletConnectButton from '../components/WalletConnectButton';
import { getTransfers } from '../services/transferService';
import { useAuth } from '../context/AuthContext';
import { useAccount } from 'wagmi';

function formatINR(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000)   return `₹${(abs / 100000).toFixed(1)} L`;
  return `₹${abs.toLocaleString('en-IN')}`;
}

export default function BuyerWallet() {
  const { user } = useAuth();
  const { address: connectedWalletAddress } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const rawTransfers = await getTransfers({ view: 'buyer' });
        const transferList = Array.isArray(rawTransfers) ? rawTransfers : [];
        setTransfers(transferList);
        
        const completed = transferList.filter(t => ['completed', 'Completed', 'Approved', 'Approved/Completed'].includes(t.status));
        const txs = completed.map(t => {
          // Find the best price to display
          let amount = t.transferAmount || t.transferAmountEth;
          if (!amount && t.property?.pricing?.priceINR) amount = t.property.pricing.priceINR;
          if (!amount && t.property?.price) amount = t.property.price;
          if (!amount && t.agreedPrice) amount = t.agreedPrice;

          return {
            id: t._id,
            type: 'purchase',
            description: t.property?.propertyId || t.property?.title || t.property?.location?.district || 'Property Purchase',
            amount: -(amount || 0),
            txHash: t.transactionHash || t.blockchainTxHash || t.buyerRequestTxHash || t.paymentTxHash || `${t._id}`.slice(0, 18),
            date: t.completedAt || t.createdAt,
            status: t.status
          };
        });
        setTransactions(txs);
      } catch (err) {
        setError(err.message || 'Failed to load wallet transactions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalInvested = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
  const walletAddress = connectedWalletAddress || user?.walletAddress || 'Not connected';
  const shortAddress = walletAddress.length > 18 ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}` : walletAddress;

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
            <p className="text-sm text-white/60 mb-1">Total Invested in Properties</p>
            <p className="font-serif text-4xl font-bold text-white">{formatINR(totalInvested)}</p>
            <p className="text-sm text-white/50 mt-1">≈ {(totalInvested / 83).toFixed(0)} USD</p>
          </div>
          <WalletConnectButton className="shrink-0" />
        </div>

        <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 mb-4">
          <p className="text-xs text-white/60">Wallet Address</p>
          <p className="font-mono text-sm font-semibold text-white truncate mt-0.5">{shortAddress}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Invested', value: formatINR(totalInvested), sub: 'in properties' },
            { label: 'Transactions',   value: transactions.length.toString(), sub: 'completed tx' },
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
          <h2 className="font-serif text-lg font-semibold text-gray-900">Property Transactions</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-blue-800 animate-spin" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No completed property transactions yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 text-red-600 bg-red-50">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{tx.description}</p>
                  <p className="mono-data text-xs truncate mt-0.5">{tx.txHash}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="text-base font-bold shrink-0 text-red-600">−{formatINR(Math.abs(tx.amount))}</p>
              </div>
            ))}
          </div>
        )}
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
