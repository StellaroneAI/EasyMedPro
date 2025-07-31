import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface PatientDashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function PatientDashboard({ userInfo, onLogout }: PatientDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Patient Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {userInfo.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['overview', 'appointments', 'vitals', 'medications'].map((section) => (
            <TouchableOpacity
              key={section}
              style={[
                styles.navItem,
                activeSection === section && styles.activeNavItem
              ]}
              onPress={() => setActiveSection(section)}
            >
              <Text style={[
                styles.navText,
                activeSection === section && styles.activeNavText
              ]}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeSection === 'overview' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Overview</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Vitals</Text>
              <Text style={styles.cardText}>Blood Pressure: 120/80 mmHg</Text>
              <Text style={styles.cardText}>Heart Rate: 72 bpm</Text>
              <Text style={styles.cardText}>Temperature: 98.6°F</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Next Appointment</Text>
              <Text style={styles.cardText}>Dr. Rajesh Kumar</Text>
              <Text style={styles.cardText}>Jan 30, 2025 - 10:00 AM</Text>
            </View>
          </View>
        )}

        {activeSection === 'appointments' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upcoming</Text>
              <Text style={styles.cardText}>Dr. Rajesh Kumar - Jan 30, 10:00 AM</Text>
              <Text style={styles.cardText}>Dr. Priya Sharma - Feb 5, 2:00 PM</Text>
            </View>
          </View>
        )}

        {activeSection === 'vitals' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vital Signs</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Latest Readings</Text>
              <Text style={styles.cardText}>Blood Pressure: 120/80 mmHg</Text>
              <Text style={styles.cardText}>Heart Rate: 72 bpm</Text>
              <Text style={styles.cardText}>Weight: 70 kg</Text>
              <Text style={styles.cardText}>BMI: 22.5</Text>
            </View>
          </View>
        )}

        {activeSection === 'medications' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Medications</Text>
              <Text style={styles.cardText}>Metformin - 500mg - Twice daily</Text>
              <Text style={styles.cardText}>Lisinopril - 10mg - Once daily</Text>
            </View>
          </View>
        )}
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
    backgroundColor: '#3b82f6',
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
    color: '#bfdbfe',
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
  navigation: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeNavItem: {
    backgroundColor: '#3b82f6',
  },
  navText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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