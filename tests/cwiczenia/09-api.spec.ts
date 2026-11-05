import { test, expect } from '@playwright/test';

// Ćwiczenie 09: testy API zamówień i dane przygotowane przez API.
// Opis endpointów: http://localhost:4100/api/docs (plik app/openapi.json).
//
// Logowanie przez API zwraca token. Token wysyłasz w nagłówku Authorization:
//   const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
//   const { token } = await logowanie.json();
//   await request.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/09-api.spec.ts

test.describe('API zamówień', () => {
  test('GET /api/orders zwraca zamówienia zalogowanego klienta', async ({ request }) => {
    // Ten test jest gotowy: wzór dla pozostałych.
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(200);
    const zamowienia = await odpowiedz.json();
    expect(zamowienia).toContainEqual(
      expect.objectContaining({ number: 'ZAM-1001', product: 'Szampon nawilżający', customer: 'user' }),
    );
  });

  test.fixme('POST /api/orders tworzy zamówienie ze statusem „new”', async ({ request }) => {
    // TODO 1: zaloguj się jako user i weź token
    // TODO 2: POST /api/orders z danymi { product_id: 20, qty: 2 }
    // TODO 3: sprawdź status 201 i treść: product „Płyn do mycia naczyń”, qty 2, status „new”,
    //   numer w formacie ZAM-1234
    // TODO 4: posprzątaj: zaloguj się jako admin i wyślij
    //   POST /api/admin/orders/<numer>/cancel (oczekiwany status 200)
  });

  test.fixme('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    // TODO: zaloguj się jako user, wyślij { product_id: 20, qty: 0 }.
    // Sprawdź status 400 i całą treść odpowiedzi: pole „error” i listę „errors” z polami field i message.
  });

  test.fixme('GET /api/orders bez logowania zwraca 401', async ({ request }) => {
    // TODO: wyślij żądanie bez tokena, sprawdź status 401 i treść { error: '...' }
  });

  test.fixme('GET /api/orders/ZAM-9999 zwraca 404', async ({ request }) => {
    // TODO: zaloguj się jako user, zapytaj o nieistniejące zamówienie, sprawdź status 404 i treść
  });
});

test.describe('Anulowanie zamówienia przygotowanego przez API', () => {
  // Numer zamówienia utworzonego przed testem
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // TODO 1: zaloguj się przez API jako user, utwórz zamówienie { product_id: 20, qty: 1 },
    //   sprawdź status 201 i zapisz numer: numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // TODO 2: sprzątanie. Zaloguj się przez API jako admin i anuluj zamówienie `numer`.
    //   Gdy test już je anulował, API odpowie 409. Oba statusy (200 i 409) są tu w porządku.
  });

  test.fixme('admin anuluje nowe zamówienie w panelu', async ({ page }) => {
    // TODO 3: zaloguj się w przeglądarce jako admin, otwórz /admin/zamowienia
    // TODO 4: znajdź wiersz po numerze `numer`, sprawdź status „Nowe”, kliknij „Anuluj”
    // TODO 5: sprawdź komunikat „Anulowano zamówienie <numer>” i status „Anulowane” w wierszu
  });
});
