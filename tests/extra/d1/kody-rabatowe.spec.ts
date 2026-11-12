import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 5: kod rabatowy z tabeli danych.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md
//
// Test poniżej jest gotowy i sprawdza jeden kod. Twoje zadanie: zamień go na pętlę
// po tablicy zestawów danych, tak żeby każdy kod był osobnym testem.
// Konto tester10 ma osobny koszyk: inne testy dodają produkty do koszyka konta user.

// TODO 1: opisz zestaw danych typem, np.:
// interface ZestawKodu {
//   opis: string;      // trafi do nazwy testu
//   kod: string;       // co wpisujesz w pole „Kod rabatowy”
//   komunikat: string; // co aplikacja pokazuje pod polem
// }

// TODO 2: tablica czterech zestawów: CZARNY20 (przyjęty), JESIEN10 (wygasł),
//   WLOSY15 (tylko kategoria Włosy, a w koszyku jest krem do twarzy), kod, którego nie ma.
//   Komunikaty sprawdź ręcznie w koszyku na http://localhost:4100/koszyk.

// TODO 3: owiń test pętlą: for (const zestaw of zestawy) { test(`... ${zestaw.opis}`, ...) }
//   i zamień wpisane na sztywno wartości na pola zestawu.

test('kod rabatowy, którego nie ma, pokazuje komunikat', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester10');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester10')).toBeVisible();

  // Pole kodu jest tylko przy niepustym koszyku. Krem do twarzy jest w kategorii Twarz.
  // Krem dodajemy z karty produktu (link w kafelku).
  await page.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();
  await page.getByRole('link', { name: 'Koszyk' }).click();

  await page.getByLabel('Kod rabatowy').fill('OSTATNIRAZ');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  await expect(page.getByText('Nie ma takiego kodu rabatowego: OSTATNIRAZ')).toBeVisible();
});
