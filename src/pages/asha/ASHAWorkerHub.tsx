import Dashboard from '@/components/PatientDashboard';

export default function ASHAWorkerHubPage() {
  return <Dashboard user={{ userType: 'asha', name: 'ASHA Worker' }} />;
}
