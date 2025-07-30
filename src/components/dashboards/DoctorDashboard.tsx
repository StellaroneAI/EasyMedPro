import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface DoctorDashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function DoctorDashboard({ userInfo, onLogout }: DoctorDashboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {userInfo.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          <Text style={styles.cardText}>Total Appointments: 12</Text>
          <Text style={styles.cardText}>Video Consultations: 8</Text>
          <Text style={styles.cardText}>In-person Visits: 4</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Actions</Text>
          <Text style={styles.cardText}>• Review Lab Results: 5</Text>
          <Text style={styles.cardText}>• Prescription Updates: 3</Text>
          <Text style={styles.cardText}>• Patient Follow-ups: 7</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Patients</Text>
          <Text style={styles.cardText}>• John Doe - Diabetes Check</Text>
          <Text style={styles.cardText}>• Jane Smith - Hypertension Follow-up</Text>
          <Text style={styles.cardText}>• Bob Johnson - Annual Physical</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd6fe',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});