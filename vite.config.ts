import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Polyfill process.env for the Safety Inspector if needed, 
    // though using import.meta.env is preferred in Vite.
    'process.env': process.env
  }
});
