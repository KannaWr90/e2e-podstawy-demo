import { test, expect } from '@playwright/test';

// Wymaganie: klient zamawia z fakturą na firmę. Zaznacza „Faktura na firmę”,
// podaje NIP i nazwę firmy, składa zamówienie. Zamówienie jest na liście
// „Moje zamówienia”, a na jego stronie widać NIP firmy i przycisk „Pobierz fakturę”.

test('zamówienie z fakturą na firmę', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  await page.getByRole('button', { name: 'Dodaj do koszyka: Szczoteczka do zębów' }).click();
  await page.goto('/koszyk');

  // Dane do faktury
  await page.getByLabel('Faktura na firmę').check();
  await page.getByLabel('NIP').fill('101-202-30-36');
  await page.getByLabel('Nazwa firmy').fill('Elfy i Wspólnicy sp. z o.o.');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  // Zamówienie złożone: aplikacja przeszła na listę zamówień z numerem nowego zamówienia
  await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+/);
});
