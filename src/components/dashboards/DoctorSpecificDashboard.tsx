import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import RemotePatientMonitoring from '../RemotePatientMonitoring';
import TelemedicineConsultation from '../TelemedicineConsultation';

interface DoctorSpecificDashboardProps {
  user: {
    userType: 'doctor';
    name: string;
  };
}

type DoctorTabType = 'schedule' | 'patients' | 'rpm' | 'prescribe' | 'telemedicine';

export default function DoctorSpecificDashboard({ user }: DoctorSpecificDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<DoctorTabType>('rpm'); // Default to RPM dashboard
  const [criticalAlerts, setCriticalAlerts] = useState([
    { id: 1, patient: 'Mr. Gupta', type: 'High BP', value: '180/110', time: '2 mins ago', severity: 'critical' },
    { id: 2, patient: 'Mrs. Sharma', type: 'Low SpO2', value: '88%', time: '5 mins ago', severity: 'warning' },
    { id: 3, patient: 'Mr. Kumar', type: 'Irregular HR', value: '110 BPM', time: '10 mins ago', severity: 'medium' }
  ]);

  // Doctor 5-Tab Navigation: 📅 SCHEDULE | 👥 PATIENTS | 📊 RPM DASHBOARD | 💊 PRESCRIBE | 📞 TELEMEDICINE
  const TabNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {[
          { id: 'schedule', icon: '📅', label: 'SCHEDULE' },
          { id: 'patients', icon: '👥', label: 'PATIENTS' },
          { id: 'rpm', icon: '📊', label: 'RPM DASHBOARD' },
          { id: 'prescribe', icon: '💊', label: 'PRESCRIBE' },
          { id: 'telemedicine', icon: '📞', label: 'TELEMEDICINE' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DoctorTabType)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-teal-50 text-teal-600' 
                : 'text-gray-600 hover:text-teal-600'
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
      case 'schedule':
        return <ScheduleTab />;
      case 'patients':
        return <PatientsTab />;
      case 'rpm':
        return <RPMDashboardTab />;
      case 'prescribe':
        return <PrescribeTab />;
      case 'telemedicine':
        return <TelemedicineTab />;
      default:
        return <RPMDashboardTab />;
    }
  };

  const ScheduleTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📅 Today's Schedule</h2>
        <p className="text-blue-100">Manage your appointments and consultations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {[
            { time: '09:00 AM', patient: 'Mrs. Patel', type: 'Regular Checkup', status: 'confirmed' },
            { time: '10:30 AM', patient: 'Mr. Singh', type: 'Follow-up', status: 'in-progress' },
            { time: '11:15 AM', patient: 'Ms. Reddy', type: 'Consultation', status: 'waiting' },
            { time: '02:00 PM', patient: 'Mr. Kumar', type: 'RPM Review', status: 'scheduled' }
          ].map((appointment, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{appointment.patient}</h3>
                  <p className="text-gray-600 text-sm">{appointment.type}</p>
                  <p className="text-blue-600 font-medium">{appointment.time}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Today's Patients</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining</span>
              <span className="font-semibold text-blue-600">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PatientsTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">👥 Patient Management</h2>
        <p className="text-green-100">View and manage your patient roster</p>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">My Patients</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Add New Patient
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Mr. Gupta', age: 45, condition: 'Hypertension', lastVisit: '2 days ago', status: 'stable' },
            { name: 'Mrs. Sharma', age: 52, condition: 'Diabetes Type 2', lastVisit: '1 week ago', status: 'needs-attention' },
            { name: 'Mr. Kumar', age: 38, condition: 'Cardiac Monitor', lastVisit: '3 days ago', status: 'critical' }
          ].map((patient, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{patient.name}</h4>
                <span className={`w-3 h-3 rounded-full ${
                  patient.status === 'stable' ? 'bg-green-500' :
                  patient.status === 'needs-attention' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></span>
              </div>
              <p className="text-gray-600 text-sm">Age: {patient.age}</p>
              <p className="text-gray-600 text-sm">{patient.condition}</p>
              <p className="text-gray-500 text-xs mt-2">Last visit: {patient.lastVisit}</p>
              <button className="mt-3 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RPMDashboardTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📊 Remote Patient Monitoring</h2>
        <p className="text-red-100">Real-time vitals and critical health alerts</p>
      </div>
      
      {/* Critical Alerts */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-red-600">🚨 Critical Alerts</h3>
        <div className="space-y-3">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className={`border-l-4 p-4 rounded ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-orange-500 bg-orange-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{alert.patient}</h4>
                  <p className="text-gray-600">{alert.type}: <span className="font-medium">{alert.value}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{alert.time}</p>
                  <button className="mt-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Patient Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { patient: 'Mr. Gupta', hr: 72, bp: '120/80', spo2: 98, temp: 98.6, status: 'normal' },
          { patient: 'Mrs. Sharma', hr: 88, bp: '140/90', spo2: 95, temp: 99.2, status: 'elevated' },
          { patient: 'Mr. Kumar', hr: 110, bp: '160/100', spo2: 88, temp: 100.4, status: 'critical' }
        ].map((vitals, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-t-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold">{vitals.patient}</h4>
              <span className={`w-3 h-3 rounded-full ${
                vitals.status === 'normal' ? 'bg-green-500' :
                vitals.status === 'elevated' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">HR:</span> {vitals.hr} BPM
              </div>
              <div>
                <span className="text-gray-600">BP:</span> {vitals.bp}
              </div>
              <div>
                <span className="text-gray-600">SpO2:</span> {vitals.spo2}%
              </div>
              <div>
                <span className="text-gray-600">Temp:</span> {vitals.temp}°F
              </div>
            </div>
            <button className="mt-3 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-sm font-medium">
              View Trends
            </button>
          </div>
        ))}
      </div>
      
      {/* RPM Component */}
      <RemotePatientMonitoring 
        doctorView={true}
        patientId="all"
        patientName="All Patients"
      />
    </div>
  );

  const PrescribeTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">💊 Digital Prescription</h2>
        <p className="text-purple-100">Create and manage prescriptions with AI suggestions</p>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Prescribe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>Mr. Gupta - Hypertension</option>
              <option>Mrs. Sharma - Diabetes</option>
              <option>Mr. Kumar - Cardiac</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
            <input 
              type="text" 
              placeholder="Start typing medication name..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-3">AI Suggestions Based on Patient History</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { drug: 'Lisinopril 10mg', indication: 'Hypertension', interaction: 'safe' },
              { drug: 'Metformin 500mg', indication: 'Diabetes', interaction: 'safe' },
              { drug: 'Aspirin 81mg', indication: 'Cardio Protection', interaction: 'caution' }
            ].map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <h5 className="font-medium">{suggestion.drug}</h5>
                <p className="text-sm text-gray-600">{suggestion.indication}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  suggestion.interaction === 'safe' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {suggestion.interaction}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TelemedicineTab = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">📞 Telemedicine Platform</h2>
        <p className="text-teal-100">Video consultations and remote care</p>
      </div>
      
      <TelemedicineConsultation 
        doctorId={user.name}
        doctorName={user.name}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Scheduled Calls Today</h3>
          <div className="space-y-3">
            {[
              { time: '11:30 AM', patient: 'Mrs. Patel', type: 'Follow-up', status: 'upcoming' },
              { time: '02:15 PM', patient: 'Mr. Singh', type: 'Consultation', status: 'upcoming' },
              { time: '04:00 PM', patient: 'Ms. Reddy', type: 'Review', status: 'scheduled' }
            ].map((call, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">{call.patient}</h4>
                  <p className="text-sm text-gray-600">{call.type} - {call.time}</p>
                </div>
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Join Call
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Call History</h3>
          <div className="space-y-2">
            {[
              { patient: 'Mr. Kumar', duration: '15 min', date: 'Today 9:00 AM' },
              { patient: 'Mrs. Gupta', duration: '22 min', date: 'Yesterday 3:30 PM' },
              { patient: 'Mr. Sharma', duration: '18 min', date: 'Yesterday 11:00 AM' }
            ].map((call, index) => (
              <div key={index} className="flex justify-between items-center p-2 text-sm">
                <div>
                  <span className="font-medium">{call.patient}</span>
                  <span className="text-gray-600 ml-2">({call.duration})</span>
                </div>
                <span className="text-gray-500">{call.date}</span>
              </div>
            ))}
          </div>
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
