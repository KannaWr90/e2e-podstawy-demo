# Ćwiczenie 12c. Hotfix Mirka o 14:00: test do poprawy czy błąd do zgłoszenia

Blok 3.2, warstwa 4 · 20 min (14:00–14:20) · w parach, klawiaturę ma osoba, która robiła review krzyżowe

## Cel

Umiesz po czerwonym przebiegu rozdzielić testy, które padły, bo aplikacja zmieniła wygląd (test do poprawy), od testów, które padły, bo aplikacja działa źle (błąd do zgłoszenia). Umiesz napisać zgłoszenie błędu, którego dowodem jest test.

## Materiał wejściowy

Wiadomość od Mirka, 13:59:
> Wrzuciłem malutki hotfix, same kosmetyczne poprawki tekstów, Bożena prosiła. Testy pewnie trochę poczerwienieją, ale to Wasze testy, nie mój kod. U mnie działa.

Wiadomość od Klaudiusza, 14:00:
> Przejrzałem zmianę Mirka. Jestem pewien, że to tylko teksty. Mogę od razu poprawić wszystkie testy, żeby były zielone.

- Wasz pakiet w `tests/projekt/` i testy z poprzednich ćwiczeń.
- Wersja aplikacji z hotfiksem: zmienna `APP_VERSION` z wartością `hotfix`. Na wspólnym serwerze `namssor` trener włącza ją o 14:00.

## Kroki

PowerShell, z katalogu głównego repo.

1. **Zapiszcie wynik przed hotfiksem.** Zamknijcie aplikację uruchomioną przez `npm start`, jeśli działa w innym oknie (`Ctrl+C`). Potem:
   ```powershell
   npx playwright test --workers=1
   ```
   Zapiszcie liczby `passed`, `failed` i `skipped`. Oczekiwany wynik: bez `failed`.

2. **Uruchomcie testy na wersji z hotfiksem.**
   ```powershell
   $env:APP_VERSION="hotfix"
   npx playwright test --workers=1
   ```
   Oczekiwany wynik: kilka testów `failed`. Na dole strony sklepu widać „Wersja: hotfix”. Jeśli wszystko jest zielone, sprawdźcie, czy w innym oknie nie działa stara aplikacja: Playwright używa działającej i nie uruchamia nowej.

3. **Zdiagnozujcie każdy czerwony test.** Dla każdego testu `failed` otwórzcie błąd w raporcie (`npx playwright show-report`) albo w trace i wypełnijcie tabelę. Nie zmieniajcie jeszcze kodu.

   | Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
   |---|---|---|---|
   | | | zmieniony tekst, etykieta albo układ / aplikacja liczy albo zapisuje źle | test do poprawy / błąd do zgłoszenia Mirkowi |

   Przy każdym teście sprawdźcie ręcznie w przeglądarce (`npm start` w drugim oknie, z tą samą zmienną), co widzi klient. Komunikat „element not found” mówi tylko, że czegoś nie ma. Przyczynę mówi dopiero ekran.

> **Jeśli utknąłeś po 5 minutach**
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

> **Pracujesz na wspólnym serwerze, nie lokalnie**
> Zamiast `$env:APP_VERSION` ustaw `$env:BASE_URL` na adres serwera `namssor` i konto pary w `APP_USER` i `APP_PASSWORD`. Testy z kontem `admin` padną tam przy logowaniu, bo tego konta na serwerze nie ma. Wpisz je do tabeli jako „nie dotyczy” i sprawdź je lokalnie.

## Przykład wyniku

Wiersz tabeli z innego wydania Mirka, sprzed tygodnia (przycisk „Zaloguj” dostał napis „Zaloguj się”, ale tylko w teście):
```
  1) [chromium] › tests/zepsute/02-logowanie-admina.spec.ts:5:5 › administrator widzi link do panelu admina

    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Zaloguj się' })
```

| Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| `tests/zepsute/02-logowanie-admina.spec.ts:10` | `locator.click: Test timeout of 30000ms exceeded`, czeka na przycisk „Zaloguj się” | na ekranie przycisk „Zaloguj”: zmieniony tekst | test do poprawy |

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

> **Skończyłeś wcześniej**
> Policzcie, ile testów musieliście poprawić przez jedną zmianę tekstu i dlaczego tyle. Jeśli ten sam tekst stoi w kilku plikach, zastanówcie się, gdzie powinien stać tylko raz (funkcja pomocnicza, jak `zaloguj`, albo Page Object z `extra/d3-page-object-fixtures`). Potem wybierzcie jeden poprawiony test i przepiszcie go tak, żeby następna zmiana tekstu wymagała poprawki w jednym miejscu.

## Artefakt do zabrania

Tabela diagnozy, zgłoszenie dla Mirka z testem jako dowodem i gałąź `hotfix-testy` z poprawionymi testami. To materiał do części „co znaleźliśmy” na spotkaniu „wydajemy czy nie”.

## Rozwiązanie wzorcowe

Brak gałęzi z rozwiązaniem: wynik zależy od Waszego pakietu. Trener omawia wyniki po 14:20.
