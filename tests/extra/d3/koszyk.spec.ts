import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadania 1 i 2: Page Object koszyka i fixture „zalogowany klient”.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md
// Uwaga: `test` i `expect` pochodzą z ./fixtures, nie z @playwright/test.

// Testy korzystają z koszyka tego samego klienta (user), więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.fixme('dodany produkt jest w koszyku z ilością 1', async ({ stronaKlienta }) => {
  // TODO 1: zmień parametr na ({ koszyk }), gdy fixture koszyk będzie gotowa.
  // TODO 2: dodaj „Szczoteczka do zębów”, otwórz koszyk, sprawdź ilość 1.
  // TODO 3: sprzątanie: usuń produkt z koszyka.
});

test.fixme('usunięty produkt znika z koszyka', async ({ stronaKlienta }) => {
  // TODO: tak samo, z produktem „Pasta do zębów”: dodaj, sprawdź, że jest, usuń, sprawdź, że go nie ma.
});
