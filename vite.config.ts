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
      // Add this line to resolve React Native components on the web
      'react-native': 'react-native-web',
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
    rollupOptions: {
      external: ['mongodb', 'crypto', 'util'] // Mark as external for build
    }
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  }
})
