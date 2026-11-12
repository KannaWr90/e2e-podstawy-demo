import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 5: kod rabatowy z tabeli danych.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md
// Konto tester10 ma osobny koszyk: inne testy dodają produkty do koszyka konta user.

// Jeden zestaw danych: kod wpisany w pole i komunikat, który ma się pojawić.
interface ZestawKodu {
  opis: string;
  kod: string;
  komunikat: string;
}

// W koszyku jest tylko krem do twarzy (kategoria Twarz), dlatego WLOSY15 nie działa.
// JESIEN10 był ważny do 31.10.2026, CZARNY20 jest ważny do 30.11.2026.
const zestawy: ZestawKodu[] = [
  { opis: 'CZARNY20 jest przyjęty', kod: 'CZARNY20', komunikat: 'Kod CZARNY20 przyjęty: -20% na całe zamówienie.' },
  { opis: 'JESIEN10 wygasł', kod: 'JESIEN10', komunikat: 'Kod JESIEN10 wygasł 31.10.2026.' },
  {
    opis: 'WLOSY15 bez produktu z kategorii Włosy',
    kod: 'WLOSY15',
    komunikat: 'Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.',
  },
  { opis: 'kod, którego nie ma', kod: 'OSTATNIRAZ', komunikat: 'Nie ma takiego kodu rabatowego: OSTATNIRAZ' },
];

for (const zestaw of zestawy) {
  test(`kod rabatowy: ${zestaw.opis}`, async ({ page }) => {
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

    await page.getByLabel('Kod rabatowy').fill(zestaw.kod);
    await page.getByRole('button', { name: 'Zastosuj kod' }).click();

    await expect(page.getByText(zestaw.komunikat)).toBeVisible();
  });
}
