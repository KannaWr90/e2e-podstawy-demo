# Zadanie dodatkowe D3. Page Object, fixtures i komplet ścieżek negatywnych API

Zadanie dodatkowe · dzień 3 · ok. 85 min · w parach

## Cel

Przeniesiesz locatory i kroki koszyka oraz panelu admina do klas Page Object, a logowanie i dane testowe do własnych fixtures. Test będzie wtedy prosił o `koszyk`, `noweZamowienie` albo `zamowienieFirmowe` tak samo, jak dziś prosi o `page`. Zbierzesz w jednej tabeli wszystkie odpowiedzi 400, 401, 403 i 404 API zamówień i opiszesz w skillu, jak Claude ma pisać Page Object w tym repo.

## Materiał wejściowy

Wiadomość od Bożeny, 11:20:
> Biuro Mikołaja dzwoniło trzeci raz w sprawie faktury. Mirek mówi, że każdy test faktury zaczyna się od dwudziestu linii przygotowania zamówienia, a Klaudiusz kopiuje je do każdego nowego pliku. Po Czarnym Piątku ma tego nie być. Najlepiej przed.

Gałąź `extra/d3-page-object-fixtures`. Nowe pliki są w `tests/extra/d3/`:

| Plik | Co w nim jest |
|---|---|
| `strony/koszyk.ts` | klasa `StronaKoszyka`: gotowa metoda `dodajProdukt` i TODO dla pozostałych |
| `fixtures.ts` | `test.extend` (dopisuje do `test` własne fixtures) z gotową fixture `stronaKlienta` (zalogowany `user`) i TODO dla czterech kolejnych |
| `koszyk.spec.ts`, `panel-zamowien.spec.ts`, `faktura.spec.ts` | po dwa testy z `test.fixme` (test do dokończenia: Playwright go pomija i liczy jako `skipped`) i TODO |
| `api-negatywne.spec.ts` | `interface` (opis pól, które ma każdy przypadek), jeden przypadek 401 i pętla, która z każdego przypadku robi test |

Zasada z `CLAUDE.md` („bez Page Object i własnych fixtures”) dotyczy reszty repo. W `tests/extra/d3` budujesz je celowo.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujesz w oknie testów.

1. **Zapisz swoją pracę w git.** Zadanie jest na osobnej gałęzi, więc najpierw commit tego, co masz na `main`:
   ```powershell
   git add .
   git commit -m "Praca przed zadaniem D3"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Praca przed zadaniem D3` (skrót będzie inny) albo `nothing to commit, working tree clean`, jeśli nie było zmian.

2. **Przełącz się na gałąź zadania.**
   ```powershell
   git fetch origin
   git switch extra/d3-page-object-fixtures
   npx playwright test tests/extra/d3
   ```
   Oczekiwany wynik: `1 passed` i `6 skipped`.

3. **Dokończ Page Object koszyka.**

   a) Dopisz w `strony/koszyk.ts` metody z TODO 1–4.

   b) Dopisz w `fixtures.ts` fixture `koszyk` (TODO 1).

   c) W `koszyk.spec.ts` zmień parametr testów na `({ koszyk })` i napisz testy samymi metodami klasy, bez `page`.

   d) Uruchom testy koszyka:
   ```powershell
   npx playwright test tests/extra/d3/koszyk.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Metoda zwracająca locator nie ma `async` ani `await`: `pozycja(nazwa: string): Locator { return this.page.getByTestId('cart-item').filter({ hasText: nazwa }); }`. `async` i `await` mają tylko metody, które coś robią na stronie (`otworz`, `usun`). Typ `MojeFixtures` na początku `fixtures.ts` to lista fixtures z ich typami. Błąd `Property 'koszyk' does not exist` oznacza, że `koszyk` nie jest jeszcze w tym typie.

4. **Zbuduj Page Object panelu admina i fixture z danymi z API.** Utwórz `strony/panel-zamowien.ts` z klasą `PanelZamowien` i metodami `otworz()`, `szukaj(tekst)`, `wiersz(numer)`, `anuluj(numer)`. Dopisz fixtures `panelZamowien` i `noweZamowienie` (TODO 2 i 3). `noweZamowienie` robi to, co w ćwiczeniu 09 robiły `beforeEach` i `afterEach`: kod przed `await use(numer)` biegnie przed testem, kod po nim po teście.
   ```powershell
   npx playwright test tests/extra/d3/panel-zamowien.spec.ts
   ```
   Oczekiwany wynik: `2 passed`. Uruchom aplikację w oknie aplikacji (`npm start`) i otwórz http://localhost:4100/admin/zamowienia. Oba zamówienia utworzone przez testy mają status „Anulowane”.

5. **Przygotuj zamówienie firmowe w fixture.** Dopisz w `fixtures.ts` fixture `zamowienieFirmowe` (TODO 4): przed testem loguje `biuro` przez API i składa `POST /api/business-orders`, przekazuje numer, po teście anuluje zamówienie jako admin. W `faktura.spec.ts` zamień `test.fixme` na `test` i dokończ oba testy według TODO. Test nie składa zamówienia i nie sprząta: robi to fixture.
   ```powershell
   npx playwright test tests/extra/d3/faktura.spec.ts
   ```
   Oczekiwany wynik: `2 passed`. W http://localhost:4100/admin/zamowienia oba zamówienia firmowe z testów mają status „Anulowane”.

6. **Zbierz ścieżki negatywne API w jednej tabeli.** W `api-negatywne.spec.ts` dopisz co najmniej 10 przypadków według TODO. Kody i treści sprawdź w http://localhost:4100/api/docs i w `app/openapi.json`, a treść odpowiedzi przepisz z tego, co API naprawdę zwraca.
   ```powershell
   npx playwright test tests/extra/d3/api-negatywne.spec.ts
   ```
   Oczekiwany wynik: co najmniej `11 passed`. Każdy test ma w nazwie kod i opis, np. `403: klient anuluje zamówienie`.

> **Pracujesz z testami API, nie z przeglądarką**
> Zrób kroki 1 i 2, pomiń kroki 3 i 4. W kroku 5 zrób tylko pierwszy test (drugi potrzebuje `panelZamowien` z kroku 4). Rozbuduj krok 6: dodaj przypadki dla `POST /api/account/address` (400 dla każdego z czterech pól, 401 bez logowania) i `PUT /api/settings/maintenance` (400 dla `enabled: "tak"`, 401, 403). Metodę `PUT` dopisz do typu pola `metoda`.

7. **Opisz w skillu, jak pisać Page Object w tym repo.** Utwórz `.claude/skills/page-object/SKILL.md` (format jak w ćwiczeniu 10: nagłówek YAML z `name` i `description`, pod nim kroki). Skill ma powiedzieć Claude: gdzie leżą klasy i fixtures, jak nazywać klasy i metody, które asercje są w klasie, a które w teście, czego nie robić. Kroki jako polecenia, nie opisy. Ostatni krok skilla ma brzmieć: „uruchom testy dwa razy i pokaż wynik”. Samego Claude nie musisz teraz uruchamiać. Skill wypróbujesz w swoim repo.

8. **Sprawdź, że locator zmieniasz w jednym miejscu.**

   a) W `strony/koszyk.ts` zmień testid `cart-item` na `cart-row` i uruchom testy koszyka:
   ```powershell
   npx playwright test tests/extra/d3/koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 failed` i `1 did not run`. Testy biegną po kolei, więc po błędzie drugi się nie uruchamia.

   b) Przywróć testid `cart-item` w `strony/koszyk.ts` i uruchom to samo polecenie. Oczekiwany wynik: `2 passed`.

   c) Szczoteczka z nieudanego testu zostaje w koszyku. Usuń ją ręcznie w przeglądarce albo zatrzymaj aplikację w oknie aplikacji (`Ctrl+C`) i w oknie testów wpisz `npm run db:reset`.

9. **Zapisz zadanie i wróć do projektu.**
   ```powershell
   git add .
   git commit -m "Zadanie D3: Page Object, fixtures, ścieżki negatywne API"
   git switch main
   ```
   Oczekiwany wynik ostatniej linii: `Switched to branch 'main'`.

## Przykład wyniku

Test przed i po, na innym ekranie (adres dostawy, którego w zadaniu nie ma):
```ts
// Przed: test zna każdy locator.
test('zapisany adres zostaje w formularzu', async ({ page }) => {
  await page.goto('/konto/adres');
  await page.getByLabel('Miasto').fill('Kraków');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();
  await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
});

// Po: test mówi, co robi klient. Locatory są w klasie StronaAdresu.
test('zapisany adres zostaje w formularzu', async ({ adres }) => {
  await adres.zapiszMiasto('Kraków');
  await expect(adres.miasto).toHaveValue('Kraków');
});
```

Fragment wyniku kroku 6 (kolejność u ciebie będzie inna):
```
  ✓   6 [chromium] › tests/extra/d3/api-negatywne.spec.ts:82:7 › 403: klient pobiera listę wszystkich zamówień (22ms)
  ✓   7 [chromium] › tests/extra/d3/api-negatywne.spec.ts:82:7 › 404: zamówienie, którego nie ma (22ms)
  ✓   4 [chromium] › tests/extra/d3/api-negatywne.spec.ts:82:7 › 403: klient anuluje zamówienie (25ms)
  ✓   8 [chromium] › tests/extra/d3/api-negatywne.spec.ts:82:7 › 401: anulowanie bez logowania (20ms)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/extra/d3 --repeat-each=3` przechodzi bez błędów (dla 11 przypadków API: `51 passed`).
- [ ] W `koszyk.spec.ts`, `panel-zamowien.spec.ts` i `faktura.spec.ts` nie ma ani jednego `page.` ani `getBy`. Pokazujesz to drugiej osobie przez `Select-String -Path tests\extra\d3\*.spec.ts -Pattern "page\.|getBy"` (wynik: pusty).
- [ ] Po zmianie testid w jednym miejscu (`strony/koszyk.ts`) `koszyk.spec.ts` pada, a po przywróceniu przechodzi (krok 8).
- [ ] `.claude/skills/page-object/SKILL.md` ma nagłówek z `name` i `description` i co najmniej pięć kroków. Druga osoba czyta go i bez pytania mówi, gdzie Claude zapisze nową klasę.

## Dla szybszych

> **Skończyłeś wcześniej**
> Przenieś sprzątanie koszyka do fixture: `koszyk` po `use` usuwa produkty, które test dodał (klasa zapamiętuje nazwy w tablicy w `dodajProdukt`). Testy koszyka nie mają wtedy linii sprzątania. Dopisz w `faktura.spec.ts` test: po anulowaniu zamówienia firmowego `GET /api/orders/<numer>/invoice` zwraca 404 i `{ "error": "To zamówienie nie ma faktury" }`. Potem dopisz w `api-negatywne.spec.ts` przypadek 409 (admin anuluje zamówienie już anulowane, np. `ZAM-1002`) i zastanów się, czy pasuje do tej samej tabeli, czy potrzebuje osobnego testu.

## Artefakt do zabrania

`tests/extra/d3/strony/`, `tests/extra/d3/fixtures.ts` (z fixture tworzącą i sprzątającą dane przez API) jako wzór układu Page Object i fixtures, tabela przypadków negatywnych API i `.claude/skills/page-object/SKILL.md`.

## Rozwiązanie wzorcowe

Gałąź `solution/extra-d3`:
```powershell
git fetch origin
git diff origin/extra/d3-page-object-fixtures origin/solution/extra-d3 -- tests/extra/d3 .claude/skills
```
