import { test, expect } from '@playwright/test';

// Wymaganie: klient składa zamówienie z koszyka (płatność przy odbiorze)
// i widzi komunikat „Złożono zamówienie: …” z numerem nowego zamówienia.

test('zamówienie z koszyka pokazuje numer zamówienia', async ({ page, request }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  // Test sam wkłada produkt do koszyka. Wcześniej zakładał, że koszyk nie jest pusty,
  // bo na komputerze autora coś w nim zostało. Na świeżej bazie przycisk był wyłączony.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Nić dentystyczna' }).click();
  await expect(page.getByText('Dodano do koszyka: Nić dentystyczna')).toBeVisible();

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page.getByText(/Złożono zamówienie: ZAM-\d+/)).toBeVisible();

  // Sprzątanie: admin anuluje nowe zamówienie przez API, towar wraca na stan.
  const numer = new URL(page.url()).searchParams.get('zlozono');
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(anulowanie.status()).toBe(200);
});
