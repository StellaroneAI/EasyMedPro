import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'EasyMedPro',
        short_name: 'EasyMedPro',
        description: 'Your all-in-one healthcare management solution.',
        theme_color: '#18181b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './packages/core/src'),
      'react-native': path.resolve(__dirname, './src/stubs/react-native.ts'),
      '@react-native-voice/voice': path.resolve(__dirname, './src/stubs/react-native-voice.ts'),
      'react-native-ble-plx': path.resolve(__dirname, './src/stubs/react-native-ble-plx.ts'),
      'react-native-health': path.resolve(__dirname, './src/stubs/react-native-health.ts'),
      'expo-camera': path.resolve(__dirname, './src/stubs/expo-camera.ts'),
      'expo-file-system': path.resolve(__dirname, './src/stubs/expo-file-system.ts'),
      'expo-media-library': path.resolve(__dirname, './src/stubs/expo-media-library.ts'),
      'expo-speech': path.resolve(__dirname, './src/stubs/expo-speech.ts'),
      'expo-av': path.resolve(__dirname, './src/stubs/expo-av.ts'),
    },
  },
})