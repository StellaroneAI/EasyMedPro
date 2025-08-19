import { useState } from 'react';
import PatientDashboard from './components/PatientDashboard';
import ASHAWorkerHub from './components/ASHAWorkerHub';
import DoctorDashboard from './components/dashboards/DoctorSpecificDashboard';
import AdminDashboard from './components/dashboards/AdminSpecificDashboard';
import LoginPage from './components/LoginPage';
import TeamManagement from './components/TeamManagement';
import SystemStatus from './components/SystemStatus';
import AI4BharatVoiceAssistant from './components/AI4BharatVoiceAssistant';
import CriticalFixesTester from './components/CriticalFixesTester';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import HomePage from './pages/HomePage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { LanguageKey } from './translations/index';
import './App.css';

interface User {
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showHome, setShowHome] = useState(true);

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
  };

  if (showHome && !isLoggedIn) {
    return <HomePage onNavigateToLogin={() => setShowHome(false)} />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // This will be replaced with the full dashboard later
  return <h1>Welcome, {currentUser?.name}!</h1>;
}

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
