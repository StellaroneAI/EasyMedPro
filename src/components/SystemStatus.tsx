import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface SystemStatusProps {
  onClose: () => void;
}

export default function SystemStatus({ onClose }: SystemStatusProps) {
  return (
    <Modal visible={true} animationType="fade" transparent={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>System Status</Text>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusGreen]} />
            <Text style={styles.statusText}>All systems operational</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusGreen]} />
            <Text style={styles.statusText}>Database connection: Healthy</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusGreen]} />
            <Text style={styles.statusText}>API services: Running</Text>
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
    maxWidth: 350,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusGreen: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});