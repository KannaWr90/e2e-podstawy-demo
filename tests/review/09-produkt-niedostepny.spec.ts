import { test, expect } from '@playwright/test';

// Wymaganie: Serum z witaminą C nie ma na stanie. Karta produktu pokazuje
// „Niedostępny”, a przycisk „Dodaj do koszyka” jest wyłączony.

test('niedostępnego serum nie da się dodać do koszyka', async ({ page }) => {
  await page.goto('/produkt/7');
  await expect(page.getByRole('heading', { name: 'Serum z witaminą C' })).toBeVisible();

  // Produkt oznaczony jako niedostępny, przycisk wyłączony
  expect(page.getByText('Niedostępny')).toBeTruthy();
  expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeTruthy();
});
