import { test, expect } from '@playwright/test';

// Wymaganie: klient wpisuje w koszyku kod CZARNY20. Kod zostaje przyjęty,
// a suma do zapłaty spada o 20%. Komunikat o błędnym kodzie się nie pojawia.
//
// Kod CZARNY20 jest ważny do 30.11.2026. Po tej dacie test padnie
// (zależność od daty: zadanie dodatkowe D2, runda 3 review).

test('kod CZARNY20 zostaje przyjęty w koszyku', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester08');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester08')).toBeVisible();
  // Pusty koszyk i brak kodu na starcie (DELETE /api/cart usuwa oba)
  await page.request.delete('/api/cart');

  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  await page.goto('/koszyk');
  await expect(page.getByTestId('cart-total')).toHaveText('9,99 zł');

  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  // Komunikat, który aplikacja naprawdę pokazuje, i suma po rabacie
  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('9,99 zł');
  await expect(page.getByTestId('cart-discount')).toHaveText('-2,00 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('7,99 zł');

  // Sprzątanie: produkt i kod wracają z koszyka
  await page.request.delete('/api/cart');
});
