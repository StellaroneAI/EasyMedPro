/**
 * Mobile Services for EasyMedPro
 * Native device features integration using Capacitor
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
import { initializePushNotifications, requestPushPermissions as requestPushPermissionService } from './pushNotificationService';

export interface CameraPhoto {
  dataUrl?: string;
  path?: string;
  webPath?: string;
  format: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface DeviceInfo {
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion?: string;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

class MobileService {
  private isNative: boolean = false;

  constructor() {
    this.checkPlatform();
    this.initializePermissions();
  }

  private async checkPlatform() {
    try {
      const info = await Device.getInfo();
      this.isNative = info.platform !== 'web';
    } catch (error) {
      this.isNative = false;
    }
  }

  private async initializePermissions() {
    if (!this.isNative) return;

    try {
      // Initialize push notifications (FCM/APNs)
      await initializePushNotifications();

      // Request local notification permissions
      await LocalNotifications.requestPermissions();

      console.log('Mobile services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mobile permissions:', error);
    }
  }

  // Camera Functions
  async takePicture(): Promise<CameraPhoto | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return {
        dataUrl: photo.dataUrl,
        path: photo.path,
        webPath: photo.webPath,
        format: photo.format || 'jpeg'
      };
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<CameraPhoto | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      return {
        dataUrl: photo.dataUrl,
        path: photo.path,
        webPath: photo.webPath,
        format: photo.format || 'jpeg'
      };
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  }

  // Geolocation Functions
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async findNearbyHospitals(location: LocationCoordinates): Promise<any[]> {
    try {
      // This would integrate with Google Places API or similar
      const radius = 5000; // 5km radius
      const type = 'hospital';
      
      // For now, return mock data
      return [
        {
          name: 'City General Hospital',
          address: '123 Medical Center Dr',
          distance: '2.3 km',
          phone: '108',
          emergency: true,
          rating: 4.5
        },
        {
          name: 'Community Health Clinic',
          address: '456 Health St',
          distance: '3.1 km',
          phone: '+91-11-23456789',
          emergency: false,
          rating: 4.2
        }
      ];
    } catch (error) {
      console.error('Error finding nearby hospitals:', error);
      return [];
    }
  }

  // Device Information
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const info = await Device.getInfo();
      return {
        platform: info.platform,
        model: info.model,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        webViewVersion: info.webViewVersion
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        platform: 'web',
        model: 'unknown',
        operatingSystem: 'unknown',
        osVersion: 'unknown',
        manufacturer: 'unknown',
        isVirtual: false
      };
    }
  }

  // Network Status
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType || 'unknown'
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      return {
        connected: true,
        connectionType: 'unknown'
      };
    }
  }

  // Push Notifications
  async requestPushPermissions(): Promise<boolean> {
    try {
      return await requestPushPermissionService();
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  }

  async scheduleMedicationReminder(medication: any, time: Date): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Medication Reminder',
            body: `Time to take your ${medication.name}`,
            id: medication.id,
            schedule: { at: time },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: 'MEDICATION_REMINDER',
            extra: {
              medicationId: medication.id,
              dosage: medication.dosage
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
    }
  }

  // Haptic Feedback
  async vibrate(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      let impactStyle: ImpactStyle;
      switch (style) {
        case 'light':
          impactStyle = ImpactStyle.Light;
          break;
        case 'medium':
          impactStyle = ImpactStyle.Medium;
          break;
        case 'heavy':
          impactStyle = ImpactStyle.Heavy;
          break;
      }
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }
  }

  // File System
  async saveHealthRecord(data: string, filename: string): Promise<boolean> {
    try {
      await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      return true;
    } catch (error) {
      console.error('Error saving health record:', error);
      return false;
    }
  }

  async readHealthRecord(filename: string): Promise<string | null> {
    try {
      const result = await Filesystem.readFile({
        path: filename,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      return result.data as string;
    } catch (error) {
      console.error('Error reading health record:', error);
      return null;
    }
  }

  // Sharing
  async shareHealthReport(title: string, text: string, url?: string): Promise<void> {
    try {
      await Share.share({
        title: title,
        text: text,
        url: url,
        dialogTitle: 'Share Health Report'
      });
    } catch (error) {
      console.error('Error sharing health report:', error);
    }
  }

  // Emergency Functions
  async callEmergency(): Promise<void> {
    try {
      if (this.isNative) {
        await Browser.open({ url: 'tel:108' });
      } else {
        window.open('tel:108', '_self');
      }
    } catch (error) {
      console.error('Error calling emergency:', error);
    }
  }

  async showEmergencyAlert(message: string): Promise<void> {
    try {
      await Dialog.alert({
        title: 'Emergency Alert',
        message: message
      });
    } catch (error) {
      console.error('Error showing emergency alert:', error);
      alert(message);
    }
  }

  // App Lifecycle
  async minimizeApp(): Promise<void> {
    try {
      if (this.isNative) {
        await App.minimizeApp();
      }
    } catch (error) {
      console.error('Error minimizing app:', error);
    }
  }

  // Browser
  async openExternalUrl(url: string): Promise<void> {
    try {
      await Browser.open({ url: url });
    } catch (error) {
      console.error('Error opening external URL:', error);
      window.open(url, '_blank');
    }
  }

  // Utility Functions
  isNativePlatform(): boolean {
    return this.isNative;
  }

  async isOnline(): Promise<boolean> {
    const status = await this.getNetworkStatus();
    return status.connected;
  }
}

// Export singleton instance
export const mobileService = new MobileService();
export default mobileService;