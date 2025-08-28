import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.js/,
    },
    {
      name: 'e2e',
      use: {
        baseURL: 'http://localhost:4000',
        storageState: 'playwright/.auth/admin.json',
      },
    },
  ],
});
