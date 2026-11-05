import { expect, type Locator, type Page } from '@playwright/test';

// Page Object tabeli zamówień w panelu admina (/admin/zamowienia).
export class PanelZamowien {
  constructor(private readonly page: Page) {}

  async otworz() {
    await this.page.goto('/admin/zamowienia');
    await expect(this.page.getByRole('heading', { name: 'Zamówienia' })).toBeVisible();
  }

  async szukaj(tekst: string) {
    await this.page.getByRole('searchbox', { name: 'Szukaj zamówienia' }).fill(tekst);
    await this.page.getByRole('button', { name: 'Szukaj' }).click();
  }

  // Wiersz znajdujemy po numerze: id wierszy zmienia się przy każdym odświeżeniu.
  wiersz(numer: string): Locator {
    return this.page.getByRole('row').filter({ hasText: numer });
  }

  async anuluj(numer: string) {
    await this.wiersz(numer).getByRole('button', { name: 'Anuluj' }).click();
    await expect(this.page.getByText(`Anulowano zamówienie ${numer}`)).toBeVisible();
  }
}
