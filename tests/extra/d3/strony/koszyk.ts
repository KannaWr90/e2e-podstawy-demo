import { expect, type Locator, type Page } from '@playwright/test';

// Page Object koszyka: locatory i kroki w jednym miejscu.
// Test mówi, CO robi klient. Ta klasa wie, JAK to zrobić na stronie.
export class StronaKoszyka {
  readonly naglowek: Locator;

  constructor(private readonly page: Page) {
    this.naglowek = page.getByRole('heading', { name: 'Koszyk' });
  }

  // Gotowa metoda, wzór dla pozostałych: dodaje produkt z listy produktów i czeka na komunikat.
  async dodajProdukt(nazwa: string) {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` }).click();
    await expect(this.page.getByText(`Dodano do koszyka: ${nazwa}`)).toBeVisible();
  }

  // TODO 1: async otworz() – przejdź na /koszyk i poczekaj na nagłówek.

  // TODO 2: pozycja(nazwa: string): Locator – wiersz produktu w koszyku.
  //   Wiersze koszyka mają data-testid="cart-item". Zawęź je filtrem po nazwie produktu.

  // TODO 3: ilosc(nazwa: string): Locator – komórka z ilością w tym wierszu (data-testid="cart-item-qty").

  // TODO 4: async usun(nazwa: string) – kliknij „Usuń: <nazwa>” i poczekaj, aż wiersz zniknie.
}
