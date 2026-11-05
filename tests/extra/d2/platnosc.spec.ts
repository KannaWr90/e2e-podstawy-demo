import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 2, zadanie 1: płatność w ramce (iframe).
// Karta: docs/cwiczenia/extra-d2-iframe-dialog-pliki.md
//
// Formularz karty jest w ramce <iframe title="Bramka płatnicza">. Locatory strony głównej
// nie widzą jej wnętrza. Wejście do ramki:
//   const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
//   await bramka.getByLabel('Numer karty').fill('...');

// Oba testy korzystają z koszyka tego samego klienta (user), więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Płacić można tylko za niepusty koszyk.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Mydło w kostce' }).click();
  await expect(page.getByText('Dodano do koszyka: Mydło w kostce')).toBeVisible();
});

test.fixme('karta odrzucona przez bank pokazuje komunikat w ramce', async ({ page }) => {
  // TODO 1: otwórz /koszyk/platnosc i wejdź do ramki „Bramka płatnicza”.
  // TODO 2: wpisz kartę 4000 0000 0000 0002 i kliknij „Zapłać” (oba elementy są w ramce).
  // TODO 3: sprawdź komunikat w ramce (rola alert): „Płatność odrzucona przez bank. Użyj innej karty.”
  // TODO 4: sprzątanie: w /koszyk kliknij „Usuń: Mydło w kostce” i sprawdź, że wiersza już nie ma.
});

test.fixme('przyjęta płatność daje numer zamówienia', async ({ page, request }) => {
  // TODO 1: otwórz /koszyk/platnosc, w ramce wpisz kartę 4111 1111 1111 1111 i kliknij „Zapłać”.
  // TODO 2: sprawdź nagłówek „Płatność przyjęta” w ramce.
  // TODO 3: sprawdź numer zamówienia (getByTestId('payment-order')) wyrażeniem /^ZAM-\d+(, ZAM-\d+)*$/.
  //   Jedno zamówienie na każdą pozycję koszyka, numery po przecinku.
  // TODO 4: sprzątanie: zaloguj się przez API jako admin i anuluj każde z tych zamówień:
  //   POST /api/admin/orders/<numer>/cancel, oczekiwany status 200.
  //   Tekst z locatora weźmiesz przez: await numery.innerText()
});
