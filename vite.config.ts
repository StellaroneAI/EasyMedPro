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
      'react-native': resolve(__dirname, './src/stubs/react-native'),
      // Stub native modules on the web to avoid build issues
      'react-native-ble-plx': resolve(__dirname, './src/stubs/react-native-ble-plx'),
      '@react-native-voice/voice': resolve(__dirname, './src/stubs/react-native-voice'),
      'expo-av': resolve(__dirname, './src/stubs/expo-av'),
      'expo-speech': resolve(__dirname, './src/stubs/expo-speech'),
      'react-native-health': resolve(__dirname, './src/stubs/react-native-health'),
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
