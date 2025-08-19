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
    // Exclude packages that rely on native modules or Node-specific APIs
    exclude: [
      'mongodb',
      'react-native-ble-plx',
      '@react-native-voice/voice',
      'expo-av',
      'expo-camera',
      'expo-file-system',
      'expo-media-library',
      'expo-speech',
      'react-native-health'
    ]
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      // Prevent bundling of Node-specific and native-only packages
      external: [
        'mongodb',
        'crypto',
        'util',
        'react-native-ble-plx',
        '@react-native-voice/voice',
        'expo-av',
        'expo-camera',
        'expo-file-system',
        'expo-media-library',
        'expo-speech',
        'react-native-health'
      ],
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
