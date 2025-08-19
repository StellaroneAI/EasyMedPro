/**
 * Simple WebSocket based live update service.
 * Falls back to periodic polling when a WebSocket connection isn't available.
 */

import { App } from '@capacitor/app';

class LiveUpdateService {
  // Use a private property to store the WebSocket instance
  private socket: WebSocket | null = null;
  // Use a private property for the polling interval handle
  private pollHandle: number | null = null;

  constructor() {
    // Add a listener for app state changes using Capacitor's App plugin
    App.addListener('appStateChange', ({ isActive }) => {
      // Check if a connection URL exists before doing anything
      const url = import.meta.env.VITE_LIVE_UPDATE_URL;
      if (!url) {
        return; // Exit early if no URL is configured
      }

      // If the app is active and we are in polling mode, start polling
      if (isActive) {
        if (!this.socket) { // Only resume polling if WebSocket connection isn't active
          console.log('App is active, resuming polling.');
          this.startPolling(url);
        }
      } else {
        // If the app is inactive, stop any active polling to save resources
        console.log('App moved to background, pausing polling.');
        this.stopPolling();
      }
    });

    // Initial connection attempt when the service is instantiated
    const url = import.meta.env.VITE_LIVE_UPDATE_URL;
    if (url) {
      this.connect(url);
    } else {
      console.info('[LiveUpdate] disabled (no VITE_LIVE_UPDATE_URL)');
    }
  }

  // Method to establish a WebSocket connection
  private connect(url: string) {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('Live updates connected via WebSocket.');
        this.stopPolling(); // Stop polling if the WebSocket connection is successful
      };

      this.socket.onclose = () => {
        console.log('Live updates disconnected, falling back to polling.');
        this.socket = null; // Clear the socket instance
        this.startPolling(url); // Start polling after disconnection
      };

      this.socket.onerror = (err) => {
        console.error('Live update WebSocket error:', err);
        // Fall back to polling on error
        this.socket?.close();
      };

      this.socket.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          console.log('Live update message:', data);
          // You can emit an event or call a handler here to process the data
        } catch (e) {
          console.log('Live update raw message:', ev.data);
        }
      };
    } catch (err) {
      console.warn('[LiveUpdate] WebSocket connection failed, falling back to polling:', err);
      // Start polling if WebSocket connection cannot be established
      this.startPolling(url);
    }
  }

  // Method to start periodic polling
  private startPolling(url: string) {
    // Stop any existing polling before starting a new one
    this.stopPolling();
    const httpUrl = url.replace(/^ws/, 'http');
    this.pollHandle = setInterval(async () => {
      try {
        const res = await fetch(httpUrl);
        if (res.ok) {
          const data = await res.json();
          console.log('Polled update:', data);
          // Process the polled data here
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 30000); // Poll every 30 seconds
  }

  // Method to stop polling
  private stopPolling() {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  // Public method to disconnect the service
  public disconnect() {
    this.socket?.close(); // Close the WebSocket connection if it exists
    this.stopPolling(); // Stop the polling loop
  }
}

// Instantiate the service and export it
export const liveUpdateService = new LiveUpdateService();
export default liveUpdateService;