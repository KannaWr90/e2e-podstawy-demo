import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt, scenariusz P11: kod rabatowy w koszyku.
// Opis scenariusza: docs/projekt.md
// Trzy testy dzielą koszyk jednego konta, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

const PRODUKT = 'Mydło w kostce';

test.beforeEach(async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');
  await page.getByRole('button', { name: `Dodaj do koszyka: ${PRODUKT}` }).click();
  await expect(page.getByText(`Dodano do koszyka: ${PRODUKT}`)).toBeVisible();
  await page.goto('/koszyk');
});

test.afterEach(async ({ page }) => {
  // Sprzątanie: bez kodu i bez mydła w koszyku
  // page.request ma ciasteczko sesji z przeglądarki, więc działa na tym samym koszyku.
  const usuniecieKodu = await page.request.delete('/api/cart/discount');
  expect(usuniecieKodu.status()).toBe(200);
  await page.goto('/koszyk');
  await page.getByRole('button', { name: `Usuń: ${PRODUKT}` }).click();
  await expect(page.getByRole('row').filter({ hasText: PRODUKT })).toHaveCount(0);
});

test('kod CZARNY20 daje rabat 20% na całe zamówienie', async ({ page }) => {
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
  // Rabat widać pod sumą: „Przed rabatem: …, rabat (CZARNY20): -…”
  await expect(page.getByText('rabat (CZARNY20)')).toBeVisible();
  await expect(page.getByTestId('cart-discount')).toHaveText(/^-\d+,\d{2} zł$/);
});

test('nieznany kod pokazuje komunikat i nie daje rabatu', async ({ page }) => {
  await page.getByLabel('Kod rabatowy').fill('NIEMA');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText('Nie ma takiego kodu rabatowego: NIEMA');
  await expect(page.getByTestId('cart-discount')).toHaveCount(0);
});

test('kod WLOSY15 bez produktu z kategorii Włosy jest odrzucony', async ({ page }) => {
  await page.getByLabel('Kod rabatowy').fill('wlosy15');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByTestId('discount-message')).toHaveText(
    'Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.',
  );
  await expect(page.getByTestId('cart-discount')).toHaveCount(0);
});
