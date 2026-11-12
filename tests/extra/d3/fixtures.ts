import { test as base, expect, type Page } from '@playwright/test';

// Własne fixtures. Test prosi o nie po nazwie, tak jak o `page` albo `request`:
//   test('...', async ({ stronaKlienta }) => { ... });
// Playwright przygotowuje tylko te, o które test poprosi.
type MojeFixtures = {
  stronaKlienta: Page;
  // TODO 1: koszyk: StronaKoszyka;            (import z './strony/koszyk')
  // TODO 2: panelZamowien: PanelZamowien;     (import z './strony/panel-zamowien')
  // TODO 3: noweZamowienie: string;
  // TODO 4: zamowienieFirmowe: string;
};

async function zaloguj(page: Page, login: string, haslo: string) {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();
}

export const test = base.extend<MojeFixtures>({
  // Gotowa fixture, wzór dla pozostałych: strona przeglądarki z zalogowanym klientem user.
  // Wszystko przed `use` dzieje się przed testem, wszystko po `use` po teście.
  stronaKlienta: async ({ page }, use) => {
    await zaloguj(page, 'user', 'user123');
    await use(page);
  },

  // TODO 1: koszyk – korzysta ze stronaKlienta i przekazuje testowi new StronaKoszyka(stronaKlienta).

  // TODO 2: panelZamowien – loguje admina na `page`, otwiera panel zamówień, przekazuje PanelZamowien.

  // TODO 3: noweZamowienie – przed testem tworzy zamówienie przez API (user, product_id 17, qty 1)
  //   i przekazuje jego numer. Po teście anuluje je przez API jako admin; status 200 albo 409.

  // TODO 4: zamowienieFirmowe – przed testem loguje Biuro Mikołaja przez API (biuro / biuro123)
  //   i składa POST /api/business-orders z treścią
  //   { product_id: 21, qty: 5, nip: '101-202-30-36', company: 'Biuro Mikołaja' }; oczekiwany status 201.
  //   Przekazuje numer zamówienia. Po teście anuluje je przez API jako admin; status 200 albo 409.
});

export { expect };
