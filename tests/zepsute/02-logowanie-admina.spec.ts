import { test, expect } from '@playwright/test';

// Wymaganie: administrator po zalogowaniu widzi w menu link „Panel admina”.

test('administrator widzi link do panelu admina', async ({ page }) => {
  await page.goto('/logowanie');

  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  // Przycisk na stronie nazywa się „Zaloguj”. „Zaloguj się” nie pasowało do niczego,
  // więc click czekał do końca limitu czasu testu.
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByRole('link', { name: 'Panel admina' })).toBeVisible();
});
