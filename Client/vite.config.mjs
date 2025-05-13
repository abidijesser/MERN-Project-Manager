import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import autoprefixer from 'autoprefixer';
import {
  NodeGlobalsPolyfillPlugin,
  NodeModulesPolyfillPlugin,
} from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: './',
  build: {
    outDir: 'build',
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}),
      ],
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
    plugins: [
      NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      }),
      NodeModulesPolyfillPlugin(),
    ],
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      {
        find: 'src/',
        replacement: `${path.resolve('src')}/`,
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
  },
  server: {
    port: 3000,
    proxy: {
        // https://vitejs.dev/config/server-options.html
      },
  },
}));
