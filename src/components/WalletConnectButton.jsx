/**
 * WalletConnectButton — mock MetaMask-style wallet connect
 * Shows connect CTA when disconnected, truncated address when connected.
 */
import { useState } from 'react';
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react';

const MOCK_ADDRESS = '0x82aD1C3E5F7A9B2D4F6A8C0E2F4A6B8F7c3';

function truncate(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

export default function WalletConnectButton({ className = '' }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate MetaMask delay
    await new Promise(r => setTimeout(r, 1200));
    setAddress(MOCK_ADDRESS);
    setConnected(true);
    setConnecting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress('');
    setOpen(false);
  };

  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`flex items-center gap-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-60 ${className}`}
      >
        <Wallet className="h-4 w-4 text-amber-600" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors"
      >
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <Wallet className="h-4 w-4 text-green-700" />
        <code className="font-mono text-xs">{truncate(address)}</code>
        <ChevronDown className="h-3.5 w-3.5 text-green-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 ll-card shadow-xl py-2 animate-fade-in">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs text-gray-500 mb-1">Connected Address</p>
            <div className="flex items-center gap-2">
              <code className="mono-data text-xs flex-1 truncate text-gray-700">{truncate(address)}</code>
              <button onClick={handleCopy} className="p-1 hover:bg-gray-100 rounded">
                {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
