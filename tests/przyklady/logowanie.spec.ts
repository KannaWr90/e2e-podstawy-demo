// Każdy test zaczyna się od tego importu: `test` opisuje test, `expect` sprawdza wynik.
import { test, expect } from '@playwright/test';

// test.describe grupuje testy jednej funkcji. W raporcie zobaczysz je pod nazwą „Logowanie”.
test.describe('Logowanie', () => {
  test('poprawne dane logują użytkownika', async ({ page }) => {
    // 1. Otwórz stronę logowania. Adres serwera jest w playwright.config.ts (baseURL).
    await page.goto('/logowanie');

    // 2. Wypełnij pola. getByLabel szuka pola po jego etykiecie, tak jak widzi je człowiek.
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');

    // 3. Kliknij przycisk o nazwie „Zaloguj”.
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    // 4. Sprawdź wynik. expect sam czeka (domyślnie do 5 s), aż napis się pojawi.
    await expect(page.getByText('Zalogowano jako user')).toBeVisible();
  });

  test('błędne hasło pokazuje komunikat', async ({ page }) => {
    await page.goto('/logowanie');

    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('zle-haslo');
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    // Komunikat o błędzie ma rolę „alert”, więc znajdziemy go przez getByRole.
    await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy login lub hasło');
    // Użytkownik nadal jest na stronie logowania.
    await expect(page).toHaveURL(/logowanie/);
  });

  test('wylogowanie przywraca link „Zaloguj”', async ({ page }) => {
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    await page.getByRole('button', { name: 'Wyloguj' }).click();

    await expect(page.getByRole('link', { name: 'Zaloguj' })).toBeVisible();
  });
});
