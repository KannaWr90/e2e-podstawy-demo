import fs from 'node:fs';
import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 2, zadanie 1: nowa karta przeglądarki i pobieranie pliku (krok 2 karty).
// Karta: docs/cwiczenia/extra-d2-iframe-dialog-pliki.md

test('link „Regulamin” otwiera regulamin w nowej karcie', async ({ page }) => {
  await page.goto('/');

  // Najpierw zaczynamy czekać na nową kartę, potem klikamy. Odwrotnie można ją przegapić.
  const nowaKartaObietnica = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Regulamin' }).click();
  const regulamin = await nowaKartaObietnica;

  await expect(regulamin).toHaveURL(/\/regulamin$/);
  await expect(regulamin.getByRole('heading', { name: 'Regulamin sklepu Namssor' })).toBeVisible();
  // Pierwsza karta nadal pokazuje produkty.
  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
});

test('eksport zamówień pobiera plik CSV z nagłówkiem i zamówieniem ZAM-1001', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto('/admin/zamowienia');

  const pobieranieObietnica = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Eksportuj do CSV' }).click();
  const pobieranie = await pobieranieObietnica;

  expect(pobieranie.suggestedFilename()).toBe('zamowienia.csv');
  // Playwright zapisuje plik w folderze tymczasowym. path() zwraca jego ścieżkę.
  const tresc = fs.readFileSync(await pobieranie.path(), 'utf8');
  expect(tresc).toContain('numer;data;klient;produkt;ilosc;wartosc;status');
  expect(tresc).toContain('ZAM-1001;2026-10-01 10:15;user;Szampon nawilżający;1;12,99 zł;Nowe');
});
