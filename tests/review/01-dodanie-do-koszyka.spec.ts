import { test, expect } from '@playwright/test';

// Wymaganie: zalogowany klient klika „Dodaj do koszyka” przy produkcie
// „Balsam do ciała” i ten produkt trafia do jego koszyka.

test('dodanie balsamu do ciała do koszyka', async ({ page }) => {
  // Logowanie jako klient
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Stan przed akcją: balsamu nie ma w koszyku
  await page.goto('/koszyk');
  const pozycjaWKoszyku = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });
  await expect(pozycjaWKoszyku).toHaveCount(0);

  // Akcja: dodanie produktu z listy
  await page.goto('/');
  const wiersz = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });
  await wiersz.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByTestId('flash')).toHaveText('Dodano do koszyka: Balsam do ciała');

  // Efekt: balsam jest w koszyku, w ilości 1
  await page.goto('/koszyk');
  await expect(pozycjaWKoszyku.getByTestId('cart-item-qty')).toHaveText('1');

  // Sprzątanie: koszyk wraca do stanu sprzed testu
  await pozycjaWKoszyku.getByRole('button', { name: 'Usuń' }).click();
  await expect(pozycjaWKoszyku).toHaveCount(0);
});
