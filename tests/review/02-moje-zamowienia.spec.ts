import { test, expect } from '@playwright/test';

// Wymaganie: na stronie „Moje zamówienia” klient widzi swoje zamówienie ZAM-1004
// ze statusem „Nowe”.

test('lista moich zamówień pokazuje ZAM-1004 jako nowe', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista przychodzi z serwera po 0,5–2 s. expect sam czeka (domyślnie do 5 s).
  const wiersz = page.getByRole('row').filter({ hasText: 'ZAM-1004' });
  await expect(wiersz).toBeVisible();
  // Status sprawdzamy w wierszu ZAM-1004, a nie w dowolnym wierszu tabeli
  await expect(wiersz.getByTestId('order-status')).toHaveText('Nowe');
});
