/**
 * React Hook for Mobile Features
 * Provides easy access to native mobile capabilities in React components
 */

import { useEffect, useState, useCallback } from 'react';
import { mobileService, CameraPhoto, LocationCoordinates, DeviceInfo, NetworkStatus } from '../services/mobileService';

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ connected: true, connectionType: 'unknown' });
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const initializeMobile = async () => {
      setIsNative(mobileService.isNativePlatform());
      
      try {
        const [network, device] = await Promise.all([
          mobileService.getNetworkStatus(),
          mobileService.getDeviceInfo()
        ]);
        
        setNetworkStatus(network);
        setDeviceInfo(device);
      } catch (error) {
        console.error('Failed to initialize mobile features:', error);
      }
    };

    initializeMobile();
  }, []);

  return {
    isNative,
    networkStatus,
    deviceInfo,
    isOnline: networkStatus.connected,
    
    // Camera functions
    takePicture: useCallback(() => mobileService.takePicture(), []),
    selectFromGallery: useCallback(() => mobileService.selectFromGallery(), []),
    
    // Location functions
    getCurrentLocation: useCallback(() => mobileService.getCurrentLocation(), []),
    findNearbyHospitals: useCallback((location: LocationCoordinates) => 
      mobileService.findNearbyHospitals(location), []),
    
    // Notifications
    scheduleMedicationReminder: useCallback((medication: any, time: Date) => 
      mobileService.scheduleMedicationReminder(medication, time), []),
    
    // Haptics
    vibrate: useCallback((style?: 'light' | 'medium' | 'heavy') => 
      mobileService.vibrate(style), []),
    
    // File system
    saveHealthRecord: useCallback((data: string, filename: string) => 
      mobileService.saveHealthRecord(data, filename), []),
    readHealthRecord: useCallback((filename: string) => 
      mobileService.readHealthRecord(filename), []),
    
    // Sharing
    shareHealthReport: useCallback((title: string, text: string, url?: string) => 
      mobileService.shareHealthReport(title, text, url), []),
    
    // Emergency
    callEmergency: useCallback(() => mobileService.callEmergency(), []),
    showEmergencyAlert: useCallback((message: string) => 
      mobileService.showEmergencyAlert(message), []),
    
    // Utility
    openExternalUrl: useCallback((url: string) => mobileService.openExternalUrl(url), []),
    minimizeApp: useCallback(() => mobileService.minimizeApp(), [])
  };
};

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<CameraPhoto | null>(null);

  const takePicture = useCallback(async () => {
    setIsLoading(true);
    try {
      const photo = await mobileService.takePicture();
      setLastPhoto(photo);
      return photo;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFromGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const photo = await mobileService.selectFromGallery();
      setLastPhoto(photo);
      return photo;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    takePicture,
    selectFromGallery,
    isLoading,
    lastPhoto,
    clearLastPhoto: () => setLastPhoto(null)
  };
};

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const coords = await mobileService.getCurrentLocation();
      if (coords) {
        setLocation(coords);
      } else {
        setError('Failed to get location');
      }
      return coords;
    } catch (err) {
      const errorMessage = 'Location access denied or unavailable';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findNearbyHospitals = useCallback(async (coords?: LocationCoordinates) => {
    const locationToUse = coords || location;
    if (!locationToUse) {
      throw new Error('Location not available');
    }
    
    return mobileService.findNearbyHospitals(locationToUse);
  }, [location]);

  return {
    getCurrentLocation,
    findNearbyHospitals,
    location,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ 
    connected: true, 
    connectionType: 'unknown' 
  });

  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await mobileService.getNetworkStatus();
      setNetworkStatus(status);
    };

    updateNetworkStatus();

    // Listen for network changes if available
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, connected: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, connected: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...networkStatus,
    isOnline: networkStatus.connected,
    isOffline: !networkStatus.connected,
    refresh: async () => {
      const status = await mobileService.getNetworkStatus();
      setNetworkStatus(status);
    }
  };
};

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await mobileService.requestPushPermissions();
        setHasPermission(permission);
      } catch (error) {
        console.error('Failed to check notification permissions:', error);
      }
    };

    checkPermissions();
  }, []);

  const scheduleMedicationReminder = useCallback(
    async (medication: any, time: Date) => {
      if (!hasPermission) {
        const permission = await mobileService.requestPushPermissions();
        setHasPermission(permission);
        
        if (!permission) {
          throw new Error('Notification permission denied');
        }
      }

      await mobileService.scheduleMedicationReminder(medication, time);
    },
    [hasPermission]
  );

  return {
    hasPermission,
    scheduleMedicationReminder,
    requestPermissions: async () => {
      const permission = await mobileService.requestPushPermissions();
      setHasPermission(permission);
      return permission;
    }
  };
};

export default useMobile;