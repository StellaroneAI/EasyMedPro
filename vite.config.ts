import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './packages/core/src'),
      // Add this line to resolve React Native components on the web
      'react-native': resolve(__dirname, './src/stubs/react-native.ts'),
      'react-native-ble-plx': resolve(__dirname, './src/stubs/react-native-ble-plx.ts'),
      '@react-native-voice/voice': resolve(__dirname, './src/stubs/react-native-voice.ts'),
      'react-native-health': resolve(__dirname, './src/stubs/react-native-health.ts'),
      'expo-av': resolve(__dirname, './src/stubs/expo-av.ts'),
      'expo-camera': resolve(__dirname, './src/stubs/expo-camera.ts'),
      'expo-file-system': resolve(__dirname, './src/stubs/expo-file-system.ts'),
      'expo-media-library': resolve(__dirname, './src/stubs/expo-media-library.ts'),
      'expo-speech': resolve(__dirname, './src/stubs/expo-speech.ts'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['mongodb'] // Exclude MongoDB from browser bundling
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      external: ['mongodb', 'crypto', 'util'], // Mark as external for build
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          translations: ['./src/translations/index.ts', './src/translations/loginTexts.ts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
    target: 'es2015'
  }
})
