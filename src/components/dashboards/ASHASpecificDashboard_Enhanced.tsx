import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import SimpleVoiceAssistant from '../SimpleVoiceAssistant';
import LanguageSelector from '../LanguageSelector';
import LanguageDebugger from '../LanguageDebugger';

interface ASHASpecificDashboardProps {
  user: {
    userType: 'asha';
    name: string;
  };
}

type ASHATabType = 'community' | 'patients' | 'reports' | 'training' | 'profile';

export default function ASHASpecificDashboard({ user }: ASHASpecificDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ASHATabType>('community');
  const [communityData, setCommunityData] = useState({
    totalHouseholds: 245,
    visitedToday: 18,
    pendingVisits: 12,
    healthSurveys: 34
  });

  // ASHA 5-Tab Navigation: 🏘️ COMMUNITY | 👥 PATIENTS | 📊 REPORTS | 🎓 TRAINING | 👤 PROFILE
  const TabNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {[
          { id: 'community', icon: '🏘️', label: 'COMMUNITY' },
          { id: 'patients', icon: '👥', label: 'PATIENTS' },
          { id: 'reports', icon: '📊', label: 'REPORTS' },
          { id: 'training', icon: '🎓', label: 'TRAINING' },
          { id: 'profile', icon: '👤', label: 'PROFILE' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ASHATabType)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityTab />;
      case 'patients':
        return <PatientsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'training':
        return <TrainingTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <CommunityTab />;
    }
  };

  const CommunityTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">🏘️ Community Health Mapping</h2>
        <p className="text-green-100">GPS-enabled community health management</p>
      </div>
      
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h4 className="text-sm text-gray-600">Total Households</h4>
          <p className="text-2xl font-bold text-gray-800">{communityData.totalHouseholds}</p>
          <p className="text-green-600 text-sm">Your area coverage</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h4 className="text-sm text-gray-600">Visited Today</h4>
          <p className="text-2xl font-bold text-gray-800">{communityData.visitedToday}</p>
          <p className="text-blue-600 text-sm">Home visits completed</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h4 className="text-sm text-gray-600">Pending Visits</h4>
          <p className="text-2xl font-bold text-gray-800">{communityData.pendingVisits}</p>
          <p className="text-orange-600 text-sm">Scheduled for today</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h4 className="text-sm text-gray-600">Health Surveys</h4>
          <p className="text-2xl font-bold text-gray-800">{communityData.healthSurveys}</p>
          <p className="text-purple-600 text-sm">This month</p>
        </div>
      </div>
      
      {/* Community Map */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Community Health Map</h3>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <span className="text-4xl mb-4 block">🗺️</span>
          <p className="text-gray-600">GPS-enabled community mapping</p>
          <p className="text-sm text-gray-500 mt-2">Click to view interactive map of your assigned area</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            View Interactive Map
          </button>
        </div>
      </div>
      
      {/* Today's Route */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Today's Visit Route</h3>
        <div className="space-y-3">
          {[
            { house: 'House #23, Gandhi Nagar', family: 'Sharma Family', status: 'completed', time: '9:00 AM' },
            { house: 'House #45, Main Street', family: 'Patel Family', status: 'in-progress', time: '10:30 AM' },
            { house: 'House #67, Village Square', family: 'Kumar Family', status: 'pending', time: '11:45 AM' },
            { house: 'House #89, River Side', family: 'Singh Family', status: 'pending', time: '1:00 PM' }
          ].map((visit, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{visit.house}</h4>
                <p className="text-sm text-gray-600">{visit.family}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{visit.time}</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                  visit.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {visit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PatientsTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">👥 Patient Data Collection</h2>
        <p className="text-blue-100">Offline-first health data forms</p>
      </div>
      
      {/* Data Collection Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Health Survey</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Patient Name" className="border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Age" className="border rounded-lg px-3 py-2" />
            </div>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>Select Health Concern</option>
              <option>Maternal Health</option>
              <option>Child Immunization</option>
              <option>Diabetes Screening</option>
              <option>Hypertension Check</option>
              <option>TB Screening</option>
            </select>
            <textarea 
              placeholder="Additional notes..."
              className="w-full border rounded-lg px-3 py-2 h-20"
            ></textarea>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Save Data (Offline Enabled)
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Vital Signs Recorder</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Blood Pressure" className="border rounded-lg px-3 py-2" />
              <input type="text" placeholder="Temperature" className="border rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Weight (kg)" className="border rounded-lg px-3 py-2" />
              <input type="text" placeholder="Height (cm)" className="border rounded-lg px-3 py-2" />
            </div>
            <input type="text" placeholder="Blood Sugar Level" className="border rounded-lg px-3 py-2 w-full" />
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
              Record Vitals
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Patient Records */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Patient Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Patient Name</th>
                <th className="text-left p-2">Age</th>
                <th className="text-left p-2">Health Concern</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Radha Devi', age: 34, concern: 'Maternal Health', date: 'Today', status: 'Referred' },
                { name: 'Arjun Kumar', age: 8, concern: 'Immunization', date: 'Yesterday', status: 'Completed' },
                { name: 'Prakash Singh', age: 52, concern: 'Diabetes Check', date: '2 days ago', status: 'Follow-up' }
              ].map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{record.name}</td>
                  <td className="p-2">{record.age}</td>
                  <td className="p-2">{record.concern}</td>
                  <td className="p-2">{record.date}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'Referred' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📊 Health Authority Reports</h2>
        <p className="text-purple-100">Submit reports to health authorities</p>
      </div>
      
      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Weekly Community Report', description: 'Summary of community health activities', icon: '📋', urgent: false },
          { title: 'Disease Outbreak Alert', description: 'Report suspected disease cases', icon: '🚨', urgent: true },
          { title: 'Immunization Coverage', description: 'Child immunization status report', icon: '💉', urgent: false },
          { title: 'Maternal Health Report', description: 'Pregnant women health tracking', icon: '🤰', urgent: false },
          { title: 'Medicine Stock Report', description: 'Medicine availability and requests', icon: '💊', urgent: false },
          { title: 'Emergency Response', description: 'Medical emergency cases handled', icon: '🚑', urgent: true }
        ].map((report, index) => (
          <div key={index} className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
            report.urgent ? 'border-red-500' : 'border-blue-500'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{report.icon}</span>
              {report.urgent && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Urgent</span>}
            </div>
            <h4 className="font-semibold mb-2">{report.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
            <button className={`w-full py-2 rounded text-sm font-medium ${
              report.urgent 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}>
              Create Report
            </button>
          </div>
        ))}
      </div>
      
      {/* Recent Reports */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
        <div className="space-y-3">
          {[
            { title: 'Weekly Community Report - Week 47', date: '2 days ago', status: 'Approved' },
            { title: 'Immunization Coverage Report', date: '1 week ago', status: 'Under Review' },
            { title: 'Disease Outbreak Alert - Fever Cases', date: '2 weeks ago', status: 'Approved' }
          ].map((submission, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{submission.title}</h4>
                <p className="text-sm text-gray-600">{submission.date}</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                submission.status === 'Approved' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TrainingTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">🎓 Training & Skill Development</h2>
        <p className="text-orange-100">Continuous learning and capacity building</p>
      </div>
      
      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Available Courses</h3>
          <div className="space-y-3">
            {[
              { title: 'Digital Health Tools', progress: 85, duration: '2 hours' },
              { title: 'Maternal & Child Health', progress: 100, duration: '3 hours' },
              { title: 'Community Health Screening', progress: 60, duration: '1.5 hours' },
              { title: 'Emergency Response Protocols', progress: 0, duration: '2.5 hours' }
            ].map((course, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{course.title}</h4>
                  <span className="text-sm text-gray-600">{course.duration}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{course.progress}% Complete</span>
                  <button className={`font-medium ${
                    course.progress === 100 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {course.progress === 100 ? 'Certificate' : 'Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Certificates Earned</h3>
          <div className="space-y-3">
            {[
              { title: 'Basic Health Screening', date: 'Nov 2024', level: 'Foundation' },
              { title: 'Digital Health Literacy', date: 'Oct 2024', level: 'Advanced' },
              { title: 'Community Mobilization', date: 'Sep 2024', level: 'Intermediate' }
            ].map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{cert.title}</h4>
                  <p className="text-sm text-gray-600">{cert.date}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    cert.level === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                    cert.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {cert.level}
                  </span>
                  <p className="text-sm text-blue-600 mt-1 cursor-pointer">Download</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Upcoming Training Sessions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Upcoming Training Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Mental Health Awareness', date: 'Dec 15, 2024', time: '10:00 AM', mode: 'Virtual' },
            { title: 'Digital Health Record Management', date: 'Dec 20, 2024', time: '2:00 PM', mode: 'In-person' }
          ].map((session, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{session.title}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📅 {session.date}</p>
                <p>🕐 {session.time}</p>
                <p>📍 {session.mode}</p>
              </div>
              <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">👤 ASHA Worker Profile</h2>
        <p className="text-gray-300">Personal information and settings</p>
      </div>
      
      {/* Profile Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              value={user.name}
              className="w-full border rounded-lg px-3 py-2"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ASHA ID</label>
            <input 
              type="text" 
              value="ASHA001234"
              className="w-full border rounded-lg px-3 py-2"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Area</label>
            <input 
              type="text" 
              value="Gandhi Nagar Ward 5"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Population Coverage</label>
            <input 
              type="text" 
              value="1,200 residents"
              className="w-full border rounded-lg px-3 py-2"
              readOnly
            />
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold">Houses Covered</h4>
            <p className="text-2xl font-bold text-green-600">98%</p>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold">Health Surveys</h4>
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⭐</span>
            </div>
            <h4 className="font-semibold">Community Rating</h4>
            <p className="text-2xl font-bold text-purple-600">4.8/5</p>
            <p className="text-sm text-gray-600">Feedback score</p>
          </div>
        </div>
      </div>
      
      {/* Language & Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Language & App Settings</h3>
        <LanguageSelector />
        <div className="mt-4">
          <LanguageDebugger />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {renderTabContent()}
      </div>
      <TabNavigation />
    </div>
  );
}