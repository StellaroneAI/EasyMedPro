export class BleManager {
  startDeviceScan(
    _uuids: string[] | null,
    _options: any,
    _listener: (error: any, device: any) => void
  ): void {
    // no-op stub for web build
  }
  stopDeviceScan(): void {
    // no-op stub
  }
}
export default BleManager;
  startDeviceScan(_serviceUUIDs: string[] | null, _options: any, _listener: any) {
    // Web stub: Bluetooth scanning not supported
    console.warn('BleManager.startDeviceScan is not implemented on web');
  }
  stopDeviceScan() {
    // Web stub: nothing to stop
  }
}

// Export empty enums and types to satisfy imports
export enum State {}
export enum LogLevel {}
export enum ConnectionPriority {}
export enum ScanCallbackType {}
export enum ScanMode {}
