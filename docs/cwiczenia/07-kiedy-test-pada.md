# Ćwiczenie 07. Trzy czerwone testy: najpierw diagnoza, potem poprawka

Blok 2.3 · 25 min · w parach, klawiaturę ma jedna osoba, zmiana ról co blok

## Cel

Umiesz ustalić, dlaczego test padł, z komunikatu błędu i nagrania przebiegu (trace albo UI mode). Przyczynę zapisujesz jednym zdaniem i dopiero z nią prosisz Claude o poprawkę.

## Materiał wejściowy

- `tests/zepsute/01-wyszukiwarka-produktow.spec.ts`, `02-logowanie-admina.spec.ts`, `03-lista-zamowien.spec.ts`: trzy testy, które padają, każdy z innego powodu. Biegną tylko w osobnym projekcie Playwright `zepsute`, więc `npm test` ich nie uruchamia.

Tabela do wypełnienia:

| Test | Pierwsza linia błędu | Co widać w trace w chwili błędu | Przyczyna (jedno zdanie) |
|---|---|---|---|
| 01 | | | |
| 02 | | | |
| 03 | | | |

## Kroki

PowerShell, z katalogu głównego repo.

1. **Uruchom zepsute testy.**
   ```powershell
   npx playwright test --project=zepsute
   ```
   Oczekiwany wynik: `3 failed`. Jeden test czeka na swój błąd około 30 sekund. Przepisz do tabeli pierwszą linię `Error:` każdego testu.

2. **Obejrzyj każdy test w UI mode.**
   ```powershell
   npx playwright test --project=zepsute --ui
   ```
   Uruchom test przyciskiem ▶. Kliknij ostatni krok na osi czasu i porównaj zakładki „Before” i „After” ze zrzutem strony. Zakładka „Locator” (ikona celownika) pokazuje, które elementy pasują do lokatora. Zapisz w tabeli, co strona pokazywała w chwili błędu.

> **Wolisz raport HTML niż UI mode**
> `npx playwright show-report` otwiera raport z kroku 1. Kliknij test, potem obrazek „Trace”. To samo nagranie co w UI mode, bez ponownego uruchamiania.

3. **Zapisz przyczynę jednym zdaniem.** Przyczyna mówi, co jest nie tak w teście albo w aplikacji, np. „Lokator X pasuje do dwóch elementów, bo…”. „Test nie działa” i „timeout” to objaw.

> **Jeśli utknąłeś po 10 minutach**
> Przy każdym teście zadaj dwa pytania. Ile elementów na stronie pasuje do lokatora z linii błędu: zero, jeden czy kilka? Czy strona była już gotowa w chwili, gdy test sprawdzał wynik?

4. **Poproś Claude o poprawkę z przyczyną.** Uruchom `claude`. W prośbie podaj plik, wymaganie z komentarza i twoją przyczynę z tabeli. Dopisz, że wymaganie ma zostać sprawdzone w całości. Przejrzyj zmianę, zanim ją przyjmiesz: czy asercja nadal sprawdza wymaganie?

5. **Sprawdź poprawki.**
   ```powershell
   npx playwright test --project=zepsute
   ```
   Oczekiwany wynik: `3 passed`. Potem sprawdź, czy test z danymi ładowanymi z opóźnieniem jest stabilny:
   ```powershell
   npx playwright test --project=zepsute tests/zepsute/03-lista-zamowien.spec.ts --repeat-each=10
   ```
   Oczekiwany wynik: `10 passed`.

## Przykład wyniku

Wiersz tabeli dla testu spoza tego ćwiczenia:

| Test | Pierwsza linia błędu | Co widać w trace w chwili błędu | Przyczyna (jedno zdanie) |
|---|---|---|---|
| logowanie | `Error: expect(locator).toHaveText(expected) failed` | Komunikat „Nieprawidłowy login lub hasło” jest na stronie | Test oczekuje tekstu „Błędne hasło”, którego aplikacja nigdy nie wyświetla: tekst w teście był zgadnięty |

## Kryterium „gotowe”

- [ ] Tabela ma trzy przyczyny, każda jednym zdaniem i każda inna.
- [ ] Umiesz pokazać drugiej osobie w UI mode albo w trace miejsce, z którego wzięła się przyczyna.
- [ ] `npx playwright test --project=zepsute` daje `3 passed`, a `--repeat-each=10` dla testu 03 daje `10 passed`.
- [ ] Żadna poprawka nie usuwa asercji ani nie dodaje `waitForTimeout`.

## Dla szybszych

> **Skończyłeś wcześniej**
> Wstaw `await page.pause();` przed linią, która padała w teście 01, i uruchom go z oknem przeglądarki (`npx playwright test --project=zepsute tests/zepsute/01-wyszukiwarka-produktow.spec.ts --headed`). W oknie Playwright Inspector sprawdź lokator przyciskiem „Pick locator”. Usuń `page.pause()` po sprawdzeniu. Potem zepsuj jeden z testów w `tests/przyklady/` w nowy sposób i daj go do diagnozy drugiej parze. Dłuższe zadania: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Tabela przyczyn i nawyk: komunikat, trace, przyczyna jednym zdaniem, dopiero potem prośba do Claude.

## Rozwiązanie wzorcowe

Gałąź `solution/07`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/07 -- tests/zepsute docs/odpowiedzi/07.md
```
