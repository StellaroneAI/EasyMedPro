import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface EmergencyAdminAccessProps {
  onEmergencyLogin: (credentials: { identifier: string; password: string }) => void;
}

export default function EmergencyAdminAccess({ onEmergencyLogin }: EmergencyAdminAccessProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmergencyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Emergency access credentials
      const emergencyCredentials = [
        { email: 'praveen@stellaronehealth.com', password: 'dummy123' },
        { email: 'admin@easymed.in', password: 'admin123' },
        { phone: '9060328119', password: '' }, // No password needed for super admin phone
        { email: 'superadmin@easymed.in', password: 'admin@123' }
      ];

      const isValid = emergencyCredentials.some(cred => {
        if (cred.phone) {
          return identifier === cred.phone;
        } else {
          return identifier === cred.email && password === cred.password;
        }
      });

      if (isValid) {
        onEmergencyLogin({ identifier, password });
      } else {
        setError('Invalid emergency access credentials');
      }
    } catch (error) {
      setError('Emergency access failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Emergency Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">🚨</span>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Emergency Admin Access</h1>
          <p className="text-red-600 text-sm">
            For authorized personnel only. This bypasses standard OTP verification.
          </p>
        </div>

        {/* Emergency Login Form */}
        <form onSubmit={handleEmergencyLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Identifier (Email or Phone)
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter admin email or phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter emergency password (if required)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Super admin phone (9060328119) doesn't require password
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !identifier}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isLoading || !identifier
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Authenticating...' : 'Emergency Access'}
          </button>
        </form>

        {/* Emergency Contact Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Super Admin:</span>
              <span className="font-medium">9060328119</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Support Email:</span>
              <span className="font-medium">admin@easymed.in</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">StellarOne:</span>
              <span className="font-medium">praveen@stellaronehealth.com</span>
            </div>
          </div>
        </div>

        {/* Valid Credentials Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Valid Emergency Access:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>📱 Phone: <span className="font-mono">9060328119</span> (no password needed)</div>
            <div>📧 Email: <span className="font-mono">praveen@stellaronehealth.com</span></div>
            <div>🔑 Password: <span className="font-mono">dummy123</span></div>
            <div className="text-red-600 font-medium mt-2">
              ⚠️ For authorized emergency use only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}