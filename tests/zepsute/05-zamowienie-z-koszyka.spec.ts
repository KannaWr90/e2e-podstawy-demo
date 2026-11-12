import { test, expect } from '@playwright/test';

// Wymaganie: klient składa zamówienie z koszyka (płatność przy odbiorze)
// i widzi komunikat „Złożono zamówienie: …” z numerem nowego zamówienia.

test('zamówienie z koszyka pokazuje numer zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page.getByText(/Złożono zamówienie: ZAM-\d+/)).toBeVisible();
});
