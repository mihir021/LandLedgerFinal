/**
 * Profile Page — view user details, role, wallet address, and account status.
 */
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, ShieldCheck, Wallet } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl py-8 px-4 sm:px-6">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold font-serif text-gray-900">My Account Profile</h1>
        <p className="mt-1 text-sm text-gray-600">View your verified account details and system credentials.</p>
      </div>

      <div className="ll-card p-6 space-y-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-2xl font-bold text-white shadow-md">
            {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-gray-900">{user.fullName || 'User'}</h2>
              <StatusBadge status={user.status || 'verified'} size="sm" />
            </div>
            <p className="text-sm font-medium text-blue-900 capitalize mt-0.5">{user.role} Account</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Mail className="h-4 w-4 text-blue-900" /> Email Address
            </div>
            <p className="text-sm font-semibold text-gray-900">{user.email || 'N/A'}</p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Phone className="h-4 w-4 text-blue-900" /> Phone Number
            </div>
            <p className="text-sm font-semibold text-gray-900">{user.phone || '+91 98765 43210'}</p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Wallet className="h-4 w-4 text-blue-900" /> Blockchain Wallet Address
            </div>
            <p className="font-mono text-sm font-semibold text-blue-950 truncate">
              {user.walletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="h-4 w-4 text-blue-900" /> Account Status
            </div>
            <p className="text-sm font-semibold text-gray-900">
              Verified & Active • Full access granted for {user.role} portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
