import Dashboard from '@/components/PatientDashboard';

export default function AdminDashboardPage() {
  return <Dashboard user={{ userType: 'admin', name: 'Admin User' }} />;
}
