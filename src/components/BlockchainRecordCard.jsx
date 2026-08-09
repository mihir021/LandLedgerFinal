/**
 * BlockchainRecordCard — displays a single blockchain event/transaction
 * Shows hash (truncated + copy), block number, timestamp, from/to, event type.
 */
import { useState } from 'react';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';

const EVENT_LABELS = {
  PropertyRegistered:  { label: 'Property Registered', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  PropertyVerified:    { label: 'Document Verified',   color: 'bg-amber-50 text-amber-700 border-amber-100' },
  OwnershipTransferred:{ label: 'Ownership Transferred',color: 'bg-green-50 text-green-700 border-green-100' },
  TransferRequested:   { label: 'Transfer Requested',  color: 'bg-purple-50 text-purple-700 border-purple-100' },
  TransferApproved:    { label: 'Transfer Approved',   color: 'bg-teal-50 text-teal-700 border-teal-100' },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1 rounded text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function truncateHash(hash, chars = 12) {
  if (!hash || hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export default function BlockchainRecordCard({ record, index = 0 }) {
  const eventCfg = EVENT_LABELS[record.event] || { label: record.event, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  const date = new Date(record.timestamp);
  const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="ll-card p-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-blue-700 shrink-0" />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${eventCfg.color}`}>
            {eventCfg.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{formattedDate}</p>
          <p className="text-xs text-gray-400">{formattedTime}</p>
        </div>
      </div>

      {/* Hash */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
        <span className="text-xs text-gray-500 font-medium shrink-0">Tx Hash</span>
        <code className="mono-data flex-1 truncate text-gray-700">{truncateHash(record.txHash)}</code>
        <CopyButton text={record.txHash} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 mb-0.5">Block #</p>
          <p className="font-mono font-medium text-gray-700">{record.blockNumber?.toLocaleString()}</p>
        </div>
        {record.gasUsed && (
          <div>
            <p className="text-gray-400 mb-0.5">Gas Used</p>
            <p className="font-mono font-medium text-gray-700">{record.gasUsed}</p>
          </div>
        )}
        {record.fromAddress && (
          <div className="col-span-2">
            <p className="text-gray-400 mb-0.5">From</p>
            <div className="flex items-center gap-1">
              <code className="mono-data text-gray-600 truncate flex-1">{truncateHash(record.fromAddress, 10)}</code>
              <CopyButton text={record.fromAddress} />
            </div>
          </div>
        )}
        {record.toAddress && (
          <div className="col-span-2">
            <p className="text-gray-400 mb-0.5">To</p>
            <div className="flex items-center gap-1">
              <code className="mono-data text-gray-600 truncate flex-1">{truncateHash(record.toAddress, 10)}</code>
              <CopyButton text={record.toAddress} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
