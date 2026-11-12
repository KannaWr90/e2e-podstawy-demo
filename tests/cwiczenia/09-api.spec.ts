import { test, expect } from '@playwright/test';

// Testy API zamówień. Opis endpointów: http://localhost:4100/api/docs
// Logowanie przez API zwraca token. Token wysyłamy w nagłówku Authorization.

test.describe('API zamówień', () => {
  test('GET /api/orders zwraca zamówienia zalogowanego klienta', async ({ request }) => {
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

  test('POST /api/orders tworzy zamówienie ze statusem „new”', async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 2 },
    });

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    expect(zamowienie).toMatchObject({ product: 'Płyn do mycia naczyń', qty: 2, status: 'new', customer: 'user' });
    expect(zamowienie.number).toMatch(/^ZAM-\d+$/);

    // Sprzątanie: admin anuluje zamówienie, towar wraca na stan
    const admin = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token: tokenAdmina } = await admin.json();
    const anulowanie = await request.post(`/api/admin/orders/${zamowienie.number}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    expect(anulowanie.status()).toBe(200);
  });

  test('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 0 },
    });

    expect(odpowiedz.status()).toBe(400);
    expect(await odpowiedz.json()).toEqual({
      error: 'Błędne dane',
      errors: [{ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' }],
    });
  });

  test('GET /api/orders bez logowania zwraca 401', async ({ request }) => {
    const odpowiedz = await request.get('/api/orders');

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });

  test('GET /api/orders/ZAM-9999 zwraca 404', async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders/ZAM-9999', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });
});

test.describe('Anulowanie zamówienia przygotowanego przez API', () => {
  // Numer zamówienia utworzonego przed testem. Każdy test dostaje własne zamówienie.
  let numer: string;

  test.beforeEach(async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const { token } = await logowanie.json();
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 1 },
    });
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie także wtedy, gdy test padł przed anulowaniem.
    // 200: anulowaliśmy teraz, 409: zamówienie było już anulowane w teście.
    const admin = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token } = await admin.json();
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 409]).toContain(odpowiedz.status());
  });

  test('admin anuluje nowe zamówienie w panelu', async ({ page }) => {
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

    await page.goto('/admin/zamowienia');
    const wiersz = page.getByRole('row').filter({ hasText: numer });
    await expect(wiersz).toContainText('Nowe');

    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(page.getByTestId('flash')).toHaveText(`Anulowano zamówienie ${numer}`);
    await expect(wiersz).toContainText('Anulowane');
  });
});

// Dla szybszych: zamówienie firmowe i faktura przez API.
test.describe('Zamówienie firmowe przez API', () => {
  test('POST /api/business-orders tworzy zamówienie, a faktura ma NIP nabywcy', async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'biuro', password: 'biuro123' } });
    const { token } = await logowanie.json();
    const naglowki = { Authorization: `Bearer ${token}` };

    const odpowiedz = await request.post('/api/business-orders', {
      headers: naglowki,
      data: { product_id: 21, qty: 10, nip: '2412241228', company: 'Biuro Mikołaja' },
    });
    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    expect(zamowienie).toMatchObject({
      product: 'Kalendarz adwentowy 2026',
      qty: 10,
      status: 'new',
      invoice: { nip: '2412241228', company: 'Biuro Mikołaja' },
    });

    const faktura = await request.get(`/api/orders/${zamowienie.number}/invoice`, { headers: naglowki });
    expect(faktura.status()).toBe(200);
    expect(await faktura.json()).toMatchObject({
      order_number: zamowienie.number,
      buyer: { name: 'Biuro Mikołaja', nip: '2412241228' },
      items: [{ name: 'Kalendarz adwentowy 2026', qty: 10, unit_price_cents: 3999, total_cents: 39990 }],
      total_cents: 39990,
    });

    // Sprzątanie: admin anuluje zamówienie. Anulowane zamówienie nie ma już faktury.
    const admin = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token: tokenAdmina } = await admin.json();
    const anulowanie = await request.post(`/api/admin/orders/${zamowienie.number}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    expect(anulowanie.status()).toBe(200);

    const bezFaktury = await request.get(`/api/orders/${zamowienie.number}/invoice`, { headers: naglowki });
    expect(bezFaktury.status()).toBe(404);
    expect(await bezFaktury.json()).toEqual({ error: 'To zamówienie nie ma faktury' });
  });
});
