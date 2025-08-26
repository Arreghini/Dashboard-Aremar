import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'istanbul',                // usar istanbul en Windows
      reporter: ['text', 'html', 'lcov'],  // formatos de reporte
      all: true,                            // incluir todos los archivos
      include: ['src/**/*.{js,jsx}'],      // qué archivos medir
      exclude: ['src/**/*.test.{js,jsx}', 'node_modules/'] // excluir tests y node_modules
    },
  },
});
