import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md
// Kod nagraj Codegenem, wklej tutaj i popraw. Potem zamień `test.fixme` na `test`.

test.fixme('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  // TODO 2: otwórz „Adres dostawy” z menu.
  // TODO 3: w polu „Kod pocztowy” wpisz 00000 (bez myślnika) i kliknij „Zapisz adres”.
  // TODO 4: sprawdź komunikat „Popraw błędy w formularzu (1).”
  // TODO 5: sprawdź komunikat przy polu: „Kod pocztowy musi mieć format 00-000”.
  // TODO 6: sprawdź, że NIE pojawił się komunikat „Zapisano adres dostawy.”
});
