import { test, expect } from '@playwright/test';

// Testy API: bez przeglądarki. `request` wysyła żądania HTTP prosto do serwera.
// Lista endpointów: http://localhost:4100/api/docs

test('lista produktów zawiera szampon z kategorii Włosy', async ({ request }) => {
  const odpowiedz = await request.get('/api/products');

  expect(odpowiedz.status()).toBe(200);
  const produkty = await odpowiedz.json();
  expect(produkty).toContainEqual(expect.objectContaining({ name: 'Szampon nawilżający', category: 'Włosy' }));
});

test('złożenie zamówienia bez logowania zwraca 401', async ({ request }) => {
  const odpowiedz = await request.post('/api/orders', {
    data: { product_id: 1, qty: 1 },
  });

  expect(odpowiedz.status()).toBe(401);
  expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
});
