import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista ładuje się z opóźnieniem. count() nie czeka, a expect(locator) czeka, aż pojawi się pierwszy wiersz.
  // „Co najmniej jedno zamówienie” = widoczny jest pierwszy wiersz, więc first() niczego tu nie ukrywa.
  await expect(page.getByTestId('order-row').first()).toBeVisible();
});
