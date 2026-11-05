import { test, expect } from '@playwright/test';

// Wymaganie: klient zmienia adres dostawy. Po zapisie widzi komunikat
// „Zapisano adres dostawy.”, a formularz pokazuje nowy adres.

// Adres startowy konta user (po npm run db:reset)
const ADRES_STARTOWY = { ulica: 'ul. Przykładowa 12/3', kod: '00-001', miasto: 'Warszawa', telefon: '500 100 200' };

test.afterEach(async ({ page }) => {
  // Sprzątanie: przywróć adres startowy, nawet gdy test padł w połowie
  await page.goto('/konto/adres');
  await page.getByLabel('Ulica i numer').fill(ADRES_STARTOWY.ulica);
  await page.getByLabel('Kod pocztowy').fill(ADRES_STARTOWY.kod);
  await page.getByLabel('Miasto').fill(ADRES_STARTOWY.miasto);
  await page.getByLabel('Telefon').fill(ADRES_STARTOWY.telefon);
  await page.getByRole('button', { name: 'Zapisz adres' }).click();
  await expect(page.getByTestId('success')).toBeVisible();
});

test('zmiana adresu dostawy zapisuje nowy adres', async ({ page }) => {
  // Wymaganie dotyczy klienta, więc logujemy się kontem klienta
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Stan przed akcją: na koncie jest inne miasto niż to, które zapiszemy
  await page.goto('/konto/adres');
  await expect(page.getByLabel('Miasto')).not.toHaveValue('Kraków');

  await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
  await page.getByLabel('Kod pocztowy').fill('31-001');
  await page.getByLabel('Miasto').fill('Kraków');
  await page.getByLabel('Telefon').fill('600 200 300');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  await expect(page.getByTestId('success')).toHaveText('Zapisano adres dostawy.');
  // Nowy adres po ponownym otwarciu strony, czyli odczytany z serwera
  await page.goto('/konto/adres');
  await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
  await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
  await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
  await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
});
