import { useState, useEffect } from 'react';

interface WearableDeviceIntegrationProps {
  patientId: string;
}

interface HealthData {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  steps?: number;
  calories?: number;
  sleepDuration?: number;
  oxygenSaturation?: number;
  temperature?: number;
  lastSync?: Date;
}

export default function WearableDeviceIntegration({ patientId }: WearableDeviceIntegrationProps) {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [healthData, setHealthData] = useState<HealthData>({});
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Check for available health APIs
  const isAppleHealthKitAvailable = () => {
    return typeof window !== 'undefined' && 'HealthKit' in window;
  };

  const isGoogleFitAvailable = () => {
    return typeof window !== 'undefined' && 'gapi' in window;
  };

  const isSamsungHealthAvailable = () => {
    return typeof window !== 'undefined' && 'SHealth' in window;
  };

  const isFitbitAvailable = () => {
    return typeof window !== 'undefined' && 'Fitbit' in window;
  };

  // Apple HealthKit Integration
  const connectAppleHealthKit = async () => {
    setIsConnecting('apple');
    try {
      if (isAppleHealthKitAvailable()) {
        // Request permissions for HealthKit data
        const permissions = {
          read: [
            'HKQuantityTypeIdentifierHeartRate',
            'HKQuantityTypeIdentifierBloodPressureSystolic',
            'HKQuantityTypeIdentifierBloodPressureDiastolic',
            'HKQuantityTypeIdentifierStepCount',
            'HKQuantityTypeIdentifierActiveEnergyBurned',
            'HKCategoryTypeIdentifierSleepAnalysis',
            'HKQuantityTypeIdentifierOxygenSaturation',
            'HKQuantityTypeIdentifierBodyTemperature'
          ]
        };

        // This would use the actual HealthKit API in a real implementation
        console.log('Requesting HealthKit permissions:', permissions);
        
        // Simulate connection
        setTimeout(() => {
          setConnectedDevices(prev => [...prev, 'Apple HealthKit']);
          setHealthData(prev => ({
            ...prev,
            heartRate: 72,
            bloodPressure: { systolic: 120, diastolic: 80 },
            steps: 8450,
            calories: 342,
            sleepDuration: 7.5,
            oxygenSaturation: 98,
            lastSync: new Date()
          }));
          setIsConnecting(null);
        }, 2000);
      } else {
        throw new Error('Apple HealthKit not available on this device');
      }
    } catch (error) {
      console.error('Apple HealthKit connection failed:', error);
      setIsConnecting(null);
    }
  };

  // Google Fit Integration
  const connectGoogleFit = async () => {
    setIsConnecting('google');
    try {
      if (isGoogleFitAvailable()) {
        // Initialize Google Fit API
        const scope = 'https://www.googleapis.com/auth/fitness.heart_rate.read ' +
                     'https://www.googleapis.com/auth/fitness.blood_pressure.read ' +
                     'https://www.googleapis.com/auth/fitness.activity.read ' +
                     'https://www.googleapis.com/auth/fitness.sleep.read';

        // This would use the actual Google Fit API
        console.log('Connecting to Google Fit with scopes:', scope);
        
        // Simulate connection
        setTimeout(() => {
          setConnectedDevices(prev => [...prev, 'Google Fit']);
          setHealthData(prev => ({
            ...prev,
            heartRate: 68,
            steps: 9200,
            calories: 385,
            lastSync: new Date()
          }));
          setIsConnecting(null);
        }, 2000);
      } else {
        throw new Error('Google Fit not available on this device');
      }
    } catch (error) {
      console.error('Google Fit connection failed:', error);
      setIsConnecting(null);
    }
  };

  // Samsung Health Integration
  const connectSamsungHealth = async () => {
    setIsConnecting('samsung');
    try {
      if (isSamsungHealthAvailable()) {
        // Samsung Health SDK integration
        console.log('Connecting to Samsung Health');
        
        // Simulate connection
        setTimeout(() => {
          setConnectedDevices(prev => [...prev, 'Samsung Health']);
          setHealthData(prev => ({
            ...prev,
            heartRate: 75,
            bloodPressure: { systolic: 118, diastolic: 78 },
            steps: 7890,
            sleepDuration: 8.2,
            lastSync: new Date()
          }));
          setIsConnecting(null);
        }, 2000);
      } else {
        throw new Error('Samsung Health not available on this device');
      }
    } catch (error) {
      console.error('Samsung Health connection failed:', error);
      setIsConnecting(null);
    }
  };

  // Fitbit Integration
  const connectFitbit = async () => {
    setIsConnecting('fitbit');
    try {
      // Fitbit Web API integration
      const clientId = 'YOUR_FITBIT_CLIENT_ID';
      const redirectUri = encodeURIComponent(window.location.origin + '/fitbit-callback');
      const scope = 'heartrate activity sleep profile weight';
      
      const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      console.log('Redirecting to Fitbit OAuth:', authUrl);
      
      // In a real implementation, this would redirect to Fitbit OAuth
      // For demo purposes, simulate connection
      setTimeout(() => {
        setConnectedDevices(prev => [...prev, 'Fitbit']);
        setHealthData(prev => ({
          ...prev,
          heartRate: 70,
          steps: 10500,
          calories: 420,
          sleepDuration: 7.8,
          lastSync: new Date()
        }));
        setIsConnecting(null);
      }, 2000);
    } catch (error) {
      console.error('Fitbit connection failed:', error);
      setIsConnecting(null);
    }
  };

  // Disconnect device
  const disconnectDevice = (deviceName: string) => {
    setConnectedDevices(prev => prev.filter(device => device !== deviceName));
  };

  const wearableDevices = [
    {
      name: 'Apple HealthKit',
      icon: '🍎',
      description: 'iPhone & Apple Watch integration',
      available: isAppleHealthKitAvailable(),
      connect: connectAppleHealthKit,
      color: 'from-gray-800 to-gray-600'
    },
    {
      name: 'Google Fit',
      icon: '📱',
      description: 'Android & Wear OS devices',
      available: isGoogleFitAvailable(),
      connect: connectGoogleFit,
      color: 'from-green-500 to-green-700'
    },
    {
      name: 'Samsung Health',
      icon: '⌚',
      description: 'Galaxy Watch & Samsung devices',
      available: isSamsungHealthAvailable(),
      connect: connectSamsungHealth,
      color: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Fitbit',
      icon: '🏃',
      description: 'Fitbit trackers & smartwatches',
      available: isFitbitAvailable(),
      connect: connectFitbit,
      color: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">⌚ Wearable Device Integration</h2>
        <p className="text-indigo-100">Connect your devices for real-time health monitoring</p>
      </div>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedDevices.map((device) => (
              <div key={device} className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-green-800">{device}</h4>
                    <p className="text-sm text-green-600">✓ Connected & Syncing</p>
                  </div>
                  <button
                    onClick={() => disconnectDevice(device)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Data Dashboard */}
      {Object.keys(healthData).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Latest Health Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthData.heartRate && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-2xl font-bold text-red-700">{healthData.heartRate} BPM</p>
                  </div>
                  <span className="text-2xl">❤️</span>
                </div>
              </div>
            )}
            
            {healthData.bloodPressure && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
                    </p>
                  </div>
                  <span className="text-2xl">🩺</span>
                </div>
              </div>
            )}
            
            {healthData.steps && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Steps Today</p>
                    <p className="text-2xl font-bold text-green-700">{healthData.steps.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">👟</span>
                </div>
              </div>
            )}
            
            {healthData.sleepDuration && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sleep Duration</p>
                    <p className="text-2xl font-bold text-purple-700">{healthData.sleepDuration}h</p>
                  </div>
                  <span className="text-2xl">😴</span>
                </div>
              </div>
            )}
          </div>
          
          {healthData.lastSync && (
            <p className="text-sm text-gray-500 mt-4">
              Last synced: {healthData.lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Available Devices */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wearableDevices.map((device) => (
            <div key={device.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{device.icon}</span>
                  <div>
                    <h4 className="font-medium">{device.name}</h4>
                    <p className="text-sm text-gray-600">{device.description}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  device.available ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              
              {connectedDevices.includes(device.name) ? (
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm font-medium">
                  ✓ Connected
                </div>
              ) : (
                <button
                  onClick={device.connect}
                  disabled={isConnecting === device.name.toLowerCase().split(' ')[0] || !device.available}
                  className={`w-full bg-gradient-to-r ${device.color} text-white py-2 px-4 rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
                >
                  {isConnecting === device.name.toLowerCase().split(' ')[0] ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    `Connect ${device.name}`
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manual Health Data Entry */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Manual Health Data Entry</h3>
        <p className="text-gray-600 mb-4">Enter health data manually if you don't have a compatible device</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="number" placeholder="Heart Rate (BPM)" className="border rounded-lg px-3 py-2" />
          <input type="text" placeholder="Blood Pressure (e.g., 120/80)" className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Steps Count" className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Weight (kg)" className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Sleep Hours" className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Temperature (°F)" className="border rounded-lg px-3 py-2" />
        </div>
        <button className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600">
          Save Health Data
        </button>
      </div>
    </div>
  );
}