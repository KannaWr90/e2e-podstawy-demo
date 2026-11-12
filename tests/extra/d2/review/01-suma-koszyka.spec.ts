import { test, expect } from '@playwright/test';

// Wymaganie: suma w koszyku to cena za sztukę razy ilość, dla każdej pozycji.
// Sprawdź na Odżywce do włosów w promocji (14,99 zł, po rabacie 11,99 zł).

test('suma koszyka z odżywką w promocji', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester07');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester07')).toBeVisible();

  await page.goto('/produkt/2');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Odżywka do włosów')).toBeVisible();

  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Odżywka do włosów' });
  // Cena za sztukę po promocji i suma koszyka
  await expect(wiersz.getByTestId('cart-item-price')).toContainText('11,99 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('11,99 zł');

  // Sprzątanie: odżywka wraca z koszyka
  await page.getByRole('button', { name: 'Usuń: Odżywka do włosów' }).click();
  await expect(wiersz).toHaveCount(0);
});
