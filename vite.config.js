import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'src/setupTests.js'),
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
  provider: 'istanbul',
  reporter: ['text', 'text-summary', 'html', 'lcov'],
  all: true,
  include: ['src/**/*.{js,jsx}'],
  exclude: ['src/**/*.test.{js,jsx}', 'node_modules/'],
  reportsDirectory: './coverage', // carpeta donde se guardará
  clean: false,                   // NO limpiar la carpeta
}
  },
});
