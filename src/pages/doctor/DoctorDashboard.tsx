import Dashboard from '@/components/PatientDashboard';

export default function DoctorDashboardPage() {
  return <Dashboard user={{ userType: 'doctor', name: 'Doctor User' }} />;
}
