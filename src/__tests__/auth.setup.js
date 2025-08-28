import { test as setup } from '@playwright/test';

setup('login with Auth0', async ({ page }) => {
  await page.goto('http://localhost:4000'); // o donde inicie login

  // Redirige a Auth0
  await page.getByRole('button', { name: /login/i }).click();

  // Completar credenciales en Auth0
  await page.fill('input[name="username"]', process.env.AUTH0_USER);
  await page.fill('input[name="password"]', process.env.AUTH0_PASS);
  await page.getByRole('button', { name: /continue|login/i }).click();

  // Esperar redirección al dashboard
  await page.waitForURL('**/dashboard');

  // Guardar sesión ya autenticada
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
