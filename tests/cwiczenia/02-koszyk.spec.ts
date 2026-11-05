import { test, expect } from '@playwright/test';

// Ćwiczenie 02: pierwszy test „dodanie produktu do koszyka”.
// Karta: docs/cwiczenia/02-pierwszy-test.md

test('dodany produkt pojawia się w koszyku', async ({ page }) => {
  // Logowanie. Po zalogowaniu aplikacja wraca na stronę „Produkty”.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Każdy przycisk ma napis „Dodaj do koszyka”, ale jego nazwa dla czytnika ekranu
  // zawiera produkt: „Dodaj do koszyka: Płyn micelarny”. Dzięki temu trafiamy w jeden przycisk.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Płyn micelarny' }).click();
  await expect(page.getByText('Dodano do koszyka: Płyn micelarny')).toBeVisible();

  // Koszyk z menu. Komórka z nazwą produktu musi pasować dokładnie (exact),
  // bo nazwę produktu zawiera też komórka z przyciskiem „Usuń: Płyn micelarny”.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page).toHaveURL(/\/koszyk$/);
  await expect(page.getByRole('cell', { name: 'Płyn micelarny', exact: true })).toBeVisible();
});
