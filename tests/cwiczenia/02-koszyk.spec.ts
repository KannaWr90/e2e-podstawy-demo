import { test, expect } from '@playwright/test';

// Ćwiczenie 02: pierwszy test „produkt w promocji w koszyku”.
// Karta: docs/cwiczenia/02-pierwszy-test.md

test('produkt w promocji trafia do koszyka z ceną promocyjną', async ({ page }) => {
  // Logowanie. Po zalogowaniu aplikacja wraca na stronę „Produkty”.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Każdy przycisk ma napis „Dodaj do koszyka”, ale jego nazwa dla czytnika ekranu
  // zawiera produkt: „Dodaj do koszyka: Krem do twarzy na dzień”. Dzięki temu trafiamy w jeden przycisk.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Krem do twarzy na dzień' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // Koszyk z menu. Wiersz kremu znajdujemy po treści, a w nim cenę promocyjną.
  // Stara cena 32,99 zł też jest w wierszu (przekreślona), dlatego sprawdzamy nową.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page).toHaveURL(/\/koszyk$/);
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wiersz).toContainText('26,39 zł');

  // Dla szybszych: `toContainText('32,99 zł')` na wierszu też przechodzi, bo stara cena
  // (przekreślona) jest w tym samym wierszu. Cała komórka ceny: stara, nowa, plakietka.
  await expect(wiersz.getByTestId('cart-item-price')).toHaveText('32,99 zł 26,39 zł -20%');
});
