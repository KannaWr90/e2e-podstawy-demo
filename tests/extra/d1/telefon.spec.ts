import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 2: ten sam sklep na ekranie telefonu.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md
// Uruchomienie: npx playwright test tests/extra/d1 --project=telefon

test('na telefonie klient przechodzi z listy produktów do koszyka', async ({ page, isMobile }) => {
  // W projekcie chromium (komputer) test się pomija. Działa tylko w projekcie „telefon”.
  test.skip(!isMobile, 'Tylko w projekcie telefon');
  // Pixel 7: okno o szerokości 412 pikseli.
  expect(page.viewportSize()?.width).toBe(412);

  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page.getByRole('heading', { name: 'Koszyk' })).toBeVisible();
});
