import { test, expect } from '@playwright/test';

// Testy dymne (@smoke): czy środowisko w ogóle działa.
// Uruchomienie samych tych testów: npm run test:smoke

test('strona główna pokazuje listę produktów', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Szampon nawilżający', exact: true })).toBeVisible();
});

test('użytkownik może się zalogować', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/logowanie');

  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByText('Zalogowano jako user')).toBeVisible();
});
