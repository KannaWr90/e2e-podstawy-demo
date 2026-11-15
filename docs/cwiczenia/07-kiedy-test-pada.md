# Ćwiczenie 07. Czerwone testy: najpierw diagnoza, potem poprawka

Blok 2.3 · 40 min (część A 25 min, część B 15 min, jeśli zdążysz) · w parach, zmiana ról co blok

## Cel

Z komunikatu błędu i nagrania przebiegu (trace albo UI mode) umiesz ustalić, dlaczego test padł. Przyczynę zapisujesz jednym zdaniem i dopiero z nią prosisz Claude o poprawkę.

## Materiał wejściowy

Nocny build jest czerwony. Wiadomość od Mirka, wtorek, 7:58:

> U mnie działa. Wszystkie testy przechodziły na moim laptopie, sprawdziłem dwa razy. Pewnie serwer buildów ma zły dzień. Zrestartujcie go i będzie zielono.

- `tests/zepsute/01-wyszukiwarka-produktow.spec.ts`, `02-logowanie-admina.spec.ts`, `03-lista-zamowien.spec.ts`: trzy testy z części A, które padają, każdy z innego powodu.
- `tests/zepsute/04-zapis-ustawien.spec.ts`, `05-zamowienie-z-koszyka.spec.ts`, `06-powrot-po-logowaniu.spec.ts`: trzy testy z części B.
- Testy z `tests/zepsute` biegną tylko w osobnym projekcie Playwright `zepsute`, więc `npm test` ich nie uruchamia.

Tabela do wypełnienia:

| Test | Pierwsza linia błędu | Co widać w trace w chwili błędu | Przyczyna (jedno zdanie) |
|---|---|---|---|
| 01 | | | |
| 02 | | | |
| 03 | | | |

## Kroki: część A (25 min)

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujesz w oknie testów.

1. **Uruchom zepsute testy.** W oknie testów wpisz:
   ```powershell
   npx playwright test --project=zepsute
   ```
   Oczekiwany wynik: `6 failed`. Dwa testy czekają na swój błąd około 30 sekund. Przepisz do tabeli pierwszą linię `Error:` testów 01–03. Testami 04–06 zajmiesz się w części B.

2. **Obejrzyj każdy test w UI mode.** W oknie testów wpisz:
   ```powershell
   npx playwright test --project=zepsute --ui
   ```
   Uruchom test przyciskiem ▶. Kliknij ostatni krok na osi czasu i przełączaj zakładki „Before” i „After” nad podglądem strony. Zakładka „Locator” (ikona celownika) pokazuje, które elementy pasują do locatora. Zapisz w tabeli, co strona pokazywała w chwili błędu.

> **Wolisz raport HTML niż UI mode**
> `npx playwright show-report` w oknie testów otwiera raport z kroku 1. Kliknij test, potem obrazek „Trace”. To samo nagranie co w UI mode, bez ponownego uruchamiania.

3. **Zapisz przyczynę jednym zdaniem.** Przyczyna mówi, co jest nie tak w teście albo w aplikacji, np. „Locator X pasuje do dwóch elementów, bo…”. „Test nie działa” i „timeout” to objaw.

> **Jeśli utknąłeś po 10 minutach**
> Przy każdym teście zadaj dwa pytania. Ile elementów na stronie pasuje do locatora z linii błędu: zero, jeden czy kilka? Czy strona była już gotowa w chwili, gdy test sprawdzał wynik?

4. **Poproś Claude o poprawkę i podaj mu przyczynę.** Zamknij okno UI mode albo przejdź do okna Claude. W oknie Claude uruchom `claude` (jeśli jeszcze nie działa). Po kolei dla testów 01, 02, 03 podaj w prośbie plik, wymaganie z komentarza i twoją przyczynę z tabeli. Dopisz, że wymaganie ma zostać sprawdzone w całości. Przejrzyj zmianę, zanim ją przyjmiesz: czy asercja nadal sprawdza wymaganie?

5. **Sprawdź poprawki.** W oknie testów wpisz:
   ```powershell
   npx playwright test --project=zepsute tests/zepsute/01 tests/zepsute/02 tests/zepsute/03
   ```
   Oczekiwany wynik: `3 passed`. Potem sprawdź, czy test z danymi ładowanymi z opóźnieniem jest stabilny:
   ```powershell
   npx playwright test --project=zepsute tests/zepsute/03-lista-zamowien.spec.ts --repeat-each=10
   ```
   Oczekiwany wynik: `10 passed`.

## Kroki: część B, „u mnie działa” (15 min)

Druga wiadomość od Mirka, 9:12:

> Dopisałem jeszcze trzy testy: zapis ustawień, zamówienie z koszyka i powrót po logowaniu. U mnie wszystkie przechodzą. Na buildzie też przejdą, jestem prawie pewien.

Dopisz do tabeli wiersze 04, 05 i 06.

6. **Zdiagnozuj testy 04–06.** Ta sama metoda co w krokach 2–3: pierwsza linia błędu, trace w chwili błędu, przyczyna jednym zdaniem. W oknie testów wpisz:
   ```powershell
   npx playwright test --project=zepsute tests/zepsute/04 tests/zepsute/05 tests/zepsute/06
   ```
   Oczekiwany wynik: `3 failed`. Przy każdym teście zapisz też, dlaczego Mirkowi test mógł przechodzić. W teście 05 obejrzyj w trace krok `click` i jego log.

7. **Popraw testy 04–06 i uruchom je dwa razy pod rząd.** Tak jak w kroku 4: z przyczyną z tabeli, bez `waitForTimeout` (sztywne czekanie, np. 5 sekund) i bez usuwania asercji. W oknie testów uruchom polecenie z kroku 6 dwa razy. Oczekiwany wynik za każdym razem: `3 passed`.

8. **Zapisz pracę w git.** W oknie testów wpisz:
   ```powershell
   git add .
   git commit -m "Ćwiczenie 07: diagnoza i poprawki testów z tests/zepsute"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 07: diagnoza i poprawki testów z tests/zepsute` (skrót będzie inny), a `git status` pokazuje potem `nothing to commit, working tree clean`. Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

## Przykład wyniku

Wiersz tabeli dla testu spoza tego ćwiczenia:

| Test | Pierwsza linia błędu | Co widać w trace w chwili błędu | Przyczyna (jedno zdanie) |
|---|---|---|---|
| logowanie | `Error: expect(locator).toHaveText(expected) failed` | Komunikat „Nieprawidłowy login lub hasło” jest na stronie | Test oczekuje tekstu „Błędne hasło”, którego aplikacja nigdy nie wyświetla: tekst w teście był zgadnięty |

## Kryterium „gotowe”

- [ ] Tabela ma trzy przyczyny (po części B sześć), każda jednym zdaniem i każda inna.
- [ ] Umiesz pokazać drugiej osobie w UI mode albo w trace miejsce, z którego wzięła się przyczyna.
- [ ] Polecenie z kroku 5 daje `3 passed`, a `--repeat-each=10` dla testu 03 daje `10 passed`.
- [ ] Żadna poprawka nie usuwa asercji ani nie dodaje `waitForTimeout`.
- [ ] Po części B: `npx playwright test --project=zepsute` daje `6 passed`, także przy drugim uruchomieniu pod rząd.

## Dla szybszych

> **Skończyłeś wcześniej**
> Wstaw `await page.pause();` przed linią, która padała w teście 01, i uruchom go z oknem przeglądarki (`npx playwright test --project=zepsute tests/zepsute/01-wyszukiwarka-produktow.spec.ts --headed`). W oknie Playwright Inspector sprawdź locator przyciskiem „Pick locator”. Usuń `page.pause()` po sprawdzeniu. Potem zepsuj jeden z testów w `tests/przyklady/` w nowy sposób i daj go do diagnozy drugiej parze. Dłuższe zadania: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Tabela przyczyn i nawyk: komunikat, trace, przyczyna jednym zdaniem, dopiero potem prośba do Claude.

## Rozwiązanie wzorcowe

Gałąź `solution/07`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/07 -- tests/zepsute docs/odpowiedzi/07.md
```
