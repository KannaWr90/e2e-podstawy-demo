import { test, expect } from './fixtures';

// Zadanie dodatkowe dnia 3, zadanie 3: fixture z zamówieniem firmowym przez API.
// Karta: docs/cwiczenia/extra-d3-page-object-fixtures.md
//
// Najpierw dopisz fixture zamowienieFirmowe w ./fixtures.ts (TODO 4).
// Test nie składa zamówienia sam: dostaje gotowy numer i nie sprząta, bo robi to fixture.

test.fixme('faktura zamówienia firmowego ma nabywcę, NIP i kwotę', async ({ request }) => {
  // TODO 1: zmień parametr na ({ zamowienieFirmowe, request }).
  // TODO 2: zaloguj biuro przez POST /api/login i pobierz GET /api/orders/<numer>/invoice.
  // TODO 3: sprawdź status 200, buyer.name „Biuro Mikołaja”, buyer.nip „1012023036”,
  //         items[0].qty 5 i total_cents 19995.
});

test.fixme('zamówienie firmowe widać w panelu admina jako nowe', async ({ page }) => {
  // TODO: zmień parametr na ({ panelZamowien, zamowienieFirmowe }), wyszukaj zamówienie
  //       i sprawdź w jego wierszu klienta „biuro” i status „Nowe”.
});
