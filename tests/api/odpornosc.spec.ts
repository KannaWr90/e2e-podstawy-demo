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
