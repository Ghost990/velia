import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Exclude lucide-react from optimization to avoid source map warnings
  },
  server: {
    hmr: {
      overlay: false, // Disable the error overlay for source map warnings
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Add path alias for convenience
    },
  },
});
