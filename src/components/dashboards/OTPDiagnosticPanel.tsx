import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface OTPLog {
  timestamp: string;
  recipient: string;
  status: string;
  message: string;
  success: boolean;
  metadata: any;
}

interface OTPStats {
  total: number;
  successful: number;
  failed: number;
  bypassed: number;
  pending: number;
  successRate: string;
  timeframe: string;
}

interface OTPDiagnosticPanelProps {
  onClose: () => void;
}

export default function OTPDiagnosticPanel({ onClose }: OTPDiagnosticPanelProps) {
  const { currentLanguage } = useLanguage();
  const [stats, setStats] = useState<OTPStats | null>(null);
  const [logs, setLogs] = useState<OTPLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [newWhitelistPhone, setNewWhitelistPhone] = useState('');
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);
  const [firebaseStats, setFirebaseStats] = useState<any>(null);
  const [firebaseReport, setFirebaseReport] = useState<any>(null);

  useEffect(() => {
    fetchOTPStats();
    fetchFirebaseStats();
    const interval = setInterval(() => {
      fetchOTPStats();
      fetchFirebaseStats();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchOTPStats = async () => {
    try {
      const response = await fetch(`/api/auth/otp-debug/stats?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.statistics);
        setLogs(data.data.recentLogs);
      }
    } catch (error) {
      console.error('Failed to fetch OTP stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirebaseStats = async () => {
    try {
      const response = await fetch('/api/auth/otp-debug/firebase-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFirebaseStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch Firebase stats:', error);
    }
  };

  const generateFirebaseReport = async () => {
    try {
      const response = await fetch('/api/auth/otp-debug/firebase-report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFirebaseReport(data.data);
      }
    } catch (error) {
      console.error('Failed to generate Firebase report:', error);
    }
  };

  const testFirebaseConfig = async () => {
    try {
      const response = await fetch('/api/auth/otp-debug/test-firebase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Firebase test successful!\n\n${data.message}`);
      } else {
        alert(`❌ Firebase test failed!\n\n${data.message}`);
      }
    } catch (error) {
      console.error('Firebase test error:', error);
      alert('Firebase test failed due to network error');
    }
  };

  const resetUsageCounters = async () => {
    if (!confirm('Are you sure you want to reset all SMS usage counters? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/auth/otp-debug/reset-counters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Usage counters reset successfully!');
        fetchOTPStats();
        fetchFirebaseStats();
      } else {
        alert(`❌ Failed to reset counters: ${data.message}`);
      }
    } catch (error) {
      console.error('Reset counters error:', error);
      alert('Failed to reset counters due to network error');
    }
  };

  const testSMS = async () => {
    if (!testPhoneNumber.match(/^[6-9]\d{9}$/)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return;
    }

    try {
      const response = await fetch('/api/auth/otp-debug/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          message: testMessage || undefined
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Test SMS sent successfully to ${testPhoneNumber}`);
        setTestPhoneNumber('');
        setTestMessage('');
        fetchOTPStats(); // Refresh stats
      } else {
        alert(`❌ Failed to send test SMS: ${data.message}`);
      }
    } catch (error) {
      console.error('Test SMS error:', error);
      alert('Failed to send test SMS due to network error');
    }
  };

  const addToWhitelist = async () => {
    if (!newWhitelistPhone.match(/^[6-9]\d{9}$/)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return;
    }

    try {
      const response = await fetch('/api/auth/otp-debug/whitelist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          phoneNumber: newWhitelistPhone
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.data.message}`);
        setNewWhitelistPhone('');
        fetchOTPStats(); // Refresh stats
      } else {
        alert(`❌ Failed to add to whitelist: ${data.message}`);
      }
    } catch (error) {
      console.error('Whitelist add error:', error);
      alert('Failed to add to whitelist due to network error');
    }
  };

  const createEmergencyBypass = async (identifier: string, reason: string = 'Emergency access') => {
    try {
      const response = await fetch('/api/auth/otp-debug/emergency-bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          identifier,
          reason
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`🚨 Emergency bypass created!\nToken: ${data.data.bypassToken}\nExpires: ${new Date(data.data.expiresAt).toLocaleString()}`);
        fetchOTPStats(); // Refresh stats
      } else {
        alert(`❌ Failed to create emergency bypass: ${data.message}`);
      }
    } catch (error) {
      console.error('Emergency bypass error:', error);
      alert('Failed to create emergency bypass due to network error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-blue-600 bg-blue-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'VERIFIED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'BYPASSED': return 'text-purple-600 bg-purple-100';
      case 'VERIFY_FAILED': return 'text-orange-600 bg-orange-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'TEST_SENT': return 'text-cyan-600 bg-cyan-100';
      case 'EMAIL_BYPASS': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3">🔍</span>
                OTP Diagnostic Dashboard
              </h2>
              <p className="text-blue-100 mt-1">Monitor OTP delivery, debug issues, and manage whitelist</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading OTP diagnostics...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Firebase Stats */}
              {firebaseStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-orange-600 text-sm font-medium">Firebase Status</div>
                    <div className={`text-2xl font-bold ${firebaseStats.firebaseStatus.isConfigured ? 'text-green-700' : 'text-red-700'}`}>
                      {firebaseStats.firebaseStatus.isConfigured ? '✅ Active' : '❌ Not Config'}
                    </div>
                    <div className="text-xs text-orange-500">Project: {firebaseStats.firebaseStatus.isConfigured ? 'Connected' : 'Disconnected'}</div>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <div className="text-cyan-600 text-sm font-medium">Daily Quota</div>
                    <div className="text-2xl font-bold text-cyan-700">{firebaseStats.quotaStatus.dailyPercentage}%</div>
                    <div className="text-xs text-cyan-500">
                      {firebaseStats.totals.dailySMS} / {firebaseStats.limits.dailyLimit} SMS
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-purple-600 text-sm font-medium">Monthly Quota</div>
                    <div className="text-2xl font-bold text-purple-700">{firebaseStats.quotaStatus.monthlyPercentage}%</div>
                    <div className="text-xs text-purple-500">
                      {firebaseStats.totals.monthlySMS} / {firebaseStats.limits.monthlyLimit} SMS
                    </div>
                  </div>
                </div>
              )}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium">Total Requests</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                    <div className="text-xs text-blue-500">{stats.timeframe}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium">Successful</div>
                    <div className="text-2xl font-bold text-green-700">{stats.successful}</div>
                    <div className="text-xs text-green-500">{stats.successRate}% success rate</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium">Failed</div>
                    <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                    <div className="text-xs text-red-500">Delivery failures</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-purple-600 text-sm font-medium">Bypassed</div>
                    <div className="text-2xl font-bold text-purple-700">{stats.bypassed}</div>
                    <div className="text-xs text-purple-500">Admin whitelist</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-yellow-600 text-sm font-medium">Pending</div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                    <div className="text-xs text-yellow-500">Awaiting delivery</div>
                  </div>
                </div>
              )}

              {/* Control Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test SMS */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🧪</span>
                    Test SMS Delivery
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="tel"
                      placeholder="Phone number (10 digits)"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={10}
                    />
                    <input
                      type="text"
                      placeholder="Custom test message (optional)"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={160}
                    />
                    <button
                      onClick={testSMS}
                      disabled={!testPhoneNumber.match(/^[6-9]\d{9}$/)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Test SMS
                    </button>
                  </div>
                </div>

                {/* Whitelist Management */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🔓</span>
                    Whitelist Management
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="tel"
                      placeholder="Phone number to whitelist"
                      value={newWhitelistPhone}
                      onChange={(e) => setNewWhitelistPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={10}
                    />
                    <button
                      onClick={addToWhitelist}
                      disabled={!newWhitelistPhone.match(/^[6-9]\d{9}$/)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Whitelist
                    </button>
                    <div className="text-xs text-gray-600">
                      Current whitelist: 9060328119 (StellaroneAI)
                    </div>
                  </div>
                </div>
              </div>

              {/* Firebase & System Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
                  <span className="mr-2">🔥</span>
                  Firebase & System Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={testFirebaseConfig}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Test Firebase Config
                  </button>
                  <button
                    onClick={generateFirebaseReport}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                  >
                    Firebase Report
                  </button>
                  <button
                    onClick={resetUsageCounters}
                    className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                  >
                    Reset Counters
                  </button>
                  <button
                    onClick={() => {
                      fetchOTPStats();
                      fetchFirebaseStats();
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    Refresh All
                  </button>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-red-700">
                  <span className="mr-2">🚨</span>
                  Emergency Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => createEmergencyBypass('9060328119', 'StellaroneAI emergency access')}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    Create Bypass for StellaroneAI
                  </button>
                  <button
                    onClick={() => createEmergencyBypass('gilboj@gmail.com', 'Email emergency access')}
                    className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                  >
                    Email Bypass for StellaroneAI
                  </button>
                  <button
                    onClick={generateFirebaseReport}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  >
                    Generate Full Report
                  </button>
                </div>
              </div>

              {/* Timeframe Selection */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
                <button
                  onClick={fetchOTPStats}
                  className="bg-gray-600 text-white px-4 py-1 rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>

              {/* Recent Logs */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="text-lg font-semibold">Recent OTP Events</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {log.recipient}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                            {log.message}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-500">
                            {log.metadata.userType && `Type: ${log.metadata.userType}`}
                            {log.metadata.ip && ` | IP: ${log.metadata.ip}`}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No OTP events found for the selected timeframe
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Firebase Diagnostic Report */}
              {firebaseReport && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🔥</span>
                    Firebase Diagnostic Report
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold mb-2">Configuration Status</h4>
                      <p className={`text-sm ${firebaseReport.firebaseConfig.configured ? 'text-green-600' : 'text-red-600'}`}>
                        {firebaseReport.firebaseConfig.configured ? '✅ Configured' : '❌ Not configured'}
                      </p>
                      <p className="text-xs text-gray-600">Project: {firebaseReport.firebaseConfig.projectId || 'Not set'}</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold mb-2">Usage Summary</h4>
                      <p className="text-sm">Daily: {firebaseReport.smsStatistics.totals.dailySMS} SMS</p>
                      <p className="text-sm">Monthly: {firebaseReport.smsStatistics.totals.monthlySMS} SMS</p>
                      <p className="text-sm">Unique Numbers: {firebaseReport.smsStatistics.totals.uniqueNumbers}</p>
                    </div>
                  </div>
                  
                  {firebaseReport.alerts && firebaseReport.alerts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                      <h4 className="font-semibold text-red-700 mb-2">⚠️ Alerts</h4>
                      {firebaseReport.alerts.map((alert: any, index: number) => (
                        <div key={index} className={`text-sm p-2 rounded mb-2 ${
                          alert.type === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          alert.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <pre className="text-xs bg-white p-4 rounded border overflow-x-auto max-h-64">
                    {JSON.stringify(firebaseReport, null, 2)}
                  </pre>
                </div>
              )}

              {/* Diagnostic Report */}
              {diagnosticReport && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Full Diagnostic Report
                  </h3>
                  <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
                    {JSON.stringify(diagnosticReport, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}