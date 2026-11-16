import { test, expect } from '@playwright/test';

// Ćwiczenie 03: przeczytaj ten plik i opisz słowami, co sprawdza.

test('produktu niedostępnego nie da się dodać do koszyka', async ({ page }) => {
  await page.goto('/');

  const wiersz = page.getByRole('row').filter({ hasText: 'Serum z witaminą C' });

  await expect(wiersz).toBeVisible();
  await expect(wiersz.getByText('Niedostępny')).toBeVisible();
  // Nazwa testu obiecuje, że produktu nie da się dodać, więc przycisk jest widoczny, ale wyłączony.
  // toBeDisabled nie sprawdza widoczności, dlatego osobno toBeVisible.
  const przyciskDodaj = wiersz.getByRole('button', { name: 'Dodaj do koszyka' });
  await expect(przyciskDodaj).toBeVisible();
  await expect(przyciskDodaj).toBeDisabled();
});
