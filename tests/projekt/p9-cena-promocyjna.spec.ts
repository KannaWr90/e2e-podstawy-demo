import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Projekt, scenariusz P9: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Opis scenariusza: docs/projekt.md

const PRODUKT = 'Krem do twarzy na dzień';

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  await zaloguj(page);

  // Kafelek na stronie głównej
  await page.goto('/');
  const kafelek = page.getByRole('article', { name: PRODUKT });
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // Karta produktu
  await kafelek.getByRole('link', { name: PRODUKT }).click();
  await expect(page.getByRole('heading', { name: PRODUKT })).toBeVisible();
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  // Koszyk: cena jednej sztuki w kolumnie „Cena”
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText(`Dodano do koszyka: ${PRODUKT}`)).toBeVisible();
  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: PRODUKT });
  await expect(wiersz.getByTestId('cart-item-price')).toContainText('26,39 zł');

  // Sprzątanie: krem nie zostaje w koszyku konta
  await wiersz.getByRole('button', { name: `Usuń: ${PRODUKT}` }).click();
  await expect(page.getByRole('row').filter({ hasText: PRODUKT })).toHaveCount(0);
});
