import { test, expect } from '@playwright/test';

// Wymaganie: klient składa zamówienie z koszyka (płatność przy odbiorze)
// i widzi komunikat „Złożono zamówienie: …” z numerem nowego zamówienia.

test('zamówienie z koszyka pokazuje numer zamówienia', async ({ page, request }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  // Przy pustym koszyku przycisk „Złóż zamówienie” jest wyłączony,
  // więc test sam dodaje produkt, zamiast liczyć na to, co zostało w koszyku.
  await page.getByRole('row').filter({ hasText: 'Żel pod prysznic' })
    .getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Żel pod prysznic')).toBeVisible();

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page.getByText(/Złożono zamówienie: ZAM-\d+/)).toBeVisible();

  // Sprzątanie: numery zamówień są w adresie strony (?zlozono=ZAM-1010),
  // anulujemy je przez API jako admin, żeby nie zostały w bazie jako „Nowe”.
  const numery = new URL(page.url()).searchParams.get('zlozono')!.split(',');
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  expect(logowanie.status()).toBe(200);
  const { token } = await logowanie.json();
  for (const numer of numery) {
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(odpowiedz.status()).toBe(200);
  }
});
