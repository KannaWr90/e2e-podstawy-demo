import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista przychodzi z serwera po 0,5–2 s. count() liczy od razu i nie czeka,
  // a expect(lokator) czeka, aż pojawi się pierwszy wiersz.
  await expect(page.getByTestId('order-row').first()).toBeVisible();
});
