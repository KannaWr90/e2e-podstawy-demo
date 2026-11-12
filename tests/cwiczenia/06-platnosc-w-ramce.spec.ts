import { test, expect } from '@playwright/test';

// Ćwiczenie 06, część B: płatność w ramce (iframe).
// Karta: docs/cwiczenia/06-dynamiczne-id.md

// Płatność zamawia cały koszyk klienta. Konto tester07 ma koszyk tylko dla tych testów,
// więc inne testy nie dokładają do niego produktów. Oba testy dzielą ten koszyk, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester07');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester07')).toBeVisible();

  // Płacić można tylko za niepusty koszyk.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Maseczka glinkowa' }).click();
  await expect(page.getByText('Dodano do koszyka: Maseczka glinkowa')).toBeVisible();
});

test('karta odrzucona przez bank pokazuje komunikat w ramce', async ({ page }) => {
  await page.goto('/koszyk/platnosc');

  // Ramkę znajdujemy po atrybucie title, a contentFrame() daje dostęp do jej wnętrza.
  const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
  await bramka.getByLabel('Numer karty').fill('4000 0000 0000 0002');
  await bramka.getByRole('button', { name: 'Zapłać' }).click();

  await expect(bramka.getByRole('alert')).toHaveText('Płatność odrzucona przez bank. Użyj innej karty.');

  // Sprzątanie: maseczka wraca z koszyka, płatność jej nie zamówiła.
  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Usuń: Maseczka glinkowa' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Maseczka glinkowa' })).toHaveCount(0);
});

test('przyjęta płatność daje numer zamówienia', async ({ page, request }) => {
  await page.goto('/koszyk/platnosc');

  const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
  await bramka.getByLabel('Numer karty').fill('4111 1111 1111 1111');
  await bramka.getByRole('button', { name: 'Zapłać' }).click();

  await expect(bramka.getByRole('heading', { name: 'Płatność przyjęta' })).toBeVisible();
  // Jedno zamówienie na każdą pozycję koszyka, numery po przecinku: „ZAM-1008, ZAM-1009”.
  const numery = bramka.getByTestId('payment-order');
  await expect(numery).toHaveText(/^ZAM-\d+(, ZAM-\d+)*$/);

  // Sprzątanie: admin anuluje nowe zamówienia przez API, towar wraca na stan.
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  for (const numer of (await numery.innerText()).split(', ')) {
    const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(anulowanie.status()).toBe(200);
  }
});

// Dla szybszych: błędny numer karty zatrzymuje płatność w ramce, koszyk zostaje bez zmian.
test('numer karty z 15 cyframi daje komunikat przy polu, koszyk bez zmian', async ({ page }) => {
  await page.goto('/koszyk/platnosc');

  const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
  await bramka.getByLabel('Numer karty').fill('4111 1111 1111 111');
  await bramka.getByRole('button', { name: 'Zapłać' }).click();

  await expect(bramka.getByText('Numer karty musi mieć 16 cyfr')).toBeVisible();
  await expect(bramka.getByRole('heading', { name: 'Płatność przyjęta' })).toHaveCount(0);

  // Koszyk bez zmian: maseczka nadal w nim jest. Sprzątanie: usuwamy ją.
  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Maseczka glinkowa' });
  await expect(wiersz.getByTestId('cart-item-qty')).toHaveText('1');
  await page.getByRole('button', { name: 'Usuń: Maseczka glinkowa' }).click();
  await expect(wiersz).toHaveCount(0);
});
