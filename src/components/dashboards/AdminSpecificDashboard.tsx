import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import OTPDiagnosticPanel from './OTPDiagnosticPanel';
import { useAdmin } from '../../contexts/AdminContext';
import AdminSidebar from '../admin/AdminSidebar';
import UserManagement from '../admin/UserManagement';
import AppointmentManagement from '../admin/AppointmentManagement';
import SystemSettings from '../admin/SystemSettings';
import firebaseUserManagement from '../../services/firebaseUserManagement';

interface AdminSpecificDashboardProps {
  userInfo: {
    userType: 'admin';
    name: string;
    phone?: string;
    email?: string;
  };
  onLogout: () => void;
}

export default function AdminSpecificDashboard({ userInfo, onLogout }: AdminSpecificDashboardProps) {
  const { t } = useLanguage();
  const [showOTPDiagnostic, setShowOTPDiagnostic] = useState(false);
  const { currentAdmin, isSuperAdmin } = useAdmin();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    doctorsCount: 0,
    ashaCount: 0,
    patientsCount: 0,
    systemHealth: 99.2,
    todayAppointments: 0,
    pendingAppointments: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load system statistics
  useEffect(() => {
    const loadSystemStats = async () => {
      try {
        const userStatsResult = await firebaseUserManagement.getUserStats();
        if (userStatsResult.success && userStatsResult.data) {
          const stats = userStatsResult.data;
          setSystemStats(prev => ({
            ...prev,
            totalUsers: stats.total,
            activeUsers: stats.active,
            doctorsCount: stats.byType.doctors,
            ashaCount: stats.byType.asha,
            patientsCount: stats.byType.patients
          }));
        }
      } catch (error) {
        console.error('Error loading system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemStats();

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">👥</span>
          <span className="font-semibold">User Management</span>
        </button>
        
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">📊</span>
          <span className="font-semibold">Analytics Dashboard</span>
        </button>
        
        <button 
          onClick={() => setShowOTPDiagnostic(true)}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
        >
          <span className="text-2xl mb-2 block">🔍</span>
          <span className="font-semibold">OTP Debug Panel</span>
        </button>
        
        <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">⚙️</span>
          <span className="font-semibold">System Settings</span>
        </button>
        
        <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">🔒</span>
          <span className="font-semibold">Security Management</span>
        </button>
      </div>

      {/* StellaroneAI Specific Alert */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl border-2 border-yellow-400">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">⚡</span>
              Emergency OTP Access for StellaroneAI
            </h3>
            <p className="text-blue-100 mt-1">
              Phone: +91 9060328119 | Email: gilboj@gmail.com
            </p>
            <p className="text-yellow-200 text-sm mt-2">
              ✅ Admin whitelist active - OTP bypass enabled for immediate access
            </p>
          </div>
          <button 
            onClick={() => setShowOTPDiagnostic(true)}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <span>🛠️</span>
            <span>Debug OTP Issues</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent System Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-semibold">New ASHA Worker Registration</p>
              <p className="text-sm text-gray-600">Priya Kumari - Patna District</p>
            </div>
            <span className="text-sm font-medium text-blue-600">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-semibold">System Update Completed</p>
              <p className="text-sm text-gray-600">EasyMed v2.1.3 deployed successfully</p>
            </div>
            <span className="text-sm font-medium text-green-600">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <p className="font-semibold">Data Backup Completed</p>
              <p className="text-sm text-gray-600">Daily backup at 2:00 AM</p>
            </div>
            <span className="text-sm font-medium text-purple-600">8 hours ago</span>
          </div>
        </div>
      </div>
    // Set up real-time listeners for user changes
    const unsubscribeUsers = firebaseUserManagement.onUsersChange((users) => {
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        doctorsCount: users.filter(u => u.userType === 'doctor').length,
        ashaCount: users.filter(u => u.userType === 'asha').length,
        patientsCount: users.filter(u => u.userType === 'patient').length
      };
      
      setSystemStats(prev => ({ ...prev, ...stats }));
    });

    // Mock recent activities
    setRecentActivities([
      {
        id: 1,
        type: 'user_registration',
        message: 'New doctor registered: Dr. Amit Sharma',
        time: '2 minutes ago',
        icon: '👨‍⚕️'
      },
      {
        id: 2,
        type: 'appointment',
        message: 'Emergency appointment scheduled',
        time: '5 minutes ago',
        icon: '🚨'
      },
      {
        id: 3,
        type: 'system',
        message: 'System backup completed successfully',
        time: '1 hour ago',
        icon: '💾'
      }
    ]);

    return () => {
      unsubscribeUsers();
    };
  }, []);

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'healthcare':
        return <HealthcareProviderManagement />;
      case 'emergency':
        return <EmergencyManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'security':
        return <SecurityManagement />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Welcome Administrator, {currentAdmin?.name || userInfo.name}</h2>
              <p className="text-indigo-100">
                {isSuperAdmin ? 'Super Administrator' : 'Administrator'} Dashboard - Complete System Control
              </p>
              <div className="mt-4 flex items-center space-x-6 text-sm">
                <span>📱 Phone: {currentAdmin?.phone || userInfo.phone}</span>
                {currentAdmin?.email && <span>📧 Email: {currentAdmin.email}</span>}
                <span>🕒 Last Login: Today</span>
              </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {isLoading ? '...' : systemStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm">
                      {isLoading ? '...' : `${systemStats.activeUsers} active`}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">ASHA Workers</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {isLoading ? '...' : systemStats.ashaCount}
                    </p>
                    <p className="text-blue-600 text-sm">Active in system</p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🩺</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Doctors</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {isLoading ? '...' : systemStats.doctorsCount}
                    </p>
                    <p className="text-purple-600 text-sm">Registered practitioners</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">System Health</p>
                    <p className="text-3xl font-bold text-green-800">{systemStats.systemHealth}%</p>
                    <p className="text-green-600 text-sm">Uptime</p>
                  </div>
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveSection('users')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-3xl mb-3 block">👥</span>
                <span className="font-semibold text-lg">User Management</span>
                <p className="text-sm text-blue-100 mt-1">Manage all users & roles</p>
              </button>
              
              <button 
                onClick={() => setActiveSection('appointments')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-3xl mb-3 block">📅</span>
                <span className="font-semibold text-lg">Appointments</span>
                <p className="text-sm text-green-100 mt-1">Schedule & manage appointments</p>
              </button>
              
              <button 
                onClick={() => setActiveSection('settings')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-3xl mb-3 block">⚙️</span>
                <span className="font-semibold text-lg">System Settings</span>
                <p className="text-sm text-purple-100 mt-1">Configure system preferences</p>
              </button>
              
              <button 
                onClick={() => setActiveSection('analytics')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-3xl mb-3 block">📊</span>
                <span className="font-semibold text-lg">Analytics</span>
                <p className="text-sm text-orange-100 mt-1">View system analytics</p>
              </button>
            </div>

            {/* Recent Activities & Quick Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View All Activities →
                </button>
              </div>

              {/* System Quick Info */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Server Status</span>
                    <span className="text-sm font-medium text-green-600">🟢 Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="text-sm font-medium text-green-600">🟢 Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium text-gray-900">1 hour ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="text-sm font-medium text-gray-900">{systemStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Version</span>
                    <span className="text-sm font-medium text-gray-900">v2.1.0</span>
                  </div>
                </div>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  System Diagnostics →
                </button>
              </div>
            </div>

            {/* Emergency Actions */}
            {isSuperAdmin && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Emergency Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    System Maintenance Mode
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                    Emergency Broadcast
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Force System Backup
                  </button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderDashboardContent()}
      </div>
    </div>
  );
}

// Placeholder components for sections not yet implemented
function HealthcareProviderManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Healthcare Provider Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Healthcare provider management features will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">This section will include clinic management, doctor profiles, and service offerings.</p>
      </div>
    </div>
  );
}

function EmergencyManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Emergency Services Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Emergency services management features will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">This section will include emergency protocols, notification systems, and response coordination.</p>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Comprehensive analytics and reporting features will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">This section will include usage statistics, performance metrics, and detailed reports.</p>
      </div>
    </div>
  );
}

function SecurityManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security & Audit Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Security management and audit logging features will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">This section will include access logs, security settings, and audit trails.</p>
      </div>

      {/* OTP Diagnostic Panel Modal */}
      {showOTPDiagnostic && (
        <OTPDiagnosticPanel onClose={() => setShowOTPDiagnostic(false)} />
      )}
    </div>
  );
}
