'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaCog,
  FaEnvelope,
  FaCreditCard,
  FaBell,
  FaShieldAlt,
  FaSave,
  FaUndo,
} from 'react-icons/fa';

export default function AdminSettings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    site: {
      name: 'BLocal',
      description: 'Your local marketplace for fresh fruits and vegetables',
      maintenanceMode: false,
      allowNewRegistrations: true,
    },
    email: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
    },
    payment: {
      stripeEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      shopNotifications: true,
      userNotifications: true,
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      maxLoginAttempts: 5,
      sessionTimeout: 24, // hours
    },
  });

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [session, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Settings saved successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      fetchSettings();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
            >
              <FaUndo className="mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Site Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaCog className="text-blue-500 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Site Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, name: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <input
                  type="text"
                  value={settings.site.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, description: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.site.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, maintenanceMode: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.site.allowNewRegistrations}
                  onChange={(e) => setSettings({
                    ...settings,
                    site: { ...settings.site, allowNewRegistrations: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Allow New Registrations
                </label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaEnvelope className="text-green-500 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Email Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpHost: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  value={settings.email.smtpPort}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPort: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpUser: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPassword: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaCreditCard className="text-purple-500 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Payment Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.payment.stripeEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, stripeEnabled: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Stripe Payments
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Public Key
                </label>
                <input
                  type="text"
                  value={settings.payment.stripePublicKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, stripePublicKey: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  value={settings.payment.stripeSecretKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, stripeSecretKey: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Webhook Secret
                </label>
                <input
                  type="password"
                  value={settings.payment.stripeWebhookSecret}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, stripeWebhookSecret: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaBell className="text-yellow-500 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.orderNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, orderNotifications: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Order Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.shopNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, shopNotifications: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Shop Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.userNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, userNotifications: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable User Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaShieldAlt className="text-red-500 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requireEmailVerification}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, requireEmailVerification: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require Email Verification
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requirePhoneVerification}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, requirePhoneVerification: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require Phone Verification
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 