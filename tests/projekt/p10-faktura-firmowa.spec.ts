import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt, scenariusz P10: zamówienie na firmę i faktura do pobrania.
// Opis scenariusza: docs/projekt.md
// Konto biuro (Biuro Mikołaja): jego koszyka nie używa żaden inny plik.
// Oba testy w tym pliku dzielą koszyk, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

const PRODUKT = 'Kalendarz adwentowy 2026';

test.beforeEach(async ({ page }) => {
  await zaloguj(page, 'biuro', 'biuro123');
  await page.goto('/');
  await page.getByRole('button', { name: `Dodaj do koszyka: ${PRODUKT}` }).click();
  await expect(page.getByText(`Dodano do koszyka: ${PRODUKT}`)).toBeVisible();
  await page.goto('/koszyk');
  await page.getByLabel('Faktura na firmę').check();
});

test('NIP z błędną sumą kontrolną zatrzymuje zamówienie', async ({ page }) => {
  await page.getByLabel('NIP').fill('101-202-30-37');
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Koszyk' })).toBeVisible();

  // Sprzątanie: kalendarz nie może zostać w koszyku na następny test
  await page.getByRole('button', { name: `Usuń: ${PRODUKT}` }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

test('zamówienie na firmę ma fakturę z danymi nabywcy do pobrania', async ({ page }) => {
  await page.getByLabel('NIP').fill('101-202-30-36');
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  // Numer nowego zamówienia jest w adresie strony: /zamowienia?zlozono=ZAM-1008
  await expect(page).toHaveURL(/zlozono=ZAM-\d+$/);
  const numer = new URL(page.url()).searchParams.get('zlozono')!;

  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByText('Faktura na firmę: Biuro Mikołaja')).toBeVisible();
  await expect(page.getByTestId('order-nip')).toHaveText('1012023036');

  const pobieranie = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const plik = await pobieranie;
  expect(plik.suggestedFilename()).toBe(`faktura-${numer}.html`);

  const tresc = readFileSync(await plik.path(), 'utf8');
  expect(tresc).toContain(`Faktura FV/2026/${numer}`);
  expect(tresc).toContain('Biuro Mikołaja');
  expect(tresc).toContain('NIP nabywcy: 1012023036');
  expect(tresc).toContain('Razem do zapłaty: 39,99 zł');
});
