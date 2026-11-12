import { test, expect } from '@playwright/test';

// Wymaganie: klient dodaje w „Moich adresach” adres „Praca” i może ustawić go
// jako domyślny. Po usunięciu adresu domyślnego domyślny znowu jest „Adres główny”.

// Testy biegną po kolei, jeden po drugim
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();
  await page.goto('/konto/adresy');
});

test('dodanie adresu „Praca”', async ({ page }) => {
  await page.getByLabel('Nazwa adresu').fill('Praca');
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 3');
  await page.getByLabel('Kod pocztowy').fill('30-001');
  await page.getByLabel('Miasto').fill('Kraków');
  await page.getByLabel('Telefon').fill('600 300 400');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  await expect(page.getByRole('article', { name: 'Praca' })).toContainText('ul. Biurowa 3');
});

test('adres „Praca” jako domyślny, potem usunięty', async ({ page }) => {
  const praca = page.getByRole('article', { name: 'Praca' });
  await page.getByRole('button', { name: 'Ustaw jako domyślny: Praca' }).click();
  await expect(praca.getByTestId('default-address')).toHaveText('Domyślny');

  await page.getByRole('button', { name: 'Usuń adres: Praca' }).click();
  await expect(praca).toHaveCount(0);
  await expect(page.getByRole('article', { name: /Adres główny/ }).getByTestId('default-address')).toHaveText('Domyślny');
});
