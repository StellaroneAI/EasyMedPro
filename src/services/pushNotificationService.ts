import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';

/**
 * Initialize and handle push notifications for Android (FCM) and iOS (APNs).
 * This service wraps the Capacitor PushNotifications plugin and sets up
 * listeners for registration and incoming notifications.
 */

// Request permissions and register for push notifications
export const initializePushNotifications = async (): Promise<void> => {
  let permissionStatus = await PushNotifications.checkPermissions();
  if (permissionStatus.receive !== 'granted') {
    permissionStatus = await PushNotifications.requestPermissions();
  }

  if (permissionStatus.receive !== 'granted') {
    throw new Error('Push notification permission not granted');
  }

  await PushNotifications.register();
  addListeners();
};

// Exposed separately for places that only need the permission result
export const requestPushPermissions = async (): Promise<boolean> => {
  let permissionStatus = await PushNotifications.checkPermissions();
  if (permissionStatus.receive !== 'granted') {
    permissionStatus = await PushNotifications.requestPermissions();
  }
  return permissionStatus.receive === 'granted';
};

// Add common listeners for push events
const addListeners = () => {
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('Push registration success, token:', token.value);
    // TODO: send the token to the application server
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('Push received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('Push action performed:', action);
  });
};

export default { initializePushNotifications, requestPushPermissions };
