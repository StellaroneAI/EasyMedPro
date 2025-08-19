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
