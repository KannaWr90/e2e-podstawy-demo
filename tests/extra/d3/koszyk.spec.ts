import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadania 1 i 2: Page Object koszyka i fixture „zalogowany klient”.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md

// Testy korzystają z koszyka tego samego klienta (user), więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test('dodany produkt jest w koszyku z ilością 1', async ({ koszyk }) => {
  await koszyk.dodajProdukt('Szczoteczka do zębów');
  await koszyk.otworz();

  await expect(koszyk.ilosc('Szczoteczka do zębów')).toHaveText('1');

  // Sprzątanie: koszyk wraca do stanu sprzed testu.
  await koszyk.usun('Szczoteczka do zębów');
});

test('usunięty produkt znika z koszyka', async ({ koszyk }) => {
  await koszyk.dodajProdukt('Pasta do zębów');
  await koszyk.otworz();
  await expect(koszyk.pozycja('Pasta do zębów')).toBeVisible();

  await koszyk.usun('Pasta do zębów');

  await expect(koszyk.pozycja('Pasta do zębów')).toHaveCount(0);
});
