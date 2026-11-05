import { test, expect } from '@playwright/test';

// Ćwiczenie 06: tabela zamówień w panelu admina (/admin/zamowienia).
// Każdy wiersz dostaje nowe, losowe id przy każdym wyświetleniu strony
// i nie ma data-testid. Wiersz trzeba znaleźć po treści.
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts

test.describe('Panel admina: zamówienia', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie jako administrator i przejście do listy zamówień
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
    await page.goto('/admin/zamowienia');
  });

  test.fixme('anulowanie ZAM-1003 zmienia jego status na „Anulowane”', async ({ page }) => {
    // TODO 1: lokator wiersza z numerem ZAM-1003:
    //   page.getByRole('row').filter({ hasText: 'ZAM-1003' })
    // TODO 2: sprawdź, że wiersz ma status „Nowe” (stan przed akcją)
    // TODO 3: kliknij „Anuluj” w tym wierszu (szukaj przycisku wewnątrz wiersza)
    // TODO 4: sprawdź komunikat „Anulowano zamówienie ZAM-1003”
    // TODO 5: sprawdź, że wiersz ma status „Anulowane” i nie ma już przycisku „Anuluj”
  });

  test.fixme('wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006', async ({ page }) => {
    // TODO 1: wpisz „Mydło” w pole „Szukaj zamówienia” i kliknij „Szukaj”
    // TODO 2: sprawdź napis „Znaleziono: 1”
    // TODO 3: policz wiersze z danymi (wiersz nagłówka nie zawiera „ZAM-”)
    //   i sprawdź, że jedyny wiersz to ZAM-1006
  });

  test.fixme('wyszukanie nieistniejącego numeru daje pustą tabelę', async ({ page }) => {
    // TODO 1: wyszukaj „ZAM-9999”
    // TODO 2: sprawdź napis „Znaleziono: 0” i brak wierszy z danymi
  });
});
