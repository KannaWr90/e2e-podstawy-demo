import { test, expect } from '@playwright/test';

// Projekt, scenariusz P3: administrator dodaje produkt, klient widzi go w sklepie.
// Opis scenariusza: docs/projekt.md

test('produkt dodany przez administratora jest widoczny w sklepie', async ({ page }) => {
  // Unikalna nazwa: test można uruchomić wiele razy bez db:reset.
  const nazwa = `Krem testowy ${Date.now()}`;

  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.goto('/admin/produkty');
  await page.getByLabel('Nazwa').fill(nazwa);
  await page.getByLabel('Kategoria').fill('Testowe');
  await page.getByLabel('Cena (zł)').fill('12,50');
  await page.getByLabel('Stan').fill('5');
  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  await expect(page.getByText(`Dodano produkt: ${nazwa}`)).toBeVisible();

  // Sprawdzamy to, co zobaczy klient: produkt na stronie „Produkty”, z ceną i jako dostępny.
  await page.goto('/');
  await page.getByLabel('Szukaj produktu').fill(nazwa);
  await page.getByRole('button', { name: 'Filtruj' }).click();

  const wiersz = page.getByRole('row').filter({ hasText: nazwa });
  await expect(wiersz).toContainText('12,50 zł');
  await expect(wiersz).toContainText('Dostępny');
  await expect(wiersz.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` })).toBeEnabled();
});
