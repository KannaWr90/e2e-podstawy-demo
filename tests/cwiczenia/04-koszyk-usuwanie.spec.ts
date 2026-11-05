import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  await page.getByRole('link', { name: 'Koszyk' }).click();

  // Wiersz koszyka znajdujemy po nazwie produktu.
  const wiersz = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wiersz).toBeVisible();

  await wiersz.getByRole('button', { name: 'Usuń' }).click();

  // Po usunięciu strona koszyka ładuje się od nowa. Wiersza z produktem ma nie być.
  await expect(wiersz).toHaveCount(0);
});
