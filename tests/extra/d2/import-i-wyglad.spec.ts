import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 2, zadanie 2: wysyłanie pliku, miękkie asercje, porównanie zrzutów (kroki 3 i 4 karty).
// Karta: docs/cwiczenia/extra-d2-iframe-dialog-pliki.md

test('import pliku CSV z błędami pokazuje wszystkie błędne wiersze', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto('/admin/produkty');

  // Plik powstaje w pamięci, nie na dysku. Ma błędy, więc import niczego nie zapisze.
  const csv = ['nazwa;kategoria;cena;stan', 'Krem testowy;Ciało;abc;5', ';Twarz;12,99;-1'].join('\n');
  await page.getByLabel('Plik CSV z produktami').setInputFiles({
    name: 'produkty-z-bledami.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf8'),
  });
  await page.getByRole('button', { name: 'Importuj' }).click();

  const bledy = page.getByRole('alert');
  await expect(bledy).toContainText('Nie zaimportowano pliku');
  // Miękkie asercje: test sprawdza wszystkie trzy komunikaty, nawet gdy pierwszy się nie zgadza.
  await expect.soft(bledy.getByRole('listitem')).toHaveCount(3);
  await expect.soft(bledy).toContainText('Wiersz 2: cena musi być liczbą większą od zera');
  await expect.soft(bledy).toContainText('Wiersz 3: brak nazwy');
  await expect.soft(bledy).toContainText('Wiersz 3: stan musi być liczbą całkowitą, co najmniej 0');
});

test('strona logowania wygląda tak jak na zrzucie wzorcowym', async ({ page }) => {
  await page.goto('/logowanie');
  await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();

  // Pierwsze uruchomienie zapisuje zrzut wzorcowy. Kolejne porównują z nim stronę.
  await expect(page).toHaveScreenshot('logowanie.png');
});
