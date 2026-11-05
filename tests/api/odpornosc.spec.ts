import { test, expect } from '@playwright/test';

// Zepsute ciasteczko nie może wyłączyć aplikacji: serwer ma odpowiedzieć i działać dalej.

test('żądanie z zepsutym ciasteczkiem nie wyłącza aplikacji', async ({ request }) => {
  const zZepsutymCiasteczkiem = await request.get('/api/me', {
    headers: { Cookie: 'sid=%E0%A4%A' },
  });
  // Zepsute ciasteczko jest pomijane, więc użytkownik jest niezalogowany.
  expect(zZepsutymCiasteczkiem.status()).toBe(401);

  // Następne żądanie nadal działa.
  const zdrowie = await request.get('/health');
  expect(zdrowie.status()).toBe(200);
});

// Parametr `next` po logowaniu może prowadzić tylko na stronę tej aplikacji.
for (const next of ['/.//evil.com', '/\\evil.com', '//evil.com', 'https://evil.com']) {
  test(`logowanie z next=${next} przekierowuje na stronę główną`, async ({ request }) => {
    const odpowiedz = await request.post('/logowanie', {
      form: { login: 'user', password: 'user123', next },
      maxRedirects: 0,
    });

    expect(odpowiedz.status()).toBe(303);
    expect(odpowiedz.headers()['location']).toBe('/');
  });
}

test('logowanie z next=/koszyk wraca do koszyka', async ({ request }) => {
  const odpowiedz = await request.post('/logowanie', {
    form: { login: 'user', password: 'user123', next: '/koszyk' },
    maxRedirects: 0,
  });

  expect(odpowiedz.headers()['location']).toBe('/koszyk');
});
