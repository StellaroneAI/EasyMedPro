import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';

// Eagerly load common pages
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';

// Lazy-load heavy dashboard components
const PatientDashboard = React.lazy(() => import('@/pages/patient/PatientDashboard'));
const DoctorDashboard = React.lazy(() => import('@/pages/doctor/DoctorDashboard'));
const ASHAWorkerHub = React.lazy(() => import('@/pages/asha/ASHAWorkerHub'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));

const FullPageLoader = () => (
  <div className="w-full min-h-screen p-8">
    <Skeleton className="h-16 w-full mb-8" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/asha/hub" element={<ASHAWorkerHub />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Redirect any other path to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;