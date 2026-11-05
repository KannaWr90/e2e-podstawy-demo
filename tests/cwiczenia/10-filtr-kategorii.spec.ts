import { test, expect } from '@playwright/test';

// Test napisany przez skill /test-e2e.
// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty,
// wszystkie z kategorii „Dziecko”.

test('filtr kategorii „Dziecko” pokazuje 3 produkty dla dzieci', async ({ page }) => {
  await page.goto('/');
  // Stan przed akcją: bez filtra produktów jest więcej niż 3
  await expect(page.getByTestId('product-count')).not.toHaveText('3');

  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(page.getByTestId('product-count')).toHaveText('3');
  const wiersze = page.getByTestId('product-row');
  await expect(wiersze).toHaveCount(3);
  await expect(page.getByTestId('product-name')).toHaveText([
    'Chusteczki nawilżane dla dzieci',
    'Krem ochronny dla dzieci',
    'Szampon dla dzieci',
  ]);
  // Każdy wiersz ma kategorię „Dziecko”
  await expect(wiersze.filter({ hasText: 'Dziecko' })).toHaveCount(3);
});
