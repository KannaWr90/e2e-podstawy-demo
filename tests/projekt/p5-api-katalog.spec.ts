import { test, expect } from '@playwright/test';

// Projekt, scenariusz P5: katalog produktów w API.
// Opis scenariusza: docs/projekt.md

test('API zwraca tylko produkty z wybranej kategorii', async ({ request }) => {
  const odpowiedz = await request.get('/api/products', { params: { category: 'Dziecko' } });

  expect(odpowiedz.status()).toBe(200);
  const produkty = await odpowiedz.json();
  expect(produkty).toHaveLength(3);
  // Każdy produkt na liście ma kategorię „Dziecko”.
  for (const produkt of produkty) {
    expect(produkt.category).toBe('Dziecko');
  }
});

test('API zwraca 404 dla nieistniejącego produktu', async ({ request }) => {
  const odpowiedz = await request.get('/api/products/999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
});
