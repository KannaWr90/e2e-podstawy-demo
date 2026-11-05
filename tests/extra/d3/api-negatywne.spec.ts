import { test, expect, type APIRequestContext } from '@playwright/test';

// Zadanie dodatkowe dnia 3, zadanie 3: komplet ścieżek negatywnych API zamówień.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md

type Kto = 'nikt' | 'user' | 'admin';

// Jeden przypadek: kto wysyła, jakie żądanie i jakiej odpowiedzi oczekujemy.
interface PrzypadekNegatywny {
  opis: string;
  kto: Kto;
  metoda: 'GET' | 'POST';
  sciezka: string;
  dane?: object;
  status: number;
  odpowiedz: object;
}

const przypadki: PrzypadekNegatywny[] = [
  // 400: błędne dane
  {
    opis: 'zamówienie bez product_id', kto: 'user', metoda: 'POST', sciezka: '/api/orders', dane: { qty: 1 },
    status: 400, odpowiedz: { error: 'Błędne dane', errors: [{ field: 'product_id', message: 'Pole jest wymagane' }] },
  },
  {
    opis: 'zamówienie z product_id jako tekst', kto: 'user', metoda: 'POST', sciezka: '/api/orders', dane: { product_id: 'abc', qty: 1 },
    status: 400, odpowiedz: { error: 'Błędne dane', errors: [{ field: 'product_id', message: 'Musi być dodatnią liczbą całkowitą' }] },
  },
  {
    opis: 'zamówienie z ilością 11', kto: 'user', metoda: 'POST', sciezka: '/api/orders', dane: { product_id: 1, qty: 11 },
    status: 400, odpowiedz: { error: 'Błędne dane', errors: [{ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' }] },
  },
  // 401: brak logowania
  {
    opis: 'lista zamówień bez logowania', kto: 'nikt', metoda: 'GET', sciezka: '/api/orders',
    status: 401, odpowiedz: { error: 'Wymagane logowanie' },
  },
  {
    opis: 'anulowanie bez logowania', kto: 'nikt', metoda: 'POST', sciezka: '/api/admin/orders/ZAM-1001/cancel',
    status: 401, odpowiedz: { error: 'Wymagane logowanie' },
  },
  // 403: zalogowany, ale bez roli admin
  {
    opis: 'klient pobiera listę wszystkich zamówień', kto: 'user', metoda: 'GET', sciezka: '/api/admin/orders',
    status: 403, odpowiedz: { error: 'Brak uprawnień' },
  },
  {
    opis: 'klient anuluje zamówienie', kto: 'user', metoda: 'POST', sciezka: '/api/admin/orders/ZAM-1001/cancel',
    status: 403, odpowiedz: { error: 'Brak uprawnień' },
  },
  // 404: nie ma zasobu (albo klient nie może go zobaczyć)
  {
    opis: 'zamówienie, którego nie ma', kto: 'user', metoda: 'GET', sciezka: '/api/orders/ZAM-9999',
    status: 404, odpowiedz: { error: 'Nie ma takiego zamówienia' },
  },
  {
    opis: 'cudze zamówienie', kto: 'user', metoda: 'GET', sciezka: '/api/orders/ZAM-1005',
    status: 404, odpowiedz: { error: 'Nie ma takiego zamówienia' },
  },
  {
    opis: 'zamówienie produktu, którego nie ma', kto: 'user', metoda: 'POST', sciezka: '/api/orders', dane: { product_id: 999, qty: 1 },
    status: 404, odpowiedz: { error: 'Nie ma takiego produktu' },
  },
  {
    opis: 'admin anuluje zamówienie, którego nie ma', kto: 'admin', metoda: 'POST', sciezka: '/api/admin/orders/ZAM-9999/cancel',
    status: 404, odpowiedz: { error: 'Nie ma takiego zamówienia' },
  },
];

const HASLA = { user: 'user123', admin: 'admin123' };

// Nagłówki z tokenem dla wybranego konta. Dla „nikt” bez nagłówka.
async function naglowki(request: APIRequestContext, kto: Kto): Promise<Record<string, string>> {
  if (kto === 'nikt') return {};
  const logowanie = await request.post('/api/login', { data: { login: kto, password: HASLA[kto] } });
  expect(logowanie.status()).toBe(200);
  const { token } = await logowanie.json();
  return { Authorization: `Bearer ${token}` };
}

for (const p of przypadki) {
  test(`${p.status}: ${p.opis}`, async ({ request }) => {
    const headers = await naglowki(request, p.kto);

    const odpowiedz = await request.fetch(p.sciezka, { method: p.metoda, headers, data: p.dane });

    expect(odpowiedz.status()).toBe(p.status);
    expect(await odpowiedz.json()).toEqual(p.odpowiedz);
  });
}
