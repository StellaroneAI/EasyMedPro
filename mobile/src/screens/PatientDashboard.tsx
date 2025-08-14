import React from 'react';
import { ScrollView } from 'react-native';
import VoiceAssistant from '../components/VoiceAssistant';
import Appointments from '../components/Appointments';
import Vitals from '../components/Vitals';
import ABHAIntegration from '../components/ABHAIntegration';
import FamilyManagement from '../components/FamilyManagement';
import TelemedicineConsultation from '../components/TelemedicineConsultation';
import InsuranceClaims from '../components/InsuranceClaims';
import ASHAWorkerHub from '../components/ASHAWorkerHub';
import RemotePatientMonitoring from '../components/RemotePatientMonitoring';
import PatientEducationLibrary from '../components/PatientEducationLibrary';
import FloatingNavigation from '../components/FloatingNavigation';
import AIChatAssistant from '../components/AIChatAssistant';
import MovableFloatingButton from '../components/MovableFloatingButton';

export default function PatientDashboardScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <VoiceAssistant />
      <Appointments />
      <Vitals />
      <ABHAIntegration />
      <FamilyManagement />
      <TelemedicineConsultation />
      <InsuranceClaims />
      <ASHAWorkerHub />
      <RemotePatientMonitoring />
      <PatientEducationLibrary />
      <FloatingNavigation />
      <AIChatAssistant />
      <MovableFloatingButton />
    </ScrollView>
  );
}
