import { test, expect } from '@playwright/test';

// Wymaganie: kod CZARNY20 obniża sumę zamówienia o 20% do 30.11.2026 włącznie.
// Od 1.12.2026 koszyk odrzuca go komunikatem „Kod CZARNY20 wygasł 30.11.2026.”
//
// Wynik zależy od daty, którą aplikacja uznaje za dzisiejszą. Bez ustalonej daty
// test przechodzi do 30.11, a od 1.12 pada, choć aplikacja działa dobrze.
// Datę aplikacji ustawiasz zmienną NAMSSOR_TERAZ przed jej uruchomieniem, np.:
//   $env:NAMSSOR_TERAZ="2026-11-20"   (kod ważny)
//   $env:NAMSSOR_TERAZ="2026-12-01"   (kod wygasły)
// Każdy z dwóch testów sprawdza swoją połowę wymagania i pomija się, gdy data
// aplikacji jest z drugiej połowy. Datę aplikacji podaje GET /api/promocja (pole today).

// Oba testy używają koszyka konta biuro, więc biegną po kolei. Każdy przygotowuje
// koszyk sam w beforeEach, więc nie zależą od siebie i działają także uruchomione osobno.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  // Koszyk i kod pusty na starcie
  await page.request.delete('/api/cart');
  await page.getByRole('button', { name: 'Dodaj do koszyka: Mydło w kostce' }).click();
  await expect(page.getByText('Dodano do koszyka: Mydło w kostce')).toBeVisible();
  await page.goto('/koszyk');
});

test.afterEach(async ({ page }) => {
  // Sprzątanie: DELETE /api/cart usuwa produkty i kod rabatowy
  await page.request.delete('/api/cart');
});

test('do 30.11.2026 kod CZARNY20 obniża sumę o 20%', async ({ page }) => {
  const { today } = await (await page.request.get('/api/promocja')).json();
  test.skip(today > '2026-11-30', `Data aplikacji ${today}: kod już wygasł. Ustaw NAMSSOR_TERAZ na dzień do 30.11.2026.`);

  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('4,99 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('3,99 zł');
});

test('od 1.12.2026 kod CZARNY20 jest odrzucony jako wygasły', async ({ page }) => {
  const { today } = await (await page.request.get('/api/promocja')).json();
  test.skip(today <= '2026-11-30', `Data aplikacji ${today}: kod jeszcze ważny. Ustaw NAMSSOR_TERAZ na dzień od 1.12.2026.`);

  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 wygasł 30.11.2026.');
  await expect(page.getByTestId('cart-total')).toHaveText('4,99 zł');
});
