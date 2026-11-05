import { test, expect } from '@playwright/test';

// Projekt, scenariusz P7: klient nie widzi cudzych zamówień.
// Opis scenariusza: docs/projekt.md
// ZAM-1005 należy do konta admin. Konto user ma ZAM-1001.

test('klient dostaje 404 przy zamówieniu innej osoby', async ({ request }) => {
  // Logowanie przez API ustawia ciasteczko sesji. `request` wysyła je w kolejnych żądaniach.
  const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
  expect(logowanie.status()).toBe(200);

  // Najpierw własne zamówienie: dowód, że logowanie działa i 404 niżej nie wynika z braku sesji.
  const wlasne = await request.get('/api/orders/ZAM-1001');
  expect(wlasne.status()).toBe(200);
  expect(await wlasne.json()).toMatchObject({ number: 'ZAM-1001', customer: 'user' });

  const cudze = await request.get('/api/orders/ZAM-1005');
  expect(cudze.status()).toBe(404);
  expect(await cudze.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});

test('administrator widzi zamówienie każdego klienta', async ({ request }) => {
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  expect(logowanie.status()).toBe(200);

  const odpowiedz = await request.get('/api/orders/ZAM-1001');
  expect(odpowiedz.status()).toBe(200);
  expect(await odpowiedz.json()).toMatchObject({ number: 'ZAM-1001', customer: 'user' });
});

test('bez logowania API zwraca 401', async ({ request }) => {
  const odpowiedz = await request.get('/api/orders/ZAM-1001');

  expect(odpowiedz.status()).toBe(401);
  expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
});
