import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadanie 3: fixture z zamówieniem firmowym przez API.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md
// Test nie składa zamówienia sam: dostaje gotowy numer i nie sprząta, bo robi to fixture.

test('faktura zamówienia firmowego ma nabywcę, NIP i kwotę', async ({ zamowienieFirmowe, request }) => {
  const logowanie = await request.post('/api/login', { data: { login: 'biuro', password: 'biuro123' } });
  const token = (await logowanie.json()).token;

  const odpowiedz = await request.get(`/api/orders/${zamowienieFirmowe}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(odpowiedz.status()).toBe(200);
  const faktura = await odpowiedz.json();
  expect(faktura.invoice_number).toBe(`FV/2026/${zamowienieFirmowe}`);
  expect(faktura.buyer).toEqual({ name: 'Biuro Mikołaja', nip: '1012023036' });
  expect(faktura.items[0].qty).toBe(5);
  expect(faktura.total_cents).toBe(19995);
});

test('zamówienie firmowe widać w panelu admina jako nowe', async ({ panelZamowien, zamowienieFirmowe }) => {
  await panelZamowien.szukaj(zamowienieFirmowe);

  const wiersz = panelZamowien.wiersz(zamowienieFirmowe);
  await expect(wiersz).toContainText('biuro');
  await expect(wiersz).toContainText('Nowe');
});
