import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig((mode) => {
  return {
    // Project plugins
    plugins: [
      vue(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 1025,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    // Base configuration
    base: './',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            '@border-color-base': '#dce3e8',
          },
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      brotliSize: false,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console and debugger in production
          drop_console: false,
          drop_debugger: true,
        },
      },
    },
  };
});