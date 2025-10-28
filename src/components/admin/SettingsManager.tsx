import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Globe, Mail, Shield, Database } from 'lucide-react';

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'AI EduDigest',
    siteDescription: 'Latest insights, trends, and innovations in AI education',
    contactEmail: 'contact@aiedudigest.com',
    maxArticlesPerPage: 10,
    allowUserRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would save settings to Firestore
      // await updateSettings(settings);
      console.log('Settings saved:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        siteName: 'AI EduDigest',
        siteDescription: 'Latest insights, trends, and innovations in AI education',
        contactEmail: 'contact@aiedudigest.com',
        maxArticlesPerPage: 10,
        allowUserRegistration: true,
        requireEmailVerification: false,
        maintenanceMode: false
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Site Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure your site settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-[#9b0101] mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Articles Per Page
              </label>
              <input
                type="number"
                value={settings.maxArticlesPerPage}
                onChange={(e) => setSettings({ ...settings, maxArticlesPerPage: parseInt(e.target.value) })}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-[#9b0101] mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRegistration"
                checked={settings.allowUserRegistration}
                onChange={(e) => setSettings({ ...settings, allowUserRegistration: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow User Registration
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Require Email Verification
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 text-[#9b0101] focus:ring-[#9b0101] border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Database className="w-5 h-5 text-[#9b0101] mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Firebase Project</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">ai-edudigest-dde2c</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">App Version</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Updated</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#9b0101] text-white px-4 py-2 rounded-lg hover:bg-[#7a0101] transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
