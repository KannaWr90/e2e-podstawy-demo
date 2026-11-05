import { test as base, expect, type Page } from '@playwright/test';
import { StronaKoszyka } from './strony/koszyk';
import { PanelZamowien } from './strony/panel-zamowien';

// Własne fixtures. Test prosi o nie po nazwie, tak jak o `page` albo `request`:
//   test('...', async ({ koszyk }) => { ... });
// Playwright przygotowuje tylko te, o które test poprosi.
type MojeFixtures = {
  stronaKlienta: Page;
  koszyk: StronaKoszyka;
  panelZamowien: PanelZamowien;
  noweZamowienie: string;
};

async function zaloguj(page: Page, login: string, haslo: string) {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();
}

export const test = base.extend<MojeFixtures>({
  // Strona przeglądarki z zalogowanym klientem user.
  stronaKlienta: async ({ page }, use) => {
    await zaloguj(page, 'user', 'user123');
    await use(page);
  },

  // Koszyk zalogowanego klienta.
  koszyk: async ({ stronaKlienta }, use) => {
    await use(new StronaKoszyka(stronaKlienta));
  },

  // Panel zamówień zalogowanego admina, już otwarty.
  panelZamowien: async ({ page }, use) => {
    await zaloguj(page, 'admin', 'admin123');
    const panel = new PanelZamowien(page);
    await panel.otworz();
    await use(panel);
  },

  // Numer nowego zamówienia klienta user. Przed testem: utworzenie przez API.
  // Po teście: anulowanie przez API (409 = test już je anulował).
  noweZamowienie: async ({ request }, use) => {
    const klient = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    const tokenKlienta = (await klient.json()).token;
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${tokenKlienta}` },
      data: { product_id: 17, qty: 1 },
    });
    expect(odpowiedz.status()).toBe(201);
    const numer: string = (await odpowiedz.json()).number;

    await use(numer);

    const admin = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const tokenAdmina = (await admin.json()).token;
    const anulowanie = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    expect([200, 409]).toContain(anulowanie.status());
  },
});

export { expect };
