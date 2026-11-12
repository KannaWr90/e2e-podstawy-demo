import { test, expect } from '@playwright/test';

// Wymaganie: niezalogowany klient otwiera stronę adresu dostawy. Aplikacja prosi
// o zalogowanie, a po zalogowaniu wraca na stronę adresu dostawy.

test('po zalogowaniu klient wraca na stronę adresu dostawy', async ({ page }) => {
  await page.goto('/konto/adres');
  await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();

  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.keyboard.press('Enter');

  // page.url() czytał adres od razu po naciśnięciu Enter, zanim przyszła odpowiedź
  // serwera z przekierowaniem. toHaveURL czeka, aż adres się zmieni.
  await expect(page).toHaveURL(/\/konto\/adres$/);
  await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();
});
