import { test, expect } from '@playwright/test';

// Wymaganie (tabela promocji od Bożeny): Krem do twarzy na dzień kosztuje 32,99 zł,
// w Czarny Piątek -20%. Kafelek na stronie głównej pokazuje starą cenę przekreśloną,
// cenę promocyjną 26,39 zł i plakietkę „-20%”.

test('kafelek kremu do twarzy pokazuje cenę promocyjną', async ({ page }) => {
  await page.goto('/');

  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  // Każda cena osobno. toContainText('32,99 zł') na całym kafelku przechodził,
  // bo stara cena też jest w kafelku, choć przekreślona.
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');
});
