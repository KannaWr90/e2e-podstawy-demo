import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: dodaj do koszyka „Żel pod prysznic”.
  // Przycisk szukamy w wierszu tabeli, a nie po skróconej nazwie „Dodaj do koszyka: Żel pod” z nagrania.
  const wierszProduktu = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await wierszProduktu.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Żel pod prysznic')).toBeVisible();

  // TODO 3: otwórz koszyk i sprawdź, że „Żel pod prysznic” w nim jest.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page.getByRole('cell', { name: 'Żel pod prysznic', exact: true })).toBeVisible();

  // TODO 4: kliknij „Usuń” w wierszu „Żel pod prysznic”.
  const wierszKoszyka = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await wierszKoszyka.getByRole('button', { name: 'Usuń' }).click();
  // Po usunięciu adres to /koszyk?usunieto=1, dlatego bez znaku $ na końcu.
  await expect(page).toHaveURL(/\/koszyk/);

  // TODO 5: sprawdź, że wiersza „Żel pod prysznic” już nie ma.
  // Codegen nie nagrywa sprawdzania, że czegoś nie ma, więc ta linia jest dopisana ręcznie.
  await expect(wierszKoszyka).toHaveCount(0);
});
