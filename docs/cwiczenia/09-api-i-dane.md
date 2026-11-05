# Ćwiczenie 09. Testy API i dane przygotowane przez API

Blok 2.5 · 40 min · w parach, zmiana ról co blok

## Cel

Umiesz sprawdzić odpowiedź API (status i treść) dla ścieżki poprawnej i negatywnej. Umiesz przygotować dane przez API przed testem w przeglądarce i posprzątać je po teście, tak żeby test przechodził przy każdym uruchomieniu.

## Materiał wejściowy

- http://localhost:4100/api/docs: lista endpointów z kodami odpowiedzi (pełny opis w `app/openapi.json`).
- `tests/cwiczenia/09-api.spec.ts`: jeden gotowy test (`GET /api/orders`) jako wzór i pięć testów z `test.fixme` i TODO.

Kody błędów w tym API:

| Kod | Kiedy | Treść odpowiedzi |
|---|---|---|
| 400 | błędne dane | `{ "error": "Błędne dane", "errors": [{ "field": "...", "message": "..." }] }` |
| 401 | brak logowania | `{ "error": "Wymagane logowanie" }` |
| 404 | nie ma zasobu | `{ "error": "Nie ma takiego zamówienia" }` |
| 409 | konflikt, np. zamówienie już anulowane | `{ "error": "Zamówienie jest już anulowane" }` |

## Kroki

PowerShell, z katalogu głównego repo.

1. **Znajdź endpointy w dokumentacji.** W drugim oknie `npm start`, otwórz http://localhost:4100/api/docs. Znajdź `POST /api/orders` i `POST /api/admin/orders/{number}/cancel`. Oczekiwany wynik: dla `POST /api/orders` kolumna „Kody odpowiedzi” pokazuje `201, 400, 401, 404, 409, 503`.

2. **Uruchom szkielet.**
   ```powershell
   npx playwright test tests/cwiczenia/09-api.spec.ts
   ```
   Oczekiwany wynik: `1 passed` i `5 skipped`. Przeczytaj gotowy test: logowanie przez `POST /api/login`, token w nagłówku `Authorization`.

3. **Napisz cztery testy API.** Według TODO w describe „API zamówień”: utworzenie zamówienia (z anulowaniem na końcu), 400, 401, 404. W ścieżkach negatywnych sprawdź status i całą treść odpowiedzi (`toEqual`). Zamień `test.fixme` na `test` i uruchom plik. Oczekiwany wynik: `5 passed` i `1 skipped`.

> **Jeśli utknąłeś po 10 minutach**
> Wyślij żądanie i wypisz odpowiedź, zanim napiszesz asercję: `console.log(odpowiedz.status(), await odpowiedz.json());`. Wynik zobaczysz w terminalu. Asercję przepisz z tego, co API naprawdę zwraca, i porównaj z tabelą kodów powyżej.

4. **Przygotuj dane przez API dla testu w przeglądarce.** W describe „Anulowanie zamówienia przygotowanego przez API” uzupełnij `beforeEach` (nowe zamówienie przez API), `afterEach` (anulowanie przez API jako admin) i sam test (anulowanie w panelu admina). Uruchom plik. Oczekiwany wynik: `6 passed`.

5. **Sprawdź, że testy sprzątają po sobie.** Uruchom plik trzy razy w jednym poleceniu:
   ```powershell
   npx playwright test tests/cwiczenia/09-api.spec.ts --repeat-each=3
   ```
   Oczekiwany wynik: `18 passed`. Otwórz http://localhost:4100/api/products/20. Oczekiwany wynik: `"stock":45`, tyle co przed testami, bo każde zamówienie testowe zostało anulowane i towar wrócił na stan.

## Przykład wyniku

Test ścieżki negatywnej w formie, która sprawdza status i treść (dla innego endpointu niż w ćwiczeniu):
```ts
test('GET /api/products/999 zwraca 404', async ({ request }) => {
  const odpowiedz = await request.get('/api/products/999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
});
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/09-api.spec.ts --repeat-each=3` daje `18 passed`.
- [ ] Po przebiegu `stock` produktu 20 wynosi 45 (http://localhost:4100/api/products/20).
- [ ] Każdy test negatywny sprawdza status i treść odpowiedzi. Pokazujesz palcem obie asercje.
- [ ] Umiesz powiedzieć, dlaczego anulowanie jest w `afterEach`, a nie na końcu testu.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dopisz dwa testy: zwykły użytkownik wywołuje `GET /api/admin/orders` (oczekiwany kod 403) i admin anuluje to samo zamówienie dwa razy (drugi raz 409). Potem sprawdź, co się dzieje z danymi, gdy test w przeglądarce padnie: zmień na chwilę oczekiwany komunikat w teście E2E, uruchom plik, sprawdź `stock` produktu 20. Własne fixtures zamiast `beforeEach`: gałąź `extra/d3-page-object-fixtures`. Inne dłuższe zadania: `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

`tests/cwiczenia/09-api.spec.ts` i wzorzec: dane przez API w `beforeEach`, sprzątanie w `afterEach`, test w przeglądarce w środku.

## Rozwiązanie wzorcowe

Gałąź `solution/09`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/09 -- tests/cwiczenia/09-api.spec.ts
```
