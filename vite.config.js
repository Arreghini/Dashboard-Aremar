import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
   server: {
    port: 4000,      // <- forzar puerto
    strictPort: true // <- si el puerto 4000 está ocupado, falla en vez de buscar otro
  },
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.js',
  include: ['src/**/*.test.{js,jsx,ts,tsx}'],
  },
});
