import { test, expect } from '@playwright/test';

// Tabela /admin/zamowienia: każdy wiersz dostaje nowe, losowe id przy każdym
// wyświetleniu strony. Wiersz znajdujemy po treści, czyli po numerze zamówienia.

test.describe('Panel admina: zamówienia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
    await page.goto('/admin/zamowienia');
  });

  test('anulowanie ZAM-1003 zmienia jego status na „Anulowane”', async ({ page }) => {
    // Wiersz z numerem ZAM-1003, niezależnie od jego id i miejsca w tabeli
    const wiersz = page.getByRole('row').filter({ hasText: 'ZAM-1003' });
    await expect(wiersz).toContainText('Nowe');

    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(page.getByTestId('flash')).toHaveText('Anulowano zamówienie ZAM-1003');
    // Po odświeżeniu strony wiersz ma nowe id, ale lokator znajduje go po numerze
    await expect(wiersz).toContainText('Anulowane');
    await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);
  });

  test('wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006', async ({ page }) => {
    await page.getByLabel('Szukaj zamówienia').fill('Mydło');
    await page.getByRole('button', { name: 'Szukaj' }).click();

    await expect(page.getByText('Znaleziono: 1')).toBeVisible();
    // Wiersze z danymi mają numer zamówienia; wiersz nagłówka go nie ma
    const wiersze = page.getByRole('row').filter({ hasText: 'ZAM-' });
    await expect(wiersze).toHaveCount(1);
    await expect(wiersze).toContainText('ZAM-1006');
  });

  test('wyszukanie nieistniejącego numeru daje pustą tabelę', async ({ page }) => {
    await page.getByLabel('Szukaj zamówienia').fill('ZAM-9999');
    await page.getByRole('button', { name: 'Szukaj' }).click();

    await expect(page.getByText('Znaleziono: 0')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ZAM-' })).toHaveCount(0);
  });
});
