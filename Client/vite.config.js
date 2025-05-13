const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');
const autoprefixer = require('autoprefixer');
const { NodeGlobalsPolyfillPlugin, NodeModulesPolyfillPlugin } = require('vite-plugin-node-polyfills');

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
