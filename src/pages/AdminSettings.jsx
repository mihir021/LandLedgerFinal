/**
 * AdminSettings Page — System configuration settings for Administrator.
 */
import { useState } from 'react';
import { Settings, Shield, Bell, Database, Save, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminSettings() {
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    systemName: 'LandLedger Registry Platform',
    autoVerifyKYC: false,
    requireOfficerApproval: true,
    blockchainAutoSync: true,
    maxFileUploadMB: 10,
    allowedFileFormats: 'JPG, PNG, WEBP, PDF',
    emailNotifications: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success('System settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold font-serif text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure global registry rules, verification parameters, and storage limits.</p>
      </div>

      <form onSubmit={handleSubmit} className="ll-card p-8 animate-fade-in-up delay-100 space-y-6">
        {/* Section: Platform */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Settings className="h-5 w-5 text-blue-900" />
            <h2 className="text-base font-bold font-serif text-gray-900">Platform Identity</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="ll-label">Platform Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="ll-input"
              />
            </div>
            <div>
              <label className="ll-label">Max File Size Limit (MB)</label>
              <input
                type="number"
                value={settings.maxFileUploadMB}
                onChange={(e) => setSettings({ ...settings, maxFileUploadMB: e.target.value })}
                className="ll-input"
              />
            </div>
          </div>
        </div>

        {/* Section: Security */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Shield className="h-5 w-5 text-blue-900" />
            <h2 className="text-base font-bold font-serif text-gray-900">Verification & Security Rules</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireOfficerApproval}
                onChange={(e) => setSettings({ ...settings, requireOfficerApproval: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">Require Officer Approval for Ownership Transfer</p>
                <p className="text-xs text-gray-500">Every land deed transfer requires explicit digital approval by a verified govt. officer.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.blockchainAutoSync}
                onChange={(e) => setSettings({ ...settings, blockchainAutoSync: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">Enable Smart Contract Auto-Sync</p>
                <p className="text-xs text-gray-500">Automatically broadcast approved properties and transfer deeds to on-chain smart contract ledger.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" className="btn-primary text-sm px-6 py-2.5">
            {saved ? <CheckCircle className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Configurations'}
          </button>
        </div>
      </form>
    </div>
  );
}
