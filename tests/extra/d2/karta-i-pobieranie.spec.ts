import fs from 'node:fs';
import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 2, zadanie 1: nowa karta przeglądarki i pobieranie pliku (krok 2 karty).
// Karta: docs/cwiczenia/extra-d2-iframe-dialog-pliki.md
//
// Wzorzec dla obu przypadków: najpierw zacznij czekać na zdarzenie, potem kliknij.
//   const obietnica = page.waitForEvent('popup');   // albo 'download'
//   await page.getByRole('link', { name: '...' }).click();
//   const wynik = await obietnica;

test.fixme('link „Regulamin” otwiera regulamin w nowej karcie', async ({ page }) => {
  // TODO 1: otwórz stronę główną.
  // TODO 2: zacznij czekać na nową kartę (zdarzenie 'popup') i kliknij link „Regulamin” w stopce.
  // TODO 3: w nowej karcie sprawdź adres (kończy się na /regulamin) i nagłówek „Regulamin sklepu Namssor”.
  // TODO 4: sprawdź, że pierwsza karta nadal pokazuje nagłówek „Produkty”.
});

test.fixme('eksport zamówień pobiera plik CSV z nagłówkiem i zamówieniem ZAM-1001', async ({ page }) => {
  // TODO 1: zaloguj się jako admin / admin123 i otwórz /admin/zamowienia.
  // TODO 2: zacznij czekać na zdarzenie 'download' i kliknij link „Eksportuj do CSV”.
  // TODO 3: sprawdź nazwę pliku: pobieranie.suggestedFilename() ma być 'zamowienia.csv'.
  // TODO 4: przeczytaj plik: const tresc = fs.readFileSync(await pobieranie.path(), 'utf8');
  //   Sprawdź, że zawiera nagłówek numer;data;klient;produkt;ilosc;wartosc;status
  //   i cały wiersz zamówienia ZAM-1001 (przepisz go z pliku pobranego ręcznie w przeglądarce).
});
