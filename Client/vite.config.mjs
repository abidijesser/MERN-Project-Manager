import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import stdLibBrowser from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: './',
  build: {
    outDir: 'build',
  },
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer', 'process'],
  },
  plugins: [
    react(),
    stdLibBrowser(),
  ],
  resolve: {
    alias: [
      {
        find: 'src/',
        replacement: `${path.resolve('src')}/`,
      },
      // Explicitly define buffer and process polyfills
      { find: 'buffer', replacement: 'buffer' },
      { find: 'process', replacement: 'process/browser' },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
  },
  server: {
    port: 3000,
    proxy: {
        // https://vitejs.dev/config/server-options.html
    },
  },
}))
