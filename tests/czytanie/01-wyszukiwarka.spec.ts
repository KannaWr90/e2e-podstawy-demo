import { test, expect } from '@playwright/test';

// Ćwiczenie 03: przeczytaj ten plik i opisz słowami, co sprawdza.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('wyszukiwanie „zębów” znajduje dwa produkty', async ({ page }) => {
  const wyszukiwarka = page.getByLabel('Szukaj produktu');

  await wyszukiwarka.fill('zębów');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(page.getByTestId('product-count')).toHaveText('2');
  await expect(page.getByRole('cell', { name: 'Pasta do zębów', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Szczoteczka do zębów', exact: true })).toBeVisible();
});

test('wyszukiwanie bez wyników pokazuje komunikat', async ({ page }) => {
  await page.getByLabel('Szukaj produktu').fill('rower');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(page.getByText('Brak produktów spełniających kryteria.')).toBeVisible();
});
