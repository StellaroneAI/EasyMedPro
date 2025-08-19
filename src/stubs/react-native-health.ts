
export interface HealthKitPermissions {
  permissions: any;
}

export const HealthKitPermissions: any = {};

const AppleHealthKitStub = {
  initHealthKit: (_options: any, callback: (err?: Error) => void) => {
    console.warn('HealthKit is not available on web');
    if (callback) callback();
  }
};

export default AppleHealthKitStub;
