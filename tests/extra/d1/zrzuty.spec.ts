import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 3: zrzut ekranu przy błędzie i zrzut zrobiony ręcznie.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md

test.fixme('strona „Moje zamówienia” pokazuje ZAM-1001', async ({ page }, testInfo) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');
  await expect(page.getByRole('row').filter({ hasText: 'ZAM-1001' })).toBeVisible();

  // TODO 1: zrób zrzut całej strony do pliku w folderze wyników tego testu:
  //   const plik = testInfo.outputPath('moje-zamowienia.png');
  //   await page.screenshot({ path: plik, fullPage: true });
  // TODO 2: dołącz plik do raportu HTML pod nazwą „moje-zamowienia”:
  //   await testInfo.attach('moje-zamowienia', { path: plik, contentType: 'image/png' });
});
