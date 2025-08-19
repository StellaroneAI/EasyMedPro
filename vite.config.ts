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
      'react-native': 'react-native-web',
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
