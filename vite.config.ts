import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL for the app. '/' works best for Firebase Hosting root.
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Increase chunk size warning limit to prevent warnings from failing CI in strict modes
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Expose environment variables to the client, with a safe fallback to prevent build crashes
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})
