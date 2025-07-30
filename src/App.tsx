import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import PatientDashboard from './components/dashboards/PatientDashboard';
import ASHADashboard from './components/dashboards/ASHADashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import LoginPage from './components/LoginPage';
import TeamManagement from './components/TeamManagement';
import SystemStatus from './components/SystemStatus';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { ABHAProvider } from './contexts/ABHAContext';

interface User {
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(true);
  const { currentAdmin, logoutAdmin, loginAdmin } = useAdmin();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const languageOptions = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
    { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kannada', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'odia', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'assamese', name: 'অসমীয়া', flag: '🇮🇳' }
  ];

  const handleLogin = (userType: 'patient' | 'asha' | 'doctor' | 'admin', userInfo: any) => {
    const newUser = {
      userType,
      name: userInfo.name,
      phone: userInfo.phone,
      email: userInfo.email,
      role: userInfo.role
    };
    
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    
    // If admin login, also authenticate in AdminContext
    if (userType === 'admin') {
      const identifier = userInfo.email || userInfo.phone || userInfo.phoneNumber;
      if (identifier) {
        setTimeout(async () => {
          try {
            await loginAdmin(identifier, userInfo, 'dummy123');
          } catch (error) {
            console.log('Admin context login error:', error);
          }
        }, 0);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowTeamManagement(false);
    if (currentUser?.userType === 'admin') {
      logoutAdmin();
    }
  };

  // Don't force early return - let the component render the main content
  if (!isLoggedIn || !currentUser) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <LoginPage onLogin={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {currentUser.userType === 'patient' && (
          <PatientDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'asha' && (
          <ASHADashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'doctor' && (
          <DoctorDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'admin' && (
          <AdminDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        
        {/* Team Management Modal */}
        {showTeamManagement && (
          <TeamManagement onClose={() => setShowTeamManagement(false)} />
        )}
        
        {/* System Status Notification */}
        {showSystemStatus && (
          <SystemStatus onClose={() => setShowSystemStatus(false)} />
        )}
      </View>
    </View>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <ABHAProvider>
          <AppContent />
        </ABHAProvider>
      </AdminProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mainContent: {
    flex: 1,
  },
});

export default App;
