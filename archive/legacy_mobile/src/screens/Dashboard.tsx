import React from 'react';
import { ScrollView, View } from 'react-native';
import StatsCards from '../components/StatsCards';
import TodaySchedule from '../components/TodaySchedule';
import QuickActions from '../components/QuickActions';
import AiAssistant from '../components/AiAssistant';
import RecentActivities from '../components/RecentActivities';
import PatientList from '../components/PatientList';
import MedicalRecords from '../components/MedicalRecords';
import PrescriptionManagement from '../components/PrescriptionManagement';

export default function DashboardScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <StatsCards />
      <TodaySchedule />
      <View>
        <QuickActions />
        <AiAssistant />
        <RecentActivities />
      </View>
      <PatientList />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <MedicalRecords />
        <PrescriptionManagement />
      </View>
    </ScrollView>
  );
}
