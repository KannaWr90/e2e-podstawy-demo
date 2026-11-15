# Ćwiczenie 09. Testy API i dane przygotowane przez API

Blok 2.5 · 30 min · w parach, zmiana ról co blok; krok 4 razem z całą grupą

## Cel

Umiesz sprawdzić odpowiedź API (status i treść) dla ścieżki negatywnej. Umiesz przygotować dane przez API przed testem w przeglądarce i posprzątać je po teście, tak żeby test przechodził przy każdym uruchomieniu.

## Materiał wejściowy

Wiadomość od Mirka:

> Front przed Czarnym Piątkiem bywa wolny, ale API mam szybkie jak renifer. Zamiast klikać po panelu, testujcie API. U mnie wszystkie błędy zwracają ładny JSON.

- http://localhost:4100/api/docs: lista endpointów z kodami odpowiedzi (pełny opis w `app/openapi.json`).
- `tests/cwiczenia/09-api.spec.ts`: jeden gotowy test (`GET /api/orders`) jako wzór i pięć testów z `test.fixme` i TODO.

> **Słowniczek**
> - JSON: tekstowy format danych, w którym API odsyła odpowiedź, np. `{ "error": "Wymagane logowanie" }`.
> - token Bearer: przepustka z odpowiedzi `POST /api/login`. Wysyłasz ją w nagłówku `Authorization: Bearer <token>`, żeby API wiedziało, kto pyta.
> - `` `Bearer ${token}` ``: tekst w odwrotnych apostrofach. W miejsce `${token}` wstawia się wartość zmiennej `token`.
> - `toEqual`: asercja, że cała treść odpowiedzi jest równa oczekiwanej, pole po polu.
> - `let numer: string;`: zmienna, której wartość ustawi się później, tu w `beforeEach`, i którą odczyta `afterEach`.

Kody błędów w tym API:

| Kod | Kiedy | Treść odpowiedzi |
|---|---|---|
| 400 | błędne dane | `{ "error": "Błędne dane", "errors": [{ "field": "...", "message": "..." }] }` |
| 401 | brak logowania | `{ "error": "Wymagane logowanie" }` |
| 404 | nie ma zasobu | `{ "error": "Nie ma takiego zamówienia" }` |
| 409 | konflikt, np. zamówienie już anulowane | `{ "error": "Zamówienie jest już anulowane" }` |

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujesz w oknie testów.

1. **Znajdź endpointy w dokumentacji.** W oknie aplikacji uruchom `npm start`. W przeglądarce otwórz http://localhost:4100/api/docs. Znajdź `POST /api/orders` i `POST /api/admin/orders/{number}/cancel`. Oczekiwany wynik: dla `POST /api/orders` kolumna „Kody odpowiedzi” pokazuje `201, 400, 401, 404, 409, 503`.

2. **Uruchom szkielet.** W oknie testów wpisz:
   ```powershell
   npx playwright test tests/cwiczenia/09-api.spec.ts
   ```
   Oczekiwany wynik: `1 passed` i `5 skipped`. Przeczytaj gotowy test: logowanie przez `POST /api/login`, token w nagłówku `Authorization`.

3. **Napisz dwa testy ścieżek negatywnych: 401 i 400.** Według TODO w grupie testów (`describe`) „API zamówień”: `GET /api/orders bez logowania` i `POST /api/orders z ilością 0`. Sprawdź status i całą treść odpowiedzi (`toEqual`). Zamień `test.fixme` na `test` i uruchom plik poleceniem z kroku 2. Oczekiwany wynik: `3 passed` i `3 skipped`.

> **Jeśli utknąłeś po 10 minutach**
> Wyślij żądanie i wypisz odpowiedź, zanim napiszesz asercję: `console.log(odpowiedz.status(), await odpowiedz.json());`. Wynik zobaczysz w terminalu. Asercję przepisz z tego, co API naprawdę zwraca, i porównaj z tabelą kodów powyżej.

4. **Przygotuj dane przez API dla testu w przeglądarce (razem).** Ten krok robimy wspólnie, trener pisze na rzutniku, ty u siebie. W grupie testów (`describe`) „Anulowanie zamówienia przygotowanego przez API” uzupełnij `beforeEach` (nowe zamówienie przez API), `afterEach` (anulowanie przez API jako admin) i sam test (anulowanie w panelu admina). Uruchom plik poleceniem z kroku 2. Oczekiwany wynik: `4 passed` i `2 skipped`.

5. **Sprawdź, że testy sprzątają po sobie.** W oknie testów uruchom plik trzy razy w jednym poleceniu:
   ```powershell
   npx playwright test tests/cwiczenia/09-api.spec.ts --repeat-each=3
   ```
   Oczekiwany wynik: `12 passed` i `6 skipped`.

   Potem otwórz w przeglądarce http://localhost:4100/api/products/20. Oczekiwany wynik: `"stock":180`. Tyle było przed testami, bo każde zamówienie testowe zostało anulowane i towar wrócił na stan.

6. **Zapisz pracę w git.** W oknie testów wpisz:
   ```powershell
   git add .
   git commit -m "Ćwiczenie 09: testy API i dane przez API"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 09: testy API i dane przez API` (skrót będzie inny), a `git status` pokazuje potem `nothing to commit, working tree clean`. Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

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

- [ ] `npx playwright test tests/cwiczenia/09-api.spec.ts --repeat-each=3` daje `12 passed` i `6 skipped`.
- [ ] Po przebiegu `stock` produktu 20 wynosi 180 (http://localhost:4100/api/products/20).
- [ ] Każdy test negatywny sprawdza status i treść odpowiedzi. Pokazujesz palcem obie asercje.
- [ ] Umiesz powiedzieć, dlaczego anulowanie jest w `afterEach`, a nie na końcu testu.

## Dla szybszych

> **Skończyłeś wcześniej**
> 1. Zrób dwa pozostałe testy z grupy „API zamówień”: utworzenie zamówienia (201, z anulowaniem na końcu) i 404 dla `ZAM-9999`.
> 2. Złóż zamówienie firmowe przez API: `POST /api/business-orders` z `{ "product_id": 21, "qty": 10, "nip": "2412241228", "company": "Biuro Mikołaja" }` jako `biuro` / `biuro123`.
> 3. Pobierz fakturę: `GET /api/orders/<numer>/invoice`. Sprawdź w niej NIP nabywcy, ilość i `total_cents`.
> 4. Anuluj zamówienie jako admin i sprawdź, że faktura zwraca teraz 404 z `{ "error": "To zamówienie nie ma faktury" }`.
>
> Własne fixtures zamiast `beforeEach` ćwiczysz na gałęzi `extra/d3-page-object-fixtures`.

## Artefakt do zabrania

`tests/cwiczenia/09-api.spec.ts` i wzorzec: dane przez API w `beforeEach`, sprzątanie w `afterEach`, test w przeglądarce w środku.

## Rozwiązanie wzorcowe

Gałąź `solution/09`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/09 -- tests/cwiczenia/09-api.spec.ts
```
