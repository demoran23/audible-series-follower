import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin(), suidPlugin(), crx({ manifest })],
  server: {
    port: 3000,hmr: { port: 3000}
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  define: {
    global: {},
  },
  base: './',
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      https: 'agent-base',
      zlib: 'browserify-zlib',
    },
  },
});
