import { test, expect } from '@playwright/test';

// Ćwiczenie 08, część B: zamówienie firmowe „Biuro Mikołaja” → status → faktura.
// Przypadek testowy: docs/scenariusze/biuro-mikolaja.md (kroki 1–10),
// ten sam scenariusz w Gherkinie: docs/scenariusze/biuro-mikolaja.feature.
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/08-biuro-mikolaja.spec.ts

test.fixme('Biuro Mikołaja: zamówienie na firmę, status „Wysłane” i faktura z NIP nabywcy', async ({ page }) => {
  // Krok 1 (gotowy). Logowanie klienta firmowego. Koszyk musi być pusty (warunek wstępny):
  // po nieudanym przebiegu mogły w nim zostać kalendarze. DELETE /api/cart opróżnia koszyk
  // zalogowanego klienta; page.request korzysta z logowania z tej przeglądarki.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro')).toBeVisible();
  await page.request.delete('/api/cart');

  // TODO 2: karta produktu /produkt/21, „Ilość” 10, „Dodaj do koszyka”, sprawdź komunikat
  // TODO 3: koszyk: ilość 10 w wierszu kalendarza, jedna pozycja, razem 399,90 zł
  // TODO 4: „Faktura na firmę”, NIP i nazwa firmy, „Złóż zamówienie (płatność przy odbiorze)”.
  //   Komunikat „Złożono zamówienie: …” znika po kilku sekundach: sprawdź go od razu.
  //   Numer zamówienia jest w adresie strony (/zamowienia?zlozono=ZAM-1008):
  //     const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  // TODO 5: strona zamówienia: status „Nowe”, NIP 2412241228, link „Pobierz fakturę”
  // TODO 6–8: „Wyloguj”, logowanie jako admin, /admin/zamowienia/<numer>,
  //   status „Opłacone”, „Zapisz status”, potem „Wysłane”. Po każdym zapisie sprawdź status.
  //   Lista „Status zamówienia” to <select>: selectOption('Opłacone').
  // TODO 9: „Wyloguj”, logowanie jako biuro, /zamowienia/<numer>: status „Wysłane”
  // TODO 10: pobranie faktury. Najpierw page.waitForEvent('download') do zmiennej, potem kliknięcie,
  //   potem await tej zmiennej. Sprawdź nazwę pliku (suggestedFilename) i treść:
  //   NIP nabywcy, pozycję z ilością 10 i wartością, „Razem do zapłaty: 399,90 zł”.
  //   Treść pliku: fs.readFileSync(await pobieranie.path(), 'utf8') (import fs from 'node:fs').
  //   Plik to strona HTML: page.setContent(tresc) wczytuje go do przeglądarki, potem zwykłe lokatory.
});
