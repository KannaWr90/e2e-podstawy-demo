# Ćwiczenie 12b. Zmiana wymagań o 13:00: poprawiacie test, który już macie

Blok 3.2, etap 2b · 30 min (13:00–13:30) · w parach, klawiaturę ma osoba, która nie pisała P13 ani P16

## Cel

Umiesz dostosować istniejący test do zmienionego wymagania tak, żeby w historii było widać, co się zmieniło i dlaczego. Umiesz sprawdzić, że poprawiony test nadal potrafi paść.

## Materiał wejściowy

Wiadomość od Bożeny, 12:58:
> Kochani, dwie malutkie zmiany w scenariuszach. Naprawdę ostatnie, obiecuję.
>
> **P13.** Zarząd nie patrzy na 20 listopada. Zarząd patrzy na dzień przed startem i na sam start. Test ma sprawdzić dwie daty:
> - `X-Namssor-Teraz: 2026-11-26`: `days_left` równe 1, `message` równe „Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.”;
> - `X-Namssor-Teraz: 2026-11-27`: `days_left` równe 0, `message` równe „Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.”.
> Sprawdzenie błędnej daty (400) zostaje.
>
> **P16.** Biuro Mikołaja nie kupuje żelu. Kupuje „Kalendarz adwentowy 2026”, 24 sztuki, po jednym na każde okienko. W koszyku: ilość 24, wartość „959,76 zł”, suma „razem” równa sumie kolumny „Wartość”.
>
> P.S. Klaudiusz mówi, że najszybciej będzie napisać oba testy od nowa. Wolałabym nie.

- Wasze testy P13 i P16 w `tests/projekt/`, jeśli już są.
- `docs/projekt.md`: pierwotna wersja P13 i P16.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujecie w oknie testów.

1. **Zapiszcie, co się zmienia.** Dla P13 i P16 wypiszcie w dwóch kolumnach, na kartce albo w notatniku: linie testu, które zostają, i linie do zmiany. Nie zmieniajcie jeszcze kodu.

> **Nie macie jeszcze P13 ani P16**
> Najpierw napiszcie test według pierwotnego wymagania z `docs/projekt.md` i zróbcie commit. Potem zmieńcie go według tej karty i zróbcie drugi commit. Historia ma pokazać zmianę wymagania.

2. **Poprawcie P13.** Zmieniajcie istniejący plik, nie twórzcie nowego. Zróbcie dwa testy, po jednym na datę. Nazwa testu ma mówić, którą datę sprawdza.
   ```powershell
   npx playwright test tests/projekt/p13
   ```
   Oczekiwany wynik: wszystkie testy z pliku `passed`.

> **Jeśli utknęliście po 10 minutach**
> Jeśli Claude proponuje nowy plik `p13-…-v2.spec.ts`, odmówcie i poproście o zmianę w istniejącym. Pętla po tablicy obiektów `{ data, dni, komunikat }` z `test(...)` w środku daje osobny wynik dla każdej daty. Nazwa testu musi zawierać datę, inaczej Playwright zgłosi dwa testy o tej samej nazwie.

3. **Poprawcie P16.** Zmieniacie produkt, ilość i oczekiwaną wartość. Jeśli test sprząta koszyk, sprawdźcie, czy sprząta nowy produkt.
   ```powershell
   npx playwright test tests/projekt/p16
   ```
   Oczekiwany wynik: wszystkie testy z pliku `passed`.

4. **Sprawdźcie, że poprawione testy potrafią paść.**

   a) W P13 zamieńcie `2026-11-26` na `2026-11-25` i uruchomcie polecenie z kroku 2. Oczekiwany wynik: `1 failed`. Przywróćcie datę `2026-11-26`.

   b) W P16 zostawcie dodawanie 24 sztuk. Tylko w asercji oczekiwanej ilości wpiszcie 23 i uruchomcie polecenie z kroku 3. Oczekiwany wynik: `1 failed`. Przywróćcie w asercji 24.

5. **Zróbcie commit z powodem zmiany.**
   ```powershell
   git add tests/projekt
   git commit -m "Projekt P13 i P16: zmiana wymagań Bożeny z 13:00" -m "Review: OK"
   git show --stat HEAD
   ```
   Oczekiwany wynik `git show --stat`: zmienione tylko dwa istniejące pliki, żaden nowy (`create mode` nie występuje).

## Przykład wyniku

```
PS C:\e2e\e2e-podstawy-demo> git show --stat HEAD
commit 4e1d2c3...
    Projekt P13 i P16: zmiana wymagań Bożeny z 13:00

    Review: OK

 tests/projekt/p13-odliczanie.spec.ts      | 27 ++++++++++++++++++---------
 tests/projekt/p16-ilosc-z-karty.spec.ts   |  8 ++++----
 2 files changed, 22 insertions(+), 13 deletions(-)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/projekt/p13 tests/projekt/p16` daje same `passed`, a w raporcie widać osobny wynik dla 26.11 i 27.11.
- [ ] `git show --stat HEAD` pokazuje zmianę dwóch istniejących plików, bez nowego pliku.
- [ ] Druga osoba wskazuje palcem w `git diff HEAD~1` linie, które zmieniły się z powodu Bożeny.
- [ ] Po zmianie daty albo ilości test pada (`1 failed`), po przywróceniu przechodzi.

## Dla szybszych

> **Skończyliście wcześniej**
> W P16 dopiszcie przypadek graniczny z karty produktu: ilość 1001 daje komunikat „Ilość musi być liczbą całkowitą od 1 do 1000.”, a koszyk się nie zmienia. Potem wypiszcie do notatek na prezentację asercje z waszych innych testów, które zależą od konkretnej daty albo ilości i padną przy następnej zmianie Bożeny.

## Artefakt do zabrania

Commit „zmiana wymagań” w waszym repo (na forku po `git push`): dwa poprawione testy, w historii widać, co się zmieniło.

## Rozwiązanie wzorcowe

Brak gałęzi z rozwiązaniem. Wynik sprawdzacie krokiem 4 i omawiacie na spotkaniu „wydajemy czy nie”.
