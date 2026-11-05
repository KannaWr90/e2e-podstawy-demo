import { test, expect } from '@playwright/test';

// Zadanie dodatkowe dnia 1, zadanie 2: ten sam sklep na ekranie telefonu.
// Karta: docs/cwiczenia/extra-d1-przegladarki-i-dane.md
//
// Test ma sens tylko w projekcie „telefon” (dodasz go w playwright.config.ts).
// W zwykłym projekcie chromium ma się pominąć, a nie paść.

test.fixme('na telefonie klient przechodzi z listy produktów do koszyka', async ({ page, isMobile }) => {
  // TODO 1: pomiń test, gdy isMobile jest false: test.skip(!isMobile, 'Tylko w projekcie telefon');
  // TODO 2: sprawdź, że okno ma szerokość telefonu: expect(page.viewportSize()?.width).toBe(412);
  // TODO 3: zaloguj się jako user / user123 i sprawdź napis „Zalogowano jako user”.
  // TODO 4: kliknij „Koszyk” w menu i sprawdź nagłówek „Koszyk”.
});
