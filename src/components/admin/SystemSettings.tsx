import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { storage } from '@core/storage';

interface SystemSettings {
  general: {
    appName: string;
    supportEmail: string;
    emergencyNumber: string;
    maintenanceMode: boolean;
    timezone: string;
    language: string;
  };
  authentication: {
    otpExpiry: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
    enableSocialLogin: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    enablePushNotifications: boolean;
    appointmentReminders: boolean;
    medicationReminders: boolean;
  };
  ai: {
    enableAiAssistant: boolean;
    aiModel: string;
    enableVoiceAssistant: boolean;
    enableMedicalTerminology: boolean;
    offlineMode: boolean;
  };
  security: {
    enableAuditLogging: boolean;
    enableRateLimiting: boolean;
    maxApiCallsPerMinute: number;
    enableTwoFactorAuth: boolean;
    passwordMinLength: number;
  };
  healthcare: {
    enableTelemedicine: boolean;
    enableEmergencyServices: boolean;
    enablePrescriptionManagement: boolean;
    enableLabReports: boolean;
    enableInsuranceClaims: boolean;
  };
}

export default function SystemSettings() {
  const { checkPermission, isSuperAdmin } = useAdmin();
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      appName: 'EasyMedPro',
      supportEmail: 'support@easymedpro.com',
      emergencyNumber: '108',
      maintenanceMode: false,
      timezone: 'Asia/Kolkata',
      language: 'English'
    },
    authentication: {
      otpExpiry: 10,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      requireEmailVerification: false,
      enableSocialLogin: true
    },
    notifications: {
      enableEmailNotifications: true,
      enableSmsNotifications: true,
      enablePushNotifications: true,
      appointmentReminders: true,
      medicationReminders: true
    },
    ai: {
      enableAiAssistant: true,
      aiModel: 'GPT-4',
      enableVoiceAssistant: true,
      enableMedicalTerminology: true,
      offlineMode: false
    },
    security: {
      enableAuditLogging: true,
      enableRateLimiting: true,
      maxApiCallsPerMinute: 100,
      enableTwoFactorAuth: false,
      passwordMinLength: 8
    },
    healthcare: {
      enableTelemedicine: true,
      enableEmergencyServices: true,
      enablePrescriptionManagement: true,
      enableLabReports: true,
      enableInsuranceClaims: false
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await storage.getItem('easymed_system_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading system settings:', error);
        }
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = (category: keyof SystemSettings, key: string, value: any) => {
    if (!checkPermission('system_settings')) {
      alert('You do not have permission to modify system settings');
      return;
    }

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!checkPermission('system_settings')) {
      alert('You do not have permission to save system settings');
      return;
    }

    setIsLoading(true);
    try {
      // Save to storage (in real app, save to Firebase/database)
      await storage.setItem('easymed_system_settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (!isSuperAdmin) {
      alert('Only super admin can reset settings to defaults');
      return;
    }

    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      // Reset to default values
      setSettings({
        general: {
          appName: 'EasyMedPro',
          supportEmail: 'support@easymedpro.com',
          emergencyNumber: '108',
          maintenanceMode: false,
          timezone: 'Asia/Kolkata',
          language: 'English'
        },
        authentication: {
          otpExpiry: 10,
          maxLoginAttempts: 5,
          sessionTimeout: 30,
          requireEmailVerification: false,
          enableSocialLogin: true
        },
        notifications: {
          enableEmailNotifications: true,
          enableSmsNotifications: true,
          enablePushNotifications: true,
          appointmentReminders: true,
          medicationReminders: true
        },
        ai: {
          enableAiAssistant: true,
          aiModel: 'GPT-4',
          enableVoiceAssistant: true,
          enableMedicalTerminology: true,
          offlineMode: false
        },
        security: {
          enableAuditLogging: true,
          enableRateLimiting: true,
          maxApiCallsPerMinute: 100,
          enableTwoFactorAuth: false,
          passwordMinLength: 8
        },
        healthcare: {
          enableTelemedicine: true,
          enableEmergencyServices: true,
          enablePrescriptionManagement: true,
          enableLabReports: true,
          enableInsuranceClaims: false
        }
      });
      setHasChanges(true);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'authentication', name: 'Authentication', icon: '🔐' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'ai', name: 'AI Features', icon: '🤖' },
    { id: 'security', name: 'Security', icon: '🛡️' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <input
                type="text"
                value={settings.general.appName}
                onChange={(e) => handleSettingChange('general', 'appName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Number
              </label>
              <input
                type="text"
                value={settings.general.emergencyNumber}
                onChange={(e) => handleSettingChange('general', 'emergencyNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.general.maintenanceMode}
                onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
            
            {settings.general.maintenanceMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Maintenance mode is enabled. Users will see a maintenance message and won't be able to access the application.
                </p>
              </div>
            )}
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Expiry (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={settings.authentication.otpExpiry}
                onChange={(e) => handleSettingChange('authentication', 'otpExpiry', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.authentication.maxLoginAttempts}
                onChange={(e) => handleSettingChange('authentication', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={settings.authentication.sessionTimeout}
                onChange={(e) => handleSettingChange('authentication', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.authentication.requireEmailVerification}
                  onChange={(e) => handleSettingChange('authentication', 'requireEmailVerification', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
                  Require Email Verification
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableSocialLogin"
                  checked={settings.authentication.enableSocialLogin}
                  onChange={(e) => handleSettingChange('authentication', 'enableSocialLogin', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableSocialLogin" className="text-sm font-medium text-gray-700">
                  Enable Social Login (Google, Facebook)
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableEmailNotifications"
                  checked={settings.notifications.enableEmailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'enableEmailNotifications', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableEmailNotifications" className="text-sm font-medium text-gray-700">
                  Enable Email Notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableSmsNotifications"
                  checked={settings.notifications.enableSmsNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'enableSmsNotifications', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableSmsNotifications" className="text-sm font-medium text-gray-700">
                  Enable SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enablePushNotifications"
                  checked={settings.notifications.enablePushNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'enablePushNotifications', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enablePushNotifications" className="text-sm font-medium text-gray-700">
                  Enable Push Notifications
                </label>
              </div>
            </div>
            
            <hr className="my-6" />
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Reminder Settings</h4>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="appointmentReminders"
                  checked={settings.notifications.appointmentReminders}
                  onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="appointmentReminders" className="text-sm font-medium text-gray-700">
                  Appointment Reminders
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="medicationReminders"
                  checked={settings.notifications.medicationReminders}
                  onChange={(e) => handleSettingChange('notifications', 'medicationReminders', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="medicationReminders" className="text-sm font-medium text-gray-700">
                  Medication Reminders
                </label>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAiAssistant"
                  checked={settings.ai.enableAiAssistant}
                  onChange={(e) => handleSettingChange('ai', 'enableAiAssistant', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableAiAssistant" className="text-sm font-medium text-gray-700">
                  Enable AI Assistant
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableVoiceAssistant"
                  checked={settings.ai.enableVoiceAssistant}
                  onChange={(e) => handleSettingChange('ai', 'enableVoiceAssistant', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableVoiceAssistant" className="text-sm font-medium text-gray-700">
                  Enable Voice Assistant
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableMedicalTerminology"
                  checked={settings.ai.enableMedicalTerminology}
                  onChange={(e) => handleSettingChange('ai', 'enableMedicalTerminology', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableMedicalTerminology" className="text-sm font-medium text-gray-700">
                  Enable Medical Terminology Support
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="offlineMode"
                  checked={settings.ai.offlineMode}
                  onChange={(e) => handleSettingChange('ai', 'offlineMode', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="offlineMode" className="text-sm font-medium text-gray-700">
                  Enable Offline Mode
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={settings.ai.aiModel}
                onChange={(e) => handleSettingChange('ai', 'aiModel', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GPT-4">GPT-4 (Recommended)</option>
                <option value="GPT-3.5">GPT-3.5 Turbo</option>
                <option value="AI4Bharat">AI4Bharat Model</option>
                <option value="Llama-2">Llama 2</option>
              </select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAuditLogging"
                  checked={settings.security.enableAuditLogging}
                  onChange={(e) => handleSettingChange('security', 'enableAuditLogging', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableAuditLogging" className="text-sm font-medium text-gray-700">
                  Enable Audit Logging
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableRateLimiting"
                  checked={settings.security.enableRateLimiting}
                  onChange={(e) => handleSettingChange('security', 'enableRateLimiting', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableRateLimiting" className="text-sm font-medium text-gray-700">
                  Enable Rate Limiting
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableTwoFactorAuth"
                  checked={settings.security.enableTwoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'enableTwoFactorAuth', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableTwoFactorAuth" className="text-sm font-medium text-gray-700">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max API Calls Per Minute
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.security.maxApiCallsPerMinute}
                onChange={(e) => handleSettingChange('security', 'maxApiCallsPerMinute', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'healthcare':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableTelemedicine"
                  checked={settings.healthcare.enableTelemedicine}
                  onChange={(e) => handleSettingChange('healthcare', 'enableTelemedicine', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableTelemedicine" className="text-sm font-medium text-gray-700">
                  Enable Telemedicine Services
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableEmergencyServices"
                  checked={settings.healthcare.enableEmergencyServices}
                  onChange={(e) => handleSettingChange('healthcare', 'enableEmergencyServices', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableEmergencyServices" className="text-sm font-medium text-gray-700">
                  Enable Emergency Services
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enablePrescriptionManagement"
                  checked={settings.healthcare.enablePrescriptionManagement}
                  onChange={(e) => handleSettingChange('healthcare', 'enablePrescriptionManagement', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enablePrescriptionManagement" className="text-sm font-medium text-gray-700">
                  Enable Prescription Management
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableLabReports"
                  checked={settings.healthcare.enableLabReports}
                  onChange={(e) => handleSettingChange('healthcare', 'enableLabReports', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableLabReports" className="text-sm font-medium text-gray-700">
                  Enable Lab Reports Management
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableInsuranceClaims"
                  checked={settings.healthcare.enableInsuranceClaims}
                  onChange={(e) => handleSettingChange('healthcare', 'enableInsuranceClaims', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableInsuranceClaims" className="text-sm font-medium text-gray-700">
                  Enable Insurance Claims Processing
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!checkPermission('system_settings')) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">🔒</div>
        <div className="text-gray-600">You do not have permission to access system settings</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isSuperAdmin && (
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Reset to Defaults
            </button>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ You have unsaved changes. Please save your settings to apply them.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}