import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three/') ? 'three' : id.includes('@react-three') ? 'r3f' : undefined),
      },
    },
  },
  test: { environment: 'node' },
} as Parameters<typeof defineConfig>[0]);
