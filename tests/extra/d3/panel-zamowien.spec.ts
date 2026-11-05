import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadanie 2: Page Object panelu admina i fixture z danymi z API.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md

test('admin znajduje nowe zamówienie i je anuluje', async ({ panelZamowien, noweZamowienie }) => {
  await panelZamowien.szukaj(noweZamowienie);
  await expect(panelZamowien.wiersz(noweZamowienie)).toContainText('Nowe');

  await panelZamowien.anuluj(noweZamowienie);

  await expect(panelZamowien.wiersz(noweZamowienie)).toContainText('Anulowane');
});

test('wyszukiwanie po numerze pokazuje tylko jedno zamówienie', async ({ panelZamowien, noweZamowienie }) => {
  await panelZamowien.szukaj(noweZamowienie);

  await expect(panelZamowien.wiersz(noweZamowienie)).toBeVisible();
  // Wiersz nagłówka nie zawiera „ZAM-”, więc liczymy tylko wiersze z danymi.
  await expect(panelZamowien.wiersz('ZAM-')).toHaveCount(1);
});
