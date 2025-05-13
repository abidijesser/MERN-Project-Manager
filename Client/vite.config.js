const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');
const autoprefixer = require('autoprefixer');
const polyfills = require('vite-plugin-node-polyfills');

// https://vitejs.dev/config/
module.exports = defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
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
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [
      react(),
      polyfills({
        // Enables the polyfill for `crypto` and other necessary modules
        buffer: true, 
        crypto: true,
        process: true,
      }),
    ],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
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
  };
});
