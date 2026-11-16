import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('filtr „Dziecko” pokazuje tylko produkty dla dzieci', async ({ page }) => {
  // TODO 1: otwórz stronę „Produkty” (adres /).
  await page.goto('/');

  // TODO 2: w polu „Kategoria” wybierz „Dziecko” i kliknij „Filtruj”.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // TODO 3: sprawdź, że „Liczba produktów” to 3.
  await expect(page.getByText('Liczba produktów: 3')).toBeVisible();

  // TODO 4: sprawdź, że widać „Chusteczki nawilżane dla dzieci”, „Szampon dla dzieci” i „Krem ochronny dla dzieci”.
  // Szukamy komórek tabeli, bo te same nazwy są też w kafelkach pod tabelą.
  await expect(page.getByRole('cell', { name: 'Chusteczki nawilżane dla dzieci', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Szampon dla dzieci', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Krem ochronny dla dzieci', exact: true })).toBeVisible();

  // TODO 5: sprawdź, że NIE widać „Szampon nawilżający” (kategoria Włosy).
  // Codegen nie nagrywa sprawdzania, że czegoś nie ma, więc ta linia jest dopisana ręcznie.
  await expect(page.getByText('Szampon nawilżający')).toHaveCount(0);
});
