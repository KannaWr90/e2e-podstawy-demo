# Ćwiczenie 11. Jedna funkcja logowania i uruchamianie wybranych testów, także na wspólnym serwerze

Blok 3.1 · 20 min (9:20–9:40) · w parach, klawiaturę ma osoba, która wczoraj mniej pisała

## Cel

Umiesz przeczytać gotową funkcję pomocniczą i użyć jej w teście zamiast powtarzanych linii logowania. Umiesz z linii poleceń uruchomić dokładnie te testy, których potrzebujesz: jeden plik, testy z tagiem, wybraną przeglądarkę, z oknem albo bez i na innym serwerze niż twój komputer.

## Materiał wejściowy

Zgłoszenie od Mirka, 8:47:
> Dzisiaj zamrożenie. Klaudiusz w nocy przepisał logowanie w 14 plikach, każdy trochę inaczej, w dwóch wpisał hasło admina. Wrzuciłem jedną funkcję do `tests/pomocnicze/logowanie.ts`. Używajcie jej, proszę. I nie pytajcie, czemu `.env` u was nie działa. U mnie działa.

- `tests/pomocnicze/logowanie.ts`: gotowe funkcje `zaloguj(page)` i `zalogujPrzezApi(request)`.
- `tests/czytanie/02-moje-zamowienia.spec.ts`: dwa testy, w każdym te same trzy linie logowania.
- Adres wspólnego serwera: `https://namssor-XXXX.europe-central2.run.app`. Prawdziwy adres w miejsce `XXXX` poda trener na sali.

## Kroki

PowerShell, z katalogu głównego repo.

1. **Przeczytaj funkcję logowania.** Otwórz `tests/pomocnicze/logowanie.ts` i odpowiedz drugiej osobie na trzy pytania:
   - którym kontem loguje `await zaloguj(page);`, gdy nie ustawisz żadnej zmiennej;
   - jak zalogować inne konto bez zmiany pliku funkcji (są dwa sposoby);
   - co się stanie w teście, gdy hasło jest złe, i która linia funkcji o tym decyduje.

2. **Użyj funkcji w teście i oznacz testy tagiem.** W `tests/czytanie/02-moje-zamowienia.spec.ts`:
   - dopisz import pod pierwszą linią: `import { zaloguj } from '../pomocnicze/logowanie';`;
   - w obu testach zamień trzy linie logowania na `await zaloguj(page);` i przenieś je przed `await page.goto('/zamowienia');`;
   - dodaj tag do grupy: `test.describe('Moje zamówienia', { tag: '@zamowienia' }, () => {`.
   ```powershell
   npx playwright test tests/czytanie/02-moje-zamowienia.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

> **Jeśli utknąłeś po 5 minutach**
> Funkcja `zaloguj` kończy na stronie głównej. Jeśli test czeka na adres `/zamowienia`, sprawdź, czy po `await zaloguj(page);` jest przejście na tę stronę. Błąd `Cannot find module` oznacza złą ścieżkę w imporcie: plik testu leży w `tests/czytanie`, więc do `tests/pomocnicze` prowadzi `../pomocnicze/logowanie`.

3. **Uruchom wybrane testy z linii poleceń.** Tag `@…` w PowerShell zawsze w cudzysłowie, bo bez niego PowerShell potraktuje `@` jako swój znak specjalny.

   | Polecenie | Oczekiwany wynik |
   |---|---|
   | `npx playwright test tests/czytanie` | `17 passed` |
   | `npx playwright test --grep "@zamowienia"` | `2 passed` |
   | `npx playwright test --grep-invert "@zamowienia"` | żaden test z `tests/czytanie/02-moje-zamowienia` na liście |
   | `npx playwright test tests/czytanie --project=chromium` | `17 passed` |
   | `npx playwright test tests/czytanie/01-wyszukiwarka.spec.ts --headed` | okno przeglądarki otwiera się i zamyka, `2 passed` |
   | `npx playwright test --ui` | okno trybu UI z listą testów; uruchom w nim jeden test przyciskiem ▶ |

4. **Uruchom testy dymne na wspólnym serwerze.** Zmienna `BASE_URL` mówi Playwrightowi, gdzie jest aplikacja. Gdy wskazuje inny komputer niż `localhost`, Playwright nie uruchamia aplikacji u ciebie.
   ```powershell
   $env:BASE_URL="https://namssor-XXXX.europe-central2.run.app"
   npx playwright test tests/smoke.spec.ts
   Remove-Item Env:BASE_URL
   ```
   Oczekiwany wynik: `4 passed`. Zmienna działa w tym oknie PowerShell do `Remove-Item` albo do zamknięcia okna.

> **Pracujesz bez dostępu do wspólnego serwera**
> Gdy w tym oknie PowerShell jest ustawione `$env:HTTPS_PROXY` (sekcja „Firmowe proxy” w `README.md`), Playwright łączy się przez to proxy: przeglądarka i testy API. Adresy z `$env:NO_PROXY` (bez tej zmiennej: `localhost,127.0.0.1`) idą bez proxy. Tego ustawienia nie sprawdziliśmy jeszcze za prawdziwym firmowym proxy. Jeśli test kończy się błędem `net::ERR_PROXY_CONNECTION_FAILED`, `net::ERR_TIMED_OUT` albo `net::ERR_NAME_NOT_RESOLVED`, firmowe proxy nie przepuszcza adresu serwera. Błąd `net::ERR_CERT_AUTHORITY_INVALID` znaczy, że proxy podmienia certyfikat serwera: ustaw `$env:NODE_EXTRA_CA_CERTS` na plik certyfikatu firmy, jak w `README.md`, i powtórz. W każdym z tych przypadków zgłoś to trenerowi i zrób ten krok z aplikacją na innym porcie. W drugim oknie PowerShell: `$env:PORT="4200"`, potem `npm start`. W pierwszym oknie: `$env:BASE_URL="http://localhost:4200"` i to samo polecenie testów. Oczekiwany wynik też `4 passed`.

5. **Zaloguj testy kontem twojej pary.** Na wspólnym serwerze każda osoba ma konto `tester01`–`tester12` (numer poda trener), hasło `czarny-piatek-2026`. To samo konto jest w twojej lokalnej aplikacji. Funkcja `zaloguj` bierze konto ze zmiennych:
   ```powershell
   $env:APP_USER="tester05"
   $env:APP_PASSWORD="czarny-piatek-2026"
   npx playwright test tests/czytanie/02-moje-zamowienia.spec.ts
   Remove-Item Env:APP_USER
   Remove-Item Env:APP_PASSWORD
   ```
   Oczekiwany wynik: `2 failed`, a w obu błędach locator z `ZAM-1001`. Logowanie zadziałało, ale `ZAM-1001` to zamówienie konta `user`, a tester go nie ma. Ten sam test na innym koncie widzi inne dane.

6. **Zapisz pracę w git.**
   ```powershell
   git add .
   git commit -m "Ćwiczenie 11: logowanie funkcją zaloguj, tag @zamowienia"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 11: logowanie funkcją zaloguj, tag @zamowienia` (skrót będzie inny), a `git status` potem pokazuje `nothing to commit, working tree clean`. Masz fork (ścieżka A z ćwiczenia 01): dopisz `git push`.

## Przykład wyniku

Numery linii i czasy u ciebie mogą być inne. W klasycznej konsoli PowerShell zamiast `✓` i `✘` zobaczysz `ok` i `x`.
```
PS C:\e2e\e2e-podstawy-demo> npx playwright test --grep "@zamowienia"

Running 2 tests using 2 workers

  ✓  2 [chromium] › tests/czytanie/02-moje-zamowienia.spec.ts:8:7 › Moje zamówienia › lista pokazuje zamówienia klienta z ich statusem @zamowienia (1.5s)
  ✓  1 [chromium] › tests/czytanie/02-moje-zamowienia.spec.ts:25:7 › Moje zamówienia › klient nie widzi zamówienia innej osoby @zamowienia (2.5s)

  2 passed (2.9s)
```

## Kryterium „gotowe”

- [ ] `Select-String -Path tests\czytanie\02-moje-zamowienia.spec.ts -Pattern "user123"` nic nie wypisuje, a `npx playwright test --grep "@zamowienia"` daje `2 passed`.
- [ ] Z `$env:APP_USER="tester05"` testy z kroku 5 padają, bez zmiennej przechodzą. Umiesz wskazać linię w `logowanie.ts`, która o tym decyduje.
- [ ] Druga osoba z pary podaje ci zadanie („tylko testy z tagiem na wspólnym serwerze”, „jeden plik z oknem przeglądarki”), a ty piszesz polecenia bez zaglądania do karty.

## Dla szybszych

> **Skończyłeś wcześniej**
> Powtórz demo trenera: dane logowania w pliku `.env`. Skopiuj wzór (`Copy-Item .env.example .env`) i sprawdź `git status`: pliku `.env` nie ma na liście. Dopisz na początku `playwright.config.ts` wczytanie pliku przez `process.loadEnvFile('.env')`, tylko gdy plik istnieje (`existsSync` z `node:fs`). Zmień w `.env` wartości `APP_USER` na `tester05` i `APP_PASSWORD` na `czarny-piatek-2026`, uruchom krok 5 bez `$env:` i porównaj wynik. Potem dopisz w `logowanie.ts` funkcję `zalogujJakoAdmin(page)` ze zmiennymi `APP_ADMIN_USER` i `APP_ADMIN_PASSWORD` i użyj jej w teście, w którym administrator widzi w menu pozycję „Panel admina”. Dłuższe zadania: gałąź `extra/d3-page-object-fixtures`.

## Artefakt do zabrania

Test `02-moje-zamowienia.spec.ts` z funkcją `zaloguj` i tagiem w twoim repo oraz lista poleceń uruchamiania z `BASE_URL` i kontem pary, potrzebna po południu w projekcie.

## Rozwiązanie wzorcowe

Gałąź `solution/11`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/11 -- playwright.config.ts tests/czytanie/02-moje-zamowienia.spec.ts
```
