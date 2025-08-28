import { test, expect } from '@playwright/test';

test.describe('Dashboard Admin E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Abrir la app
    await page.goto('http://localhost:4000');

    // Inyectar token falso en localStorage para simular login de admin
    await page.evaluate(() => {
      localStorage.setItem(
        'auth_token',
        JSON.stringify({
          user: {
            name: 'Admin',
            email: 'admin@test.com',
            'https://aremar.com/roles': ['admin'],
          },
          exp: Date.now() + 3600_000, // 1 hora
        })
      );
    });

    // Recargar para que la app lea el token
    await page.reload();
  });

  test('Debe mostrar el Dashboard', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('Debe abrir RoomForm y crear una habitación', async ({ page }) => {
    await page.goto('http://localhost:4000/roomForm');

    await page.fill('input[name="roomId"]', 'P1D1');
    await page.fill('input[name="name"]', 'Habitación Test');
    await page.selectOption('select[name="category"]', 'standard');
    await page.click('button[type="submit"]');

    // Verificar que se creó la habitación
    await page.goto('http://localhost:4000/roomList');
    await expect(page.getByText(/P1D1/i)).toBeVisible();
  });

  test('Debe ver la lista de usuarios', async ({ page }) => {
    await page.goto('http://localhost:4000/userList');
    await expect(page.getByText(/usuario/i)).toBeVisible();
  });
});
