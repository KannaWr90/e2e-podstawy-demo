import { test, expect } from '@playwright/test';

// Wymaganie: klient zamawia z fakturą na firmę. Zaznacza „Faktura na firmę”,
// podaje NIP i nazwę firmy, składa zamówienie. Zamówienie jest na liście
// „Moje zamówienia”, a na jego stronie widać NIP firmy i przycisk „Pobierz fakturę”.

let numer = '';

test.afterEach(async ({ request }) => {
  // Sprzątanie: admin anuluje zamówienie, towar wraca na stan.
  if (!numer) return;
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(anulowanie.status()).toBe(200);
});

test('zamówienie z fakturą na firmę', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();
  await page.request.delete('/api/cart');

  await page.getByRole('button', { name: 'Dodaj do koszyka: Szczoteczka do zębów' }).click();
  await page.goto('/koszyk');

  await page.getByLabel('Faktura na firmę').check();
  await page.getByLabel('NIP').fill('101-202-30-36');
  await page.getByLabel('Nazwa firmy').fill('Elfy i Wspólnicy sp. z o.o.');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+/);
  numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

  // Zamówienie jest na liście „Moje zamówienia” (lista ładuje się z opóźnieniem, expect czeka)
  const wiersz = page.getByRole('row').filter({ hasText: numer });
  await expect(wiersz).toContainText('Szczoteczka do zębów');

  // Strona zamówienia: NIP firmy i faktura
  await wiersz.getByRole('link', { name: numer }).click();
  await expect(page.getByText('Faktura na firmę: Elfy i Wspólnicy sp. z o.o.')).toBeVisible();
  await expect(page.getByTestId('order-nip')).toHaveText('1012023036');
  await expect(page.getByRole('link', { name: 'Pobierz fakturę' })).toBeVisible();
});
