export const HealthKitPermissions: any = {};
export default {
  initHealthKit: (_options: any, callback: (err?: Error) => void) => {
    console.warn('HealthKit is not available on web');
    callback();
  }
};
