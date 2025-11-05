import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/podcastly/',
  build: {
    outDir: 'web',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'css/styles.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  server: {
    open: true,
  },
});
