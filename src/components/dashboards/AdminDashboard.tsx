import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface AdminDashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function AdminDashboard({ userInfo, onLogout }: AdminDashboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {userInfo.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Overview</Text>
          <Text style={styles.cardText}>Total Users: 1,247</Text>
          <Text style={styles.cardText}>Active Doctors: 45</Text>
          <Text style={styles.cardText}>ASHA Workers: 89</Text>
          <Text style={styles.cardText}>Registered Patients: 1,113</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform Statistics</Text>
          <Text style={styles.cardText}>Daily Consultations: 156</Text>
          <Text style={styles.cardText}>Emergency Calls: 12</Text>
          <Text style={styles.cardText}>System Uptime: 99.8%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardText}>• New doctor registration: Dr. Priya</Text>
          <Text style={styles.cardText}>• System maintenance completed</Text>
          <Text style={styles.cardText}>• Database backup successful</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>System Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f59e0b',
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
    color: '#fde68a',
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
  actionButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});