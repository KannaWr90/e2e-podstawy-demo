import { test, expect } from '@playwright/test';

// Ćwiczenie 08: zmiana adresu dostawy.
// Scenariusze: docs/scenariusze/zmiana-adresu.md i docs/scenariusze/zmiana-adresu.feature
// Wszystkie testy zmieniają adres tego samego konta (user), dlatego uruchamiaj ten plik osobno:
//   npx playwright test tests/cwiczenia/08-zmiana-adresu.spec.ts

test.describe('Zmiana adresu dostawy', () => {
  // Testy w tym pliku idą po kolei, a nie równolegle, bo dzielą jeden adres konta.
  // To nie chroni przed innymi plikami, które w tym samym czasie zmieniają adres.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Logowanie jako klient.
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible();

    // Przejście do formularza adresu z menu.
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();

    // Warunek wstępny: na koncie jest adres startowy.
    // Jeśli nie, baza jest brudna i test od razu to pokaże (pomoże npm run db:reset).
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: przywracamy adres startowy przez API, żeby inne testy widziały ten sam stan.
    // page.request korzysta z ciasteczek zalogowanego użytkownika, więc nie logujemy się drugi raz.
    // afterEach działa także wtedy, gdy test padnie w połowie.
    const odpowiedz = await page.request.post('/api/account/address', {
      data: {
        street: 'ul. Przykładowa 12/3',
        postal_code: '00-001',
        city: 'Warszawa',
        phone: '500 100 200',
      },
    });
    expect(odpowiedz.status()).toBe(200);
  });

  test('zapisany adres dostawy jest widoczny po ponownym otwarciu strony', async ({ page }) => {
    // Wpisujemy nowy adres (fill najpierw czyści pole).
    await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
    await page.getByLabel('Kod pocztowy').fill('31-001');
    await page.getByLabel('Miasto').fill('Kraków');
    await page.getByLabel('Telefon').fill('600 200 300');

    // Pola pokazują wpisane wartości (krok 3 z TC-ADR-01).
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');

    await page.getByRole('button', { name: 'Zapisz adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');

    // Otwieramy stronę od nowa zamiast F5. Po zapisie adres strony to /konto/adres?zapisano=1,
    // a F5 zostawia ten parametr, więc komunikat „Zapisano…” pokazałby się znowu.
    // Strona bez parametru pokazuje tylko to, co naprawdę jest zapisane w bazie.
    await page.goto('/konto/adres');
    await expect(page.getByRole('status')).toHaveCount(0);

    // Nowy adres został zapisany na koncie.
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
  });

  test('kod pocztowy bez myślnika blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Kod pocztowy').fill('31001');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    // Komunikat na górze formularza i błąd przypisany do pola.
    // Opis pola (aria-describedby) to podpowiedź „Format: 00-000” i treść błędu razem,
    // dlatego sprawdzamy wyrażeniem /.../, że opis zawiera treść błędu.
    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByLabel('Kod pocztowy')).toHaveAccessibleDescription(/Kod pocztowy musi mieć format 00-000/);
    await expect(page.getByText('Zapisano adres dostawy.')).toHaveCount(0);

    // Otwieramy stronę od nowa: na koncie nadal jest adres startowy.
    await page.goto('/konto/adres');
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('telefon krótszy niż 9 cyfr blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Telefon').fill('12345');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByLabel('Telefon')).toHaveAccessibleDescription(/Telefon musi mieć 9 cyfr \(opcjonalnie z \+48\)/);
    await expect(page.getByText('Zapisano adres dostawy.')).toHaveCount(0);

    // Otwieramy stronę od nowa: na koncie nadal jest adres startowy.
    await page.goto('/konto/adres');
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('puste miasto blokuje zapis adresu', async ({ page }) => {
    // fill('') czyści pole.
    await page.getByLabel('Miasto').fill('');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByLabel('Miasto')).toHaveAccessibleDescription(/Podaj miasto/);
    await expect(page.getByText('Zapisano adres dostawy.')).toHaveCount(0);

    // Otwieramy stronę od nowa: na koncie nadal jest adres startowy.
    await page.goto('/konto/adres');
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });
});
