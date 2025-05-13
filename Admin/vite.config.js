import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsConfigPaths from 'vite-jsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsConfigPaths()],
  server: {
    port: 5173, // Set the port to 5173 to avoid conflict with the client app
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production'
  }
});
