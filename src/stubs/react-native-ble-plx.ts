export class BleManager {
  startDeviceScan(
    _uuids: string[] | null,
    _options: any,
    _listener: (error: any, device: any) => void
  ): void {
    // Web stub: Bluetooth scanning not supported
    console.warn('BleManager.startDeviceScan is not implemented on web');
  }
  stopDeviceScan(): void {
    // Web stub: nothing to stop
  }
}
export default BleManager;

// Export empty enums and types to satisfy imports
export enum State {}
export enum LogLevel {}
export enum ConnectionPriority {}
export enum ScanCallbackType {}
export enum ScanMode {}
