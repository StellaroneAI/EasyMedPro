/**
 * Simple WebSocket based live update service.
 * Falls back to periodic polling when a WebSocket connection isn't available.
 */

import { App } from '@capacitor/app';

class LiveUpdateService {
  private socket: WebSocket | null = null;
  private pollHandle: any;

  connect(url: string) {
    try {
      this.socket = new WebSocket(url);
      this.socket.onopen = () => console.log('Live updates connected');
      this.socket.onclose = () => console.log('Live updates disconnected');
      this.socket.onerror = (err) => console.error('Live update error:', err);
      this.socket.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          console.log('Live update message:', data);
        } catch (e) {
          console.log('Live update raw message:', ev.data);
        }
      };
    } catch (error) {
      console.error('Failed to open WebSocket, falling back to polling', error);
      this.startPolling(url);
    }
  }

  private startPolling(url: string) {
    this.stopPolling();
    this.pollHandle = setInterval(async () => {
      try {
        const res = await fetch(url.replace(/^ws/, 'http'));
        if (res.ok) {
          const data = await res.json();
          console.log('Polled update:', data);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 30000); // poll every 30 seconds
  }

  private stopPolling() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  disconnect() {
    this.socket?.close();
    this.stopPolling();
  }

  constructor() {
    // pause polling when app is backgrounded
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        if (this.pollHandle) {
          console.log('Resuming live updates');
        }
      } else {
        if (this.pollHandle) {
          console.log('App moved to background, continuing polling');
        }
      }
    });
  }
}

export const liveUpdateService = new LiveUpdateService();
export default liveUpdateService;
