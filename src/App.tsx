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
import LanguageToggle from './components/LanguageToggle';

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

  // Route to appropriate dashboard based on user type
  switch (currentUser?.userType) {
    case 'patient':
      return <PatientDashboard user={currentUser} />;
    case 'asha':
      return <ASHAWorkerHub />;
    case 'doctor':
      return <DoctorDashboard user={currentUser as any} />;
    case 'admin':
      return <AdminDashboard 
        userInfo={currentUser as any} 
        onLogout={() => {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setShowHome(true);
        }} 
      />;
    default:
      return <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome, {currentUser?.name}!</h1>
        <button 
          onClick={() => {
            setCurrentUser(null);
            setIsLoggedIn(false);
            setShowHome(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Logout
        </button>
      </div>;
  }
}

function App() {
  return (
    <LanguageProvider>
      <div className="p-2 text-right"><LanguageToggle /></div>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
