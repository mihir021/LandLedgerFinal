/**
 * AdminSettings Page — System configuration settings for Administrator.
 * Loads and persists settings via the backend settings API.
 */
import { useEffect, useState } from 'react';
import { Settings, Shield, Bell, Save, CheckCircle, Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '../services/settingService';
import { useToast } from '../context/ToastContext';

export default function AdminSettings() {
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    systemName: 'LandLedger Registry Platform',
    autoVerifyKYC: false,
    requireOfficerApproval: true,
    blockchainAutoSync: true,
    maxFileUploadMB: 10,
    allowedFileFormats: 'JPG, PNG, WEBP, PDF',
    emailNotifications: true,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        if (data) {
          setSettings(prev => ({
            ...prev,
            systemName: data.platformName || prev.systemName,
            requireOfficerApproval: data.requireOfficerApproval ?? prev.requireOfficerApproval,
            blockchainAutoSync: data.blockchainAutoSync ?? prev.blockchainAutoSync,
            allowPublicRegistration: data.allowPublicRegistration ?? prev.allowPublicRegistration,
            maintenanceMode: data.maintenanceMode ?? prev.maintenanceMode,
          }));
        }
      } catch {
        // fall back to defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        platformName: settings.systemName,
        requireOfficerApproval: settings.requireOfficerApproval,
        blockchainAutoSync: settings.blockchainAutoSync,
        allowPublicRegistration: settings.allowPublicRegistration,
        maintenanceMode: settings.maintenanceMode,
      });
      setSaved(true);
      toast.success('System settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold font-serif text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure global registry rules, verification parameters, and storage limits.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-blue-800 animate-spin" /></div>
      ) : (
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

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPublicRegistration}
                  onChange={(e) => setSettings({ ...settings, allowPublicRegistration: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Allow Public Registration</p>
                  <p className="text-xs text-gray-500">Allow new buyer/seller accounts to self-register on the platform.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Maintenance Mode</p>
                  <p className="text-xs text-gray-500">Temporarily restrict platform access during scheduled maintenance.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                <Bell className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Send transaction and KYC updates to users via email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Configurations'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
