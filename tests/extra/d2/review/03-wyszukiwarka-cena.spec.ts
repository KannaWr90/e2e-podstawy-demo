import { test, expect } from '@playwright/test';

// Wymaganie: po wyszukaniu „odżywka” tabela produktów pokazuje jeden wiersz:
// Odżywka do włosów w cenie promocyjnej 11,99 zł.

test('wyszukiwarka pokazuje odżywkę w cenie promocyjnej', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Szukaj produktu').fill('odżywka');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(page.getByTestId('product-count')).toHaveText('1');
  // Cenę szukamy w wierszu tabeli. getByText('11,99 zł', { exact: true }) na całej stronie
  // trafiał w cenę na kafelku pod tabelą: komórka tabeli ma tekst „14,99 zł 11,99 zł”,
  // więc dokładne dopasowanie jej nie łapało.
  const wiersz = page.getByRole('row').filter({ hasText: 'Odżywka do włosów' });
  await expect(wiersz).toHaveCount(1);
  await expect(wiersz.getByRole('cell').nth(2)).toHaveText('14,99 zł 11,99 zł');
});
