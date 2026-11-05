import { test, expect } from '@playwright/test';

// Wymaganie: po wyszukaniu „ZAM-1005” w panelu admina tabela zamówień
// pokazuje dokładnie jedno zamówienie: ZAM-1005.

test('wyszukiwarka zamówień znajduje ZAM-1005', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/admin/zamowienia');
  await page.getByLabel('Szukaj zamówienia').fill('ZAM-1005');
  await page.getByRole('button', { name: 'Szukaj' }).click();

  // Pierwsza komórka pierwszego wiersza to numer zamówienia
  await expect(page.locator('table tbody tr:nth-child(1) td:nth-child(1)')).toHaveText('ZAM-1005');
});
