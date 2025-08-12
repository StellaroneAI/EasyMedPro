import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import SimpleVoiceAssistant from '../SimpleVoiceAssistant';
import LanguageSelector from '../LanguageSelector';
import LanguageDebugger from '../LanguageDebugger';
import AI4BharatMedicalAssistant from '../AI4BharatMedicalAssistant';
import ConsultationBooking from '../ConsultationBooking';
import RemotePatientMonitoring from '../RemotePatientMonitoring';
import FamilyManagement from '../FamilyManagement';
import EmergencySystem from '../EmergencySystem';
import IoTDeviceIntegration from '../IoTDeviceIntegration';

interface PatientSpecificDashboardProps {
  user: {
    userType: 'patient';
    name: string;
  };
}

type TabType = 'home' | 'ai' | 'appointments' | 'health' | 'profile';

export default function PatientSpecificDashboard({ user }: PatientSpecificDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [familyMembers, setFamilyMembers] = useState([
    { id: '1', name: user.name, relation: 'Self', isActive: true },
    { id: '2', name: 'Mrs. Sharma', relation: 'Mother', isActive: false },
    { id: '3', name: 'Mr. Sharma', relation: 'Father', isActive: false }
  ]);
  const [activeMember, setActiveMember] = useState(familyMembers[0]);

  // 5-Tab Navigation Component
  const TabNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {[
          { id: 'home', icon: '🏠', label: 'HOME' },
          { id: 'ai', icon: '🤖', label: 'AI ASSISTANT' },
          { id: 'appointments', icon: '📅', label: 'APPOINTMENTS' },
          { id: 'health', icon: '📊', label: 'HEALTH MONITOR' },
          { id: 'profile', icon: '👤', label: 'PROFILE' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Family Member Switcher
  const FamilyMemberSwitcher = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Managing health for:</h3>
      <div className="flex space-x-2 overflow-x-auto">
        {familyMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => setActiveMember(member)}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              activeMember.id === member.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {member.name} {member.relation !== 'Self' && `(${member.relation})`}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'ai':
        return <AIAssistantTab />;
      case 'appointments':
        return <AppointmentsTab />;
      case 'health':
        return <HealthMonitorTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  const HomeTab = () => (
    <div className="space-y-6 pb-20">
      <FamilyMemberSwitcher />
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">{t('welcomeBack')}, {activeMember.name}</h2>
        <p className="text-blue-100">{t('healthCompanion')}</p>
        <div className="mt-4 flex items-center space-x-4">
          <button className="bg-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all">
            📱 Install App
          </button>
          <button className="bg-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all">
            🚨 Emergency (108)
          </button>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('heartRate')}</p>
              <p className="text-2xl font-bold text-gray-800">72 BPM</p>
              <p className="text-green-600 text-sm">{t('normal')}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('bloodPressure')}</p>
              <p className="text-2xl font-bold text-gray-800">120/80</p>
              <p className="text-green-600 text-sm">{t('normal')}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🩺</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('nextAppointment')}</p>
              <p className="text-lg font-bold text-gray-800">{t('today3pm')}</p>
              <p className="text-blue-600 text-sm">{t('drSharma')}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('medications')}</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-orange-600 text-sm">{t('dueToday')}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('ai')}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
        >
          <span className="text-2xl mb-2 block">🤖</span>
          <span className="font-semibold text-sm">{t('aiSymptomChecker')}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('appointments')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
        >
          <span className="text-2xl mb-2 block">📅</span>
          <span className="font-semibold text-sm">{t('bookAppointment')}</span>
        </button>
        
        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">🚨</span>
          <span className="font-semibold text-sm">Emergency 108</span>
        </button>

        <button 
          onClick={() => setActiveTab('health')}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
        >
          <span className="text-2xl mb-2 block">📊</span>
          <span className="font-semibold text-sm">Health Trends</span>
        </button>
      </div>

      {/* IoT Device Integration */}
      <IoTDeviceIntegration patientId={activeMember.id} />
    </div>
  );

  const AIAssistantTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">🤖 AI Health Assistant</h2>
        <p className="text-purple-100">Multilingual AI support for health queries</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Health Check</h3>
          <AI4BharatMedicalAssistant 
            userName={activeMember.name}
            patientContext={{
              age: 35,
              gender: 'male',
              chronicConditions: ['diabetes'],
              allergies: []
            }}
          />
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Voice Assistant</h3>
          <p className="text-gray-600 mb-4">Speak in Hindi, Tamil, Telugu, or English</p>
          <SimpleVoiceAssistant />
        </div>
      </div>
      
      {/* Language Support */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Language Support</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['English', 'हिंदी', 'தமிழ்', 'తెలుగు'].map((lang) => (
            <button key={lang} className="p-3 border rounded-lg hover:bg-gray-50 text-center">
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const AppointmentsTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📅 Appointments & Consultations</h2>
        <p className="text-blue-100">Book appointments and join video calls</p>
      </div>
      
      <ConsultationBooking patientId={activeMember.id} />
      
      {/* Emergency Services */}
      <EmergencySystem patientId={activeMember.id} />
    </div>
  );

  const HealthMonitorTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📊 Health Monitor</h2>
        <p className="text-green-100">Real-time health tracking with wearable devices</p>
      </div>
      
      <RemotePatientMonitoring 
        patientId={activeMember.id} 
        patientName={activeMember.name}
      />
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">👤 Profile & Settings</h2>
        <p className="text-gray-300">Manage your health profile and family</p>
      </div>
      
      <FamilyManagement 
        familyMembers={familyMembers}
        onUpdateMembers={setFamilyMembers}
      />
      
      {/* Language Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Language & Settings</h3>
        <LanguageSelector />
        <LanguageDebugger />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {renderTabContent()}
      </div>
      <TabNavigation />
    </div>
  );
}