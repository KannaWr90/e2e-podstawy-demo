import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 4: jeden test, kilka zestawów danych.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md

// Jeden zestaw danych: błędny adres i komunikat, który ma się pojawić przy polu.
interface ZestawAdresu {
  opis: string;
  ulica: string;
  kodPocztowy: string;
  miasto: string;
  telefon: string;
  oczekiwanyBlad: string;
}

// W każdym zestawie błędne jest dokładnie jedno pole. Reszta jest poprawna.
const zestawy: ZestawAdresu[] = [
  {
    opis: 'kod pocztowy bez myślnika',
    ulica: 'ul. Kwiatowa 5/2', kodPocztowy: '00000', miasto: 'Warszawa', telefon: '500 100 200',
    oczekiwanyBlad: 'Kod pocztowy musi mieć format 00-000',
  },
  {
    opis: 'telefon z 5 cyframi',
    ulica: 'ul. Kwiatowa 5/2', kodPocztowy: '00-001', miasto: 'Warszawa', telefon: '12345',
    oczekiwanyBlad: 'Telefon musi mieć 9 cyfr (opcjonalnie z +48)',
  },
  {
    opis: 'cyfra w nazwie miasta',
    ulica: 'ul. Kwiatowa 5/2', kodPocztowy: '00-001', miasto: 'Warszawa 2', telefon: '500 100 200',
    oczekiwanyBlad: 'Nazwa miasta może zawierać tylko litery',
  },
  {
    opis: 'pusta ulica',
    ulica: '', kodPocztowy: '00-001', miasto: 'Warszawa', telefon: '500 100 200',
    oczekiwanyBlad: 'Podaj ulicę i numer domu',
  },
];

for (const zestaw of zestawy) {
  // Nazwa testu musi być inna dla każdego zestawu, dlatego zawiera opis.
  test(`błędny adres nie zapisuje się: ${zestaw.opis}`, async ({ page }) => {
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user')).toBeVisible();

    await page.goto('/konto/adres');
    await page.getByLabel('Ulica i numer').fill(zestaw.ulica);
    await page.getByLabel('Kod pocztowy').fill(zestaw.kodPocztowy);
    await page.getByLabel('Miasto').fill(zestaw.miasto);
    await page.getByLabel('Telefon').fill(zestaw.telefon);
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText(zestaw.oczekiwanyBlad)).toBeVisible();
  });
}
