import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('filtr „Dziecko” pokazuje tylko produkty dla dzieci', async ({ page }) => {
  await page.goto('/');

  // Lista rozwijana ma etykietę „Kategoria”, więc getByLabel znajdzie ją bez selektora CSS.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Licznik nie ma etykiety ani roli. data-testid to tu najprostsza droga.
  await expect(page.getByTestId('product-count')).toHaveText('3');
  await expect(page.getByRole('cell', { name: 'Chusteczki nawilżane dla dzieci', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Szampon dla dzieci', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Krem ochronny dla dzieci', exact: true })).toBeVisible();

  // Produkt z innej kategorii zniknął z listy. Sprawdzamy to dopiero po licznikach wyżej,
  // gdy lista jest już przefiltrowana. Inaczej sprawdzenie „nie ma” mogłoby przejść za wcześnie.
  await expect(page.getByRole('cell', { name: 'Szampon nawilżający', exact: true })).toHaveCount(0);
});
