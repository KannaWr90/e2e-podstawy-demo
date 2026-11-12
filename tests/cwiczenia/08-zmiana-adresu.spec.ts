import { test, expect } from '@playwright/test';

// Przypadki testowe: docs/scenariusze/zmiana-adresu.md (TC-ADR-01, TC-ADR-02)
// i docs/scenariusze/zmiana-adresu.feature.

// Adres startowy konta user (po npm run db:reset)
const ADRES_STARTOWY = { ulica: 'ul. Przykładowa 12/3', kod: '00-001', miasto: 'Warszawa', telefon: '500 100 200' };

test.describe('Zmiana adresu dostawy', () => {
  // Wszystkie testy używają jednego konta user i jednego adresu: biegną po kolei, nie równolegle.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Założenia: zalogowany jako user, strona „Adres dostawy”
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user')).toBeVisible();
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();
  });

  test.describe('poprawny adres', () => {
    test.afterEach(async ({ page }) => {
      // Po teście: adres startowy, żeby inne testy widziały ten sam stan
      await page.goto('/konto/adres');
      await page.getByLabel('Ulica i numer').fill(ADRES_STARTOWY.ulica);
      await page.getByLabel('Kod pocztowy').fill(ADRES_STARTOWY.kod);
      await page.getByLabel('Miasto').fill(ADRES_STARTOWY.miasto);
      await page.getByLabel('Telefon').fill(ADRES_STARTOWY.telefon);
      await page.getByRole('button', { name: 'Zapisz adres' }).click();
      await expect(page.getByTestId('success')).toBeVisible();
    });

    test('zapisanie poprawnego adresu pokazuje komunikat i nowy adres po odświeżeniu', async ({ page }) => {
      await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
      await page.getByLabel('Kod pocztowy').fill('31-001');
      await page.getByLabel('Miasto').fill('Kraków');
      await page.getByLabel('Telefon').fill('600 200 300');
      await page.getByRole('button', { name: 'Zapisz adres' }).click();

      await expect(page.getByTestId('success')).toHaveText('Zapisano adres dostawy.');

      // Krok 5 przypadku: po odświeżeniu pola nadal mają nowy adres
      await page.reload();
      await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
      await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
      await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
      await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
    });
  });

  // Szablon scenariusza „Błędne dane blokują zapis adresu”: jeden test na wiersz tabeli Przykłady
  const PRZYKLADY = [
    { pole: 'Kod pocztowy', wartosc: '31001', komunikat: 'Kod pocztowy musi mieć format 00-000', startowa: ADRES_STARTOWY.kod },
    { pole: 'Telefon', wartosc: '12345', komunikat: 'Telefon musi mieć 9 cyfr (opcjonalnie z +48)', startowa: ADRES_STARTOWY.telefon },
    { pole: 'Miasto', wartosc: '', komunikat: 'Podaj miasto', startowa: ADRES_STARTOWY.miasto },
  ];

  for (const przyklad of PRZYKLADY) {
    test(`błędne pole „${przyklad.pole}” („${przyklad.wartosc}”) blokuje zapis adresu`, async ({ page }) => {
      await page.getByLabel(przyklad.pole).fill(przyklad.wartosc);
      await page.getByRole('button', { name: 'Zapisz adres' }).click();

      await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
      // Komunikat przy polu, dokładny tekst z tabeli Przykłady
      await expect(page.getByText(przyklad.komunikat, { exact: true })).toBeVisible();
      await expect(page.getByTestId('success')).toHaveCount(0);

      // Adres zapisany na koncie się nie zmienił: po ponownym otwarciu pole ma wartość startową (np. 00-001)
      await page.goto('/konto/adres');
      await expect(page.getByLabel(przyklad.pole)).toHaveValue(przyklad.startowa);
    });
  }
});

