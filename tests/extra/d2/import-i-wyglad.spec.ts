import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 2, zadanie 4: wysyłanie pliku, miękkie asercje, porównanie zrzutów.
// Karta: docs/cwiczenia/extra-d2-iframe-dialog-pliki.md

test.fixme('import pliku CSV z błędami pokazuje wszystkie błędne wiersze', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto('/admin/produkty');

  // Plik z błędami. Import niczego nie zapisze, więc test nie zmienia danych.
  const csv = ['nazwa;kategoria;cena;stan', 'Krem testowy;Ciało;abc;5', ';Twarz;12,99;-1'].join('\n');

  // TODO 1: wyślij plik z pamięci do pola „Plik CSV z produktami”:
  //   setInputFiles({ name: 'produkty-z-bledami.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') })
  // TODO 2: kliknij „Importuj” i sprawdź, że komunikat (rola alert) zawiera „Nie zaimportowano pliku”.
  // TODO 3: miękkimi asercjami (expect.soft) sprawdź: 3 pozycje listy w komunikacie
  //   oraz każdy z trzech komunikatów o błędnych wierszach.
});

test.fixme('strona logowania wygląda tak jak na zrzucie wzorcowym', async ({ page }) => {
  // TODO 1: otwórz /logowanie i poczekaj na nagłówek „Logowanie”.
  // TODO 2: porównaj całą stronę ze zrzutem wzorcowym: await expect(page).toHaveScreenshot('logowanie.png');
});
