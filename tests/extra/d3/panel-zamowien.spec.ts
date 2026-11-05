import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadanie 2: Page Object panelu admina i fixture z danymi z API.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md
//
// Najpierw utwórz plik ./strony/panel-zamowien.ts z klasą PanelZamowien i metodami:
//   otworz(), szukaj(tekst), wiersz(numer): Locator, anuluj(numer)
// Potem dopisz fixtures panelZamowien i noweZamowienie w ./fixtures.ts.

test.fixme('admin znajduje nowe zamówienie i je anuluje', async ({ page }) => {
  // TODO 1: zmień parametr na ({ panelZamowien, noweZamowienie }).
  // TODO 2: wyszukaj zamówienie, sprawdź status „Nowe” w wierszu.
  // TODO 3: anuluj je i sprawdź status „Anulowane”.
});

test.fixme('wyszukiwanie po numerze pokazuje tylko jedno zamówienie', async ({ page }) => {
  // TODO: wyszukaj noweZamowienie i sprawdź, że w tabeli jest dokładnie jeden wiersz z „ZAM-”.
});
