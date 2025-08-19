export interface HealthKitPermissions {
  permissions: any;
}
const AppleHealthKit = {
  initHealthKit: (_p: any, _cb: any) => {}
};
export default AppleHealthKit;
export const HealthKitPermissions: any = {};
export default {
  initHealthKit: (_options: any, callback: (err?: Error) => void) => {
    console.warn('HealthKit is not available on web');
    callback();
  }
};
