# Ćwiczenie 12c. Hotfix Mirka o 14:00: test do poprawy czy błąd do zgłoszenia

Blok 3.2, etap 4 · 20 min (14:00–14:20) · w parach, klawiaturę ma osoba, która robiła review krzyżowe

## Cel

Gdy testy padają po zmianie w aplikacji, umiecie ustalić przyczynę każdego. Zmienił się tekst na ekranie: poprawiacie test. Aplikacja działa źle: zgłaszacie błąd. Umiecie napisać zgłoszenie błędu, którego dowodem jest test.

## Materiał wejściowy

Wiadomość od Mirka, 13:59:
> Wrzuciłem malutki hotfix, same kosmetyczne poprawki tekstów, Bożena prosiła. Testy pewnie trochę poczerwienieją, ale to wasze testy, nie mój kod. U mnie działa.

Wiadomość od Klaudiusza, 14:00:
> Przejrzałem zmianę Mirka. Jestem pewien, że to tylko teksty. Mogę od razu poprawić wszystkie testy, żeby były zielone.

- Wasz pakiet w `tests/projekt/` i testy z poprzednich ćwiczeń.
- Wersja aplikacji z hotfiksem: zmienna `APP_VERSION` z wartością `hotfix`. Na wspólnym serwerze `namssor` trener włącza ją o 14:00.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npm run db:reset`, `npx playwright …` i `git …` wpisujecie w oknie testów.

1. **Zapiszcie wynik przed hotfiksem.** Jeśli w oknie aplikacji działa `npm start`, zatrzymajcie aplikację (`Ctrl+C`). Potem w oknie testów:
   ```powershell
   npm run db:reset
   npx playwright test --workers=1
   ```
   Oczekiwany wynik `npm run db:reset`: linia zaczyna się od `Baza odtworzona z danymi startowymi`. Zapiszcie liczby `passed`, `failed` i `skipped`. Oczekiwany wynik testów: bez `failed`.

> **Pracujecie na wspólnym serwerze, nie lokalnie**
> W oknie testów zamiast `$env:APP_VERSION` ustawcie `$env:BASE_URL` na adres serwera `namssor` i konto pary w `APP_USER` i `APP_PASSWORD`. Kroku `npm run db:reset` na serwerze nie ma. Na serwerze hasło konta `admin` zna tylko trener, więc testy z kontem `admin` padną tam przy logowaniu. Wpiszcie je do tabeli jako „nie dotyczy” i sprawdźcie je lokalnie.

2. **Uruchomcie testy na wersji z hotfiksem.**
   ```powershell
   npm run db:reset
   $env:APP_VERSION="hotfix"
   npx playwright test --workers=1
   ```
   Oczekiwany wynik `npm run db:reset`: znowu `Baza odtworzona z danymi startowymi`, bo krok 1 zmienił dane. Oczekiwany wynik testów: kilka testów `failed`. Jeśli wszystko jest zielone, sprawdźcie, czy w oknie aplikacji nie działa stara aplikacja. Playwright używa działającej i nie uruchamia nowej.

3. **Zdiagnozujcie każdy czerwony test.** Dla każdego testu `failed` otwórzcie błąd w raporcie (`npx playwright show-report`) albo w trace i wypełnijcie tabelę. Nie zmieniajcie jeszcze kodu.

   | Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
   |---|---|---|---|
   | | | zmieniony tekst, etykieta albo układ / aplikacja liczy albo zapisuje źle | test do poprawy / błąd do zgłoszenia Mirkowi |

   Przy każdym teście sprawdźcie ręcznie w przeglądarce, co widzi klient. Wersję z hotfiksem uruchomcie w oknie aplikacji:
   ```powershell
   $env:APP_VERSION="hotfix"
   npm start
   ```
   Oczekiwany wynik: na dole strony http://localhost:4100 widać „Wersja: hotfix”. Komunikat „element not found” mówi tylko, że czegoś nie ma. Przyczynę zobaczycie dopiero na ekranie.

> **Jeśli utknęliście po 5 minutach**
> Dla każdego czerwonego testu zadajcie dwa pytania. Czy klient zrobi zakupy z nowym tekstem na ekranie? Czy liczby, które widzi klient, zgadzają się z tym, co zamówił? Jedno „nie” na drugie pytanie wystarczy, żeby to był błąd.

4. **Poprawcie testy na osobnej gałęzi.** Hotfix nie jest jeszcze wydany, więc poprawki do testów trzymacie obok `main`:
   ```powershell
   git switch -c hotfix-testy
   ```
   Poprawcie tylko testy z decyzją „test do poprawy” i uruchomcie jeszcze raz z `$env:APP_VERSION="hotfix"`. Oczekiwany wynik: czerwone zostają tylko testy z decyzją „błąd do zgłoszenia”. Jeśli takich nie macie, zapiszcie, którego testu brakuje w pakiecie, żeby błąd złapać, i dopiszcie go na `main`.

5. **Napiszcie zgłoszenie dla Mirka i wróćcie do wersji zwykłej.** Zgłoszenie: tytuł, kroki, oczekiwany wynik, faktyczny wynik, test, który to pokazuje (plik i nazwa). Potem:
   ```powershell
   git add tests
   git commit -m "Testy pod hotfix: nowe etykiety" -m "Review: OK"
   git switch main
   Remove-Item Env:APP_VERSION
   ```
   W oknie aplikacji zatrzymajcie aplikację (`Ctrl+C`) i wpiszcie `Remove-Item Env:APP_VERSION`. Bez tego testy dalej trafiają do wersji z hotfiksem.

## Przykład wyniku

Wiersz tabeli dla testu z ćwiczenia 07. Test szuka przycisku „Zaloguj się”, a na ekranie przycisk ma napis „Zaloguj”. Aplikacja działa dobrze, więc poprawić trzeba test. Plik i linię przepisujecie z nagłówka błędu w raporcie: `:5:5` to linia 5 (tu zaczyna się test) i kolumna 5.
```
  1) [chromium] › tests/zepsute/02-logowanie-admina.spec.ts:5:5 › administrator widzi link do panelu admina

    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Zaloguj się' })
```

| Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| `tests/zepsute/02-logowanie-admina.spec.ts:5` | `locator.click: Test timeout of 30000ms exceeded`, czeka na przycisk „Zaloguj się” | na ekranie przycisk „Zaloguj”: zmieniony tekst | test do poprawy |

Zgłoszenie (format):
```
Tytuł: <co jest źle, jednym zdaniem>
Wersja: hotfix
Kroki: 1. … 2. … 3. …
Oczekiwany wynik: …
Faktyczny wynik: …
Test: tests/projekt/<plik>.spec.ts › <nazwa testu> (failed na hotfix, passed bez APP_VERSION)
```

## Kryterium „gotowe”

- [ ] Tabela z kroku 3 ma wiersz dla każdego testu `failed` z kroku 2 i decyzję przy każdym.
- [ ] Na gałęzi `hotfix-testy` z `$env:APP_VERSION="hotfix"` czerwone są tylko testy z decyzją „błąd do zgłoszenia”.
- [ ] Zgłoszenie dla Mirka wskazuje test, który pada na hotfiksie i przechodzi na wersji zwykłej. Druga osoba uruchamia go w obu wersjach i potwierdza.
- [ ] Po `git switch main` i `Remove-Item Env:APP_VERSION` cały pakiet znowu jest zielony.

## Dla szybszych

> **Skończyliście wcześniej**
> Policzcie, ile testów musieliście poprawić przez jedną zmianę tekstu i dlaczego tyle. Jeśli ten sam tekst stoi w kilku plikach, zastanówcie się, gdzie powinien stać tylko raz (funkcja pomocnicza, jak `zaloguj`, albo Page Object z `extra/d3-page-object-fixtures`). Potem wybierzcie jeden poprawiony test i przepiszcie go tak, żeby następna zmiana tekstu wymagała poprawki w jednym miejscu.

## Artefakt do zabrania

Tabela diagnozy, zgłoszenie dla Mirka z testem jako dowodem i gałąź `hotfix-testy` z poprawionymi testami. To materiał do części „co znaleźliśmy” na spotkaniu „wydajemy czy nie”.

## Rozwiązanie wzorcowe

Brak gałęzi z rozwiązaniem: wynik zależy od waszego pakietu. Trener omawia wyniki po 14:20.
