import { test, expect } from '@playwright/test';

// Ćwiczenie 02: pierwszy test „produkt w promocji w koszyku”.
// Karta: docs/cwiczenia/02-pierwszy-test.md
// Gdy test będzie gotowy, zamień `test.fixme` na `test`. Dopóki jest fixme, Playwright go pomija.

test.fixme('produkt w promocji trafia do koszyka z ceną promocyjną', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123 (wzór: tests/przyklady/logowanie.spec.ts).
  // TODO 2: na stronie „Produkty” kliknij „Dodaj do koszyka” w wierszu „Krem do twarzy na dzień”.
  // TODO 3: sprawdź komunikat „Dodano do koszyka: Krem do twarzy na dzień”.
  // TODO 4: przejdź do koszyka (link „Koszyk” w menu).
  // TODO 5: sprawdź, że w koszyku jest wiersz „Krem do twarzy na dzień” z ceną promocyjną 26,39 zł.
});
