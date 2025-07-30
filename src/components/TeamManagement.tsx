import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface TeamManagementProps {
  onClose: () => void;
}

export default function TeamManagement({ onClose }: TeamManagementProps) {
  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Team Management</Text>
          <Text style={styles.subtitle}>Manage your healthcare team</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <Text style={styles.memberText}>• Dr. Rajesh Kumar - General Medicine</Text>
            <Text style={styles.memberText}>• Nurse Priya - Primary Care</Text>
            <Text style={styles.memberText}>• ASHA Worker Sunita - Community Health</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  memberText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});