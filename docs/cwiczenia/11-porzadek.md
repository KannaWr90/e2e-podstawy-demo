# Ćwiczenie 11. Logowanie w jednej funkcji, hasła w `.env` i uruchamianie wybranych testów

Blok 3.1 · 20 min · w parach, zmiana ról co blok

## Cel

Przeniesiesz powtarzane logowanie do jednej funkcji, a login i hasło z kodu testu do pliku `.env`, którego git nie wysyła. Uruchomisz z linii poleceń dokładnie te testy, których potrzebujesz: jeden plik, testy z tagiem, wybraną przeglądarkę, z oknem albo bez.

## Materiał wejściowy

- `.env.example`: nazwy zmiennych `APP_USER`, `APP_PASSWORD`, `APP_ADMIN_USER`, `APP_ADMIN_PASSWORD`.
- `.gitignore`: zawiera linię `.env`.
- `tests/czytanie/02-moje-zamowienia.spec.ts`: dwa testy, w każdym te same trzy linie logowania.
- Twoje testy z ćwiczeń 02 i 04, jeśli są gotowe.

## Kroki

1. **Utwórz plik `.env` i sprawdź, że git go nie widzi.**
   ```powershell
   Copy-Item .env.example .env
   git status
   ```
   Oczekiwany wynik: `Copy-Item` nic nie wypisuje. W wyniku `git status` nie ma pliku `.env`.

2. **Wczytaj `.env` w konfiguracji.** Playwright sam nie czyta pliku `.env`. Node ma do tego funkcję `process.loadEnvFile()`. Dopisz na początku `playwright.config.ts` jej wywołanie, ale tylko wtedy, gdy plik `.env` istnieje (`existsSync` z modułu `node:fs`). Bez tego warunku konfiguracja wyłoży się na komputerze, na którym `.env` jeszcze nie ma.

3. **Napisz funkcję logowania.** Utwórz plik `tests/pomocnicze/logowanie.ts` z funkcją `zaloguj(page)`. Funkcja bierze login i hasło z `process.env.APP_USER` i `process.env.APP_PASSWORD`, loguje przez formularz i sprawdza napis „Zalogowano jako …”. Gdy zmiennych brak, zatrzymuje test komunikatem, który mówi, co zrobić. Typ parametru: `Page` z `@playwright/test`.

> **Jeśli utknąłeś po 5 minutach**
> Weź trzy linie logowania z `tests/przyklady/logowanie.spec.ts` i przenieś je do funkcji. `'user'` zamień na zmienną z `process.env`. Funkcja musi mieć `export` przed `async function`, a test importuje ją linią `import { zaloguj } from '../pomocnicze/logowanie';`.

4. **Użyj funkcji w testach i oznacz je tagiem.** W `tests/czytanie/02-moje-zamowienia.spec.ts` zamień logowanie w obu testach na `await zaloguj(page);`, a potem przejdź na `/zamowienia`. Do `test.describe` dodaj tag: `test.describe('Moje zamówienia', { tag: '@zamowienia' }, () => {`. Jeśli masz gotowe testy z ćwiczeń 02 i 04, zrób w nich to samo.
   ```powershell
   npx playwright test tests/czytanie/02-moje-zamowienia.spec.ts
   ```
   Oczekiwany wynik: `2 passed`. Teraz sprawdź, że dane naprawdę idą z `.env`:
   ```powershell
   Rename-Item .env .env.wylaczony
   npx playwright test tests/czytanie/02-moje-zamowienia.spec.ts
   Rename-Item .env.wylaczony .env
   ```
   Oczekiwany wynik środkowego polecenia: `2 failed` i Twój komunikat o brakujących zmiennych.

5. **Uruchom wybrane testy z linii poleceń.** Tag `@…` w PowerShell zawsze w cudzysłowie: bez niego PowerShell potraktuje `@` jako swój znak specjalny.

   | Polecenie | Oczekiwany wynik |
   |---|---|
   | `npx playwright test tests/czytanie` | `5 passed` |
   | `npx playwright test --grep "@zamowienia"` | `2 passed` |
   | `npx playwright test --grep-invert "@zamowienia"` | żaden test z `02-moje-zamowienia` na liście |
   | `npx playwright test tests/czytanie --project=chromium` | `5 passed` |
   | `npx playwright test tests/czytanie/01-wyszukiwarka.spec.ts --headed` | okno przeglądarki otwiera się i zamyka, `2 passed` |
   | `npx playwright test --ui` | okno trybu UI z listą testów; uruchom w nim jeden test przyciskiem ▶ |

## Przykład wyniku

Numery linii i czasy u Ciebie mogą być inne.
```
PS C:\e2e\e2e-podstawy-demo> npx playwright test --grep "@zamowienia"

Running 2 tests using 2 workers

  ✓  2 [chromium] › tests/czytanie/02-moje-zamowienia.spec.ts:8:7 › Moje zamówienia › lista pokazuje zamówienia klienta z ich statusem @zamowienia (1.5s)
  ✓  1 [chromium] › tests/czytanie/02-moje-zamowienia.spec.ts:25:7 › Moje zamówienia › klient nie widzi zamówienia innej osoby @zamowienia (2.5s)

  2 passed (2.9s)
```

## Kryterium „gotowe”

- [ ] `git status` nie pokazuje `.env`, a `git grep -n "user123" -- tests/czytanie` nic nie znajduje.
- [ ] Bez pliku `.env` test pada z Twoim komunikatem, z plikiem przechodzi (krok 4).
- [ ] `npx playwright test --grep "@zamowienia"` daje `2 passed`.
- [ ] Druga osoba z pary podaje Ci zadanie („tylko testy API”, „jeden plik z oknem przeglądarki”), a Ty piszesz polecenie bez zaglądania do karty.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dopisz w `tests/pomocnicze/logowanie.ts` drugą funkcję, `zalogujJakoAdmin(page)`, która korzysta z `APP_ADMIN_USER` i `APP_ADMIN_PASSWORD`. Użyj jej w nowym teście: administrator widzi w menu pozycję „Panel admina”. Uruchom swoje testy na Firefoksie: `npx playwright install firefox`, potem `npx playwright test tests/czytanie --project=firefox`. Dłuższe zadania (Page Object, fixture „zalogowany użytkownik”): gałąź `extra/d3-page-object-fixtures`.

## Artefakt do zabrania

`tests/pomocnicze/logowanie.ts` i zmiana w `playwright.config.ts` w Twoim forku. Plik `.env` zostaje tylko na Twoim komputerze.

## Rozwiązanie wzorcowe

Gałąź `solution/11`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/11 -- playwright.config.ts tests/pomocnicze tests/czytanie/02-moje-zamowienia.spec.ts
```
