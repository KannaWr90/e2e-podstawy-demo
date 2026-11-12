import fs from 'node:fs';
import { test, expect } from '@playwright/test';

// Ćwiczenie 08, część B: zamówienie firmowe „Biuro Mikołaja” → status → faktura.
// Przypadek testowy: docs/scenariusze/biuro-mikolaja.md (kroki 1–10),
// ten sam scenariusz w Gherkinie: docs/scenariusze/biuro-mikolaja.feature.

// Oba testy w tym pliku używają koszyka konta biuro, więc biegną po kolei.
// Każdy opróżnia koszyk na starcie i zakłada własne zamówienie: nie zależą od siebie.
test.describe.configure({ mode: 'serial' });

test('Biuro Mikołaja: zamówienie na firmę, status „Wysłane” i faktura z NIP nabywcy', async ({ page }) => {
  // Krok 1. Logowanie klienta firmowego. Koszyk musi być pusty (warunek wstępny):
  // po nieudanym przebiegu mogły w nim zostać kalendarze.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.request.delete('/api/cart');

  // Krok 2. Karta produktu, ilość 10
  await page.goto('/produkt/21');
  await page.getByLabel('Ilość').fill('10');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Kalendarz adwentowy 2026')).toBeVisible();

  // Krok 3. Koszyk
  await page.goto('/koszyk');
  const pozycja = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(pozycja.getByTestId('cart-item-qty')).toHaveText('10');
  await expect(page.getByTestId('cart-count')).toHaveText('1');
  await expect(page.getByTestId('cart-total')).toHaveText('399,90 zł');

  // Krok 4. Faktura na firmę i zamówienie
  await page.getByLabel('Faktura na firmę').check();
  await page.getByLabel('NIP').fill('241-224-12-28');
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();
  // Komunikat znika po kilku sekundach, więc sprawdzamy go od razu.
  await expect(page.getByTestId('flash')).toHaveText(/^Złożono zamówienie: ZAM-\d+$/);
  // Numer nowego zamówienia jest w adresie strony: /zamowienia?zlozono=ZAM-1008
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  expect(numer).toMatch(/^ZAM-\d+$/);

  // Krok 5. Strona zamówienia klienta
  await page.getByRole('link', { name: numer }).click();
  await expect(page.getByRole('heading', { name: `Zamówienie ${numer}` })).toBeVisible();
  await expect(page.getByTestId('order-status')).toHaveText('Nowe');
  await expect(page.getByTestId('order-nip')).toHaveText('2412241228');
  await expect(page.getByRole('link', { name: 'Pobierz fakturę' })).toBeVisible();

  // Kroki 6–8. Admin zmienia status: Nowe → Opłacone → Wysłane
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto(`/admin/zamowienia/${numer}`);
  await expect(page.getByTestId('order-status')).toHaveText('Nowe');
  await page.getByLabel('Status zamówienia').selectOption('Opłacone');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByTestId('order-status')).toHaveText('Opłacone');
  await page.getByLabel('Status zamówienia').selectOption('Wysłane');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByTestId('order-status')).toHaveText('Wysłane');

  // Krok 9. Klient widzi status „Wysłane”
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByTestId('order-status')).toHaveText('Wysłane');

  // Krok 10. Pobranie faktury: najpierw czekamy na pobieranie, potem klikamy.
  const pobieranieObietnica = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const pobieranie = await pobieranieObietnica;
  expect(pobieranie.suggestedFilename()).toBe(`faktura-${numer}.html`);

  // Faktura to plik HTML. Wczytujemy go do karty przeglądarki i sprawdzamy lokatorami.
  const tresc = fs.readFileSync(await pobieranie.path(), 'utf8');
  await page.setContent(tresc);
  await expect(page.getByText('NIP nabywcy: 2412241228')).toBeVisible();
  await expect(page.getByText('Biuro Mikołaja')).toBeVisible();
  const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wiersz.getByRole('cell')).toHaveText(['1', 'Kalendarz adwentowy 2026', '10', '39,99 zł', '399,90 zł']);
  await expect(page.getByText('Razem do zapłaty: 399,90 zł')).toBeVisible();
});

// Dla szybszych: kod CZARNY20 w zamówieniu firmowym. Kod jest ważny do 30.11.2026.
// Cena za sztukę po rabacie: 39,99 zł × 0,8 = 31,992 zł, aplikacja zaokrągla do 31,99 zł.
// Suma: 10 × 31,99 zł = 319,90 zł (a nie 319,92 zł, czyli 80% z 399,90 zł).
test('Biuro Mikołaja z kodem CZARNY20: faktura z ceną po rabacie', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.request.delete('/api/cart');

  await page.goto('/produkt/21');
  await page.getByLabel('Ilość').fill('10');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Kalendarz adwentowy 2026')).toBeVisible();

  await page.goto('/koszyk');
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();
  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
  await expect(page.getByTestId('cart-discount')).toHaveText('-80,00 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('319,90 zł');

  await page.getByLabel('Faktura na firmę').check();
  await page.getByLabel('NIP').fill('241-224-12-28');
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();
  await expect(page.getByTestId('flash')).toHaveText(/^Złożono zamówienie: ZAM-\d+$/);
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByText('Kod rabatowy: CZARNY20')).toBeVisible();
  await expect(page.getByTestId('order-total')).toHaveText('319,90 zł');

  const pobieranieObietnica = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const pobieranie = await pobieranieObietnica;
  await page.setContent(fs.readFileSync(await pobieranie.path(), 'utf8'));
  const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wiersz.getByRole('cell')).toHaveText(['1', 'Kalendarz adwentowy 2026', '10', '31,99 zł', '319,90 zł']);
  await expect(page.getByText('Razem do zapłaty: 319,90 zł')).toBeVisible();

  // Sprzątanie: zamówienie ma status „Nowe”, więc admin może je anulować przez API.
  const logowanie = await page.request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  const anulowanie = await page.request.post(`/api/admin/orders/${numer}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(anulowanie.status()).toBe(200);
});
