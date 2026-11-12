import { test, expect } from '@playwright/test';

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Każdy test ma własne konto (tester11, tester12): testy biegną równolegle,
// a koszyk jest jeden na konto.

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester11');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester11')).toBeVisible();

  // Kafelek. Nazwa produktu jest też w tabeli nad kafelkami, więc szukamy w obrębie kafelka.
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // Karta produktu: te same trzy wartości.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Krem do twarzy na dzień' })).toBeVisible();
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // Koszyk: cena za sztukę w wierszu kremu.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wiersz.getByTestId('cart-item-price')).toContainText('26,39 zł');

  // Sprzątanie: pusty koszyk na następne uruchomienie.
  await page.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Dla szybszych 1: kod rabatowy CZARNY20 i cena po kodzie.
test('kod CZARNY20 obniża cenę kremu w koszyku o 20%', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester12');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester12')).toBeVisible();

  await page.getByRole('button', { name: 'Dodaj do koszyka: Krem do twarzy na dzień' }).click();
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('26,39 zł');

  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toBeVisible();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('26,39 zł');
  await expect(page.getByTestId('cart-discount')).toHaveText('-5,28 zł');
  await expect(page.getByTestId('cart-total')).toHaveText('21,11 zł');

  // Sprzątanie: najpierw kod, potem produkt. Kod zostaje przy koncie nawet przy pustym koszyku.
  await page.getByRole('button', { name: 'Usuń kod' }).click();
  await page.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Dla szybszych 2: produkt niedostępny na karcie produktu.
test('karta niedostępnego produktu ma wyłączony przycisk i pole ilości', async ({ page }) => {
  await page.goto('/');
  const kafelek = page.getByRole('article', { name: 'Serum z witaminą C' });
  await expect(kafelek.getByTestId('tile-availability')).toHaveText('Niedostępny');
  await kafelek.getByRole('link', { name: 'Serum z witaminą C' }).click();

  await expect(page.getByTestId('product-availability')).toHaveText('Niedostępny');
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  await expect(page.getByLabel('Ilość')).toBeDisabled();
});
