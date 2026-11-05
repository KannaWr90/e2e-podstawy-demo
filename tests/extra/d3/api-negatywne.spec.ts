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
  {
    opis: 'lista zamówień bez logowania', kto: 'nikt', metoda: 'GET', sciezka: '/api/orders',
    status: 401, odpowiedz: { error: 'Wymagane logowanie' },
  },
  // TODO: dopisz co najmniej 10 kolejnych przypadków dla endpointów zamówień:
  //   400 (trzy różne błędy pól product_id i qty), 401 (jeszcze jeden endpoint),
  //   403 (dwa endpointy admina wywołane przez klienta), 404 (cztery różne przyczyny).
  // Status i treść odpowiedzi przepisz z tego, co API naprawdę zwraca, i porównaj z app/openapi.json.
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
