import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.getByRole('link', { name: 'Adres dostawy' }).click();

  // Pozostałe pola są już wypełnione poprawnym adresem. Zmieniamy tylko kod pocztowy.
  await page.getByLabel('Kod pocztowy').fill('00000');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();
  // Adres nie został zapisany.
  await expect(page.getByText('Zapisano adres dostawy.')).toHaveCount(0);
});
