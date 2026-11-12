import { test, expect } from '@playwright/test';

// Ćwiczenie 03b: przeczytaj ten plik i opisz słowami, co sprawdza.

// Kategorie do sprawdzenia: nazwa, liczba produktów i jeden produkt z tej kategorii.
const kategorie = [
  { nazwa: 'Włosy', liczbaProduktow: 4, przykladowyProdukt: 'Szampon nawilżający' },
  { nazwa: 'Dziecko', liczbaProduktow: 3, przykladowyProdukt: 'Szampon dla dzieci' },
  { nazwa: 'Dom', liczbaProduktow: 1, przykladowyProdukt: 'Płyn do mycia naczyń' },
];

test.describe('Filtr kategorii', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  for (const kategoria of kategorie) {
    test.describe(`kategoria ${kategoria.nazwa}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.getByLabel('Kategoria').selectOption(kategoria.nazwa);
        await page.getByRole('button', { name: 'Filtruj' }).click();
      });

      test('licznik pokazuje liczbę produktów w kategorii', async ({ page }) => {
        await expect(page.getByTestId('product-count')).toHaveText(String(kategoria.liczbaProduktow));
      });

      test('lista zawiera produkt z tej kategorii', async ({ page }) => {
        await expect(page.getByRole('row').filter({ hasText: kategoria.przykladowyProdukt })).toBeVisible();
      });
    });
  }
});
