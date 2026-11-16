import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  // Codegen nie nagrał otwarcia strony, bo adres był wpisany przy uruchomieniu. Dopisane ręcznie.
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('textbox', { name: 'Hasło' }).press('Enter');
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: otwórz „Adres dostawy” z menu.
  await page.getByRole('link', { name: 'Adres dostawy' }).click();
  await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();

  // TODO 3: w polu „Kod pocztowy” wpisz 00000 (bez myślnika) i kliknij „Zapisz adres”.
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00000');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  // TODO 4: sprawdź komunikat „Popraw błędy w formularzu (1).”
  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');

  // TODO 5: sprawdź komunikat przy polu: „Kod pocztowy musi mieć format 00-000”.
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();

  // TODO 6: sprawdź, że NIE pojawił się komunikat „Zapisano adres dostawy.”
  // Codegen nie nagrywa sprawdzania, że czegoś nie ma, więc ta linia jest dopisana ręcznie.
  await expect(page.getByText('Zapisano adres dostawy.')).toHaveCount(0);
});
