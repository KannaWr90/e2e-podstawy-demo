import { test, expect } from '@playwright/test';

// Wymaganie: Serum z witaminą C nie ma na stanie. Karta produktu pokazuje
// „Niedostępny”, a przycisk „Dodaj do koszyka” jest wyłączony.

test('niedostępnego serum nie da się dodać do koszyka', async ({ page }) => {
  await page.goto('/produkt/7');
  await expect(page.getByRole('heading', { name: 'Serum z witaminą C' })).toBeVisible();

  // await expect(lokator) sprawdza stronę. expect(lokator).toBeTruthy() sprawdzało tylko,
  // że w kodzie jest obiekt lokatora.
  await expect(page.getByTestId('product-availability')).toHaveText('Niedostępny');
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
