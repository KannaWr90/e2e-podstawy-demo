import { expect, type Locator, type Page } from '@playwright/test';

// Page Object koszyka: locatory i kroki w jednym miejscu.
// Test mówi, CO robi klient. Ta klasa wie, JAK to zrobić na stronie.
export class StronaKoszyka {
  readonly naglowek: Locator;
  readonly suma: Locator;

  constructor(private readonly page: Page) {
    this.naglowek = page.getByRole('heading', { name: 'Koszyk' });
    this.suma = page.getByTestId('cart-total');
  }

  // Dodaje produkt z listy produktów i czeka na komunikat.
  async dodajProdukt(nazwa: string) {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` }).click();
    await expect(this.page.getByText(`Dodano do koszyka: ${nazwa}`)).toBeVisible();
  }

  async otworz() {
    await this.page.goto('/koszyk');
    await expect(this.naglowek).toBeVisible();
  }

  // Wiersz produktu w koszyku, znaleziony po nazwie.
  pozycja(nazwa: string): Locator {
    return this.page.getByTestId('cart-item').filter({ hasText: nazwa });
  }

  // Komórka z ilością w wierszu produktu.
  ilosc(nazwa: string): Locator {
    return this.pozycja(nazwa).getByTestId('cart-item-qty');
  }

  async usun(nazwa: string) {
    await this.page.getByRole('button', { name: `Usuń: ${nazwa}` }).click();
    await expect(this.pozycja(nazwa)).toHaveCount(0);
  }
}
