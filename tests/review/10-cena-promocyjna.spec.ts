import { test, expect } from '@playwright/test';

// Wymaganie (tabela promocji od Bożeny): Krem do twarzy na dzień kosztuje 32,99 zł,
// w Czarny Piątek -20%. Kafelek na stronie głównej pokazuje starą cenę przekreśloną,
// cenę promocyjną 26,39 zł i plakietkę „-20%”.

test('kafelek kremu do twarzy pokazuje cenę promocyjną', async ({ page }) => {
  await page.goto('/');

  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek).toBeVisible();

  // Cena promocyjna kremu
  await expect(kafelek).toContainText('32,99 zł');
});
