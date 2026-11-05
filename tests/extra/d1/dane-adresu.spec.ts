import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 4: jeden test, kilka zestawów danych.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md
//
// Test poniżej jest gotowy i sprawdza jeden błędny adres. Twoje zadanie: zamień go
// na pętlę po tablicy zestawów danych, tak żeby każdy zestaw był osobnym testem.

// TODO 1: opisz zestaw danych typem, np.:
// interface ZestawAdresu {
//   opis: string;          // trafi do nazwy testu
//   ulica: string;
//   kodPocztowy: string;
//   miasto: string;
//   telefon: string;
//   oczekiwanyBlad: string; // komunikat przy polu
// }

// TODO 2: tablica co najmniej czterech zestawów: const zestawy: ZestawAdresu[] = [ ... ];

// TODO 3: owiń test pętlą: for (const zestaw of zestawy) { test(`... ${zestaw.opis}`, ...) }
//   i zamień wpisane na sztywno wartości na pola zestawu.

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/konto/adres');
  // Wypełniamy wszystkie pola: inny test mógł w tym czasie zmienić zapisany adres.
  await page.getByLabel('Ulica i numer').fill('ul. Kwiatowa 5/2');
  await page.getByLabel('Kod pocztowy').fill('00000');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('500 100 200');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();
});
