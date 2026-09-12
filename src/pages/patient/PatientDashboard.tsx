import Dashboard from '@/components/PatientDashboard';

export default function PatientDashboardPage() {
  return <Dashboard user={{ userType: 'patient', name: 'Patient User' }} />;
}
