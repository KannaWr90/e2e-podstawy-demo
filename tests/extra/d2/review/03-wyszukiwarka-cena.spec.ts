import { test, expect } from '@playwright/test';

// Wymaganie: po wyszukaniu „odżywka” tabela produktów pokazuje jeden wiersz:
// Odżywka do włosów w cenie promocyjnej 11,99 zł.

test('wyszukiwarka pokazuje odżywkę w cenie promocyjnej', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Szukaj produktu').fill('odżywka');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(page.getByTestId('product-count')).toHaveText('1');
  // Cena promocyjna odżywki w tabeli
  await expect(page.getByText('11,99 zł', { exact: true })).toBeVisible();
});
