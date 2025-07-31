import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface ASHADashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function ASHADashboard({ userInfo, onLogout }: ASHADashboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ASHA Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {userInfo.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community Health Overview</Text>
          <Text style={styles.cardText}>Registered Families: 150</Text>
          <Text style={styles.cardText}>Monthly Checkups: 45</Text>
          <Text style={styles.cardText}>Vaccination Due: 12</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Tasks</Text>
          <Text style={styles.cardText}>• Home visit to Family #1234</Text>
          <Text style={styles.cardText}>• Child vaccination follow-up</Text>
          <Text style={styles.cardText}>• Pregnancy counseling session</Text>
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
    backgroundColor: '#10b981',
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
    color: '#a7f3d0',
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