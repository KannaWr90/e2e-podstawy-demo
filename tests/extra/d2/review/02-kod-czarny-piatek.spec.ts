import { test, expect } from '@playwright/test';

// Wymaganie: kod CZARNY20 obniża sumę zamówienia o 20% do 30.11.2026 włącznie.
// Od 1.12.2026 koszyk odrzuca go komunikatem „Kod CZARNY20 wygasł 30.11.2026.”

test('kod CZARNY20 obniża sumę o 20%', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();

  await page.getByRole('button', { name: 'Dodaj do koszyka: Mydło w kostce' }).click();
  await page.goto('/koszyk');
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('4,99 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('3,99 zł');

  // Sprzątanie: kod i mydło wracają z koszyka
  await page.getByRole('button', { name: 'Usuń kod' }).click();
  await page.getByRole('button', { name: 'Usuń: Mydło w kostce' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});
