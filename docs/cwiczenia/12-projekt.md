# Ćwiczenie 12. Projekt w parach: pakiet regresji przed zamrożeniem kodu

Blok 3.2 · 9:40–15:00, z przerwami · w parach, zmiana ról po każdym teście

## Cel

Umiesz w parze zamienić scenariusze biznesowe na testy E2E i API pisane z Claude Code i przepuścić każdy test przez review drugiej osoby, zanim trafi do commita. Umiesz poprawić istniejący test, gdy zmienia się wymaganie albo aplikacja, i odróżnić test do poprawy od błędu do zgłoszenia.

## Materiał wejściowy

Wiadomość od Bożeny, 9:38:
> Kochani, regresja ręczna trwa trzy dni, a zamrożenie jest o 16:00. Scenariusze są w `docs/projekt.md`, wszystkie już ostateczne. Klaudiusz mówi, że napisze wszystko w kwadrans. Proszę, sprawdźcie po nim. O 15:00 spotkanie: wydajemy czy nie.

- `docs/projekt.md`: scenariusze P1–P16, dane, kryteria oceny, karta punktacji review krzyżowego, szablon prezentacji.
- `docs/lista-kontrolna-review.md`: lista kontrolna review z ćwiczenia 05.
- `tests/pomocnicze/logowanie.ts`: `zaloguj(page)` i `zalogujPrzezApi(request)` z ćwiczenia 11.
- Opis API: http://localhost:4100/api/docs (po `npm start`).

Projekt ma etapy. Etapy 1–4 robicie po kolei. Godziny z kolumny „Kiedy” obowiązują wszystkich. Polowanie (etap 5) trwa obok, od 11:00.

| Etap | Co | Kiedy |
|---|---|---|
| 1 | Scenariusze P1–P12, kroki 1–5 tej karty | od 9:40 |
| 2 | Scenariusze Bożeny P13–P16 | gdy etap 1 ma co najmniej 4 testy |
| 2b | Zmiana wymagań: karta `12b-zmiana-wymagan.md` | 13:00 |
| 3 | Review krzyżowe z kartą punktacji z `docs/projekt.md` | 13:30–14:00 |
| 4 | Hotfix Mirka: karta `12c-hotfix.md` | 14:00–14:20 |
| 5 | Polowanie na błędy: karta `13-polowanie.md` | od 11:00 do 14:55, równolegle z resztą |
| 6 | Spotkanie „wydajemy czy nie”, krok 6 | od 15:00 |

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujecie w oknie testów, rozmowę z Claude prowadzicie w oknie Claude.

1. **Wybierzcie scenariusze i jedno repo.** Przeczytajcie `docs/projekt.md`. Wybierzcie co najmniej 4 scenariusze z P1–P12, w tym co najmniej 1 API i 1 z kontem `admin`. Wpiszcie numery w linii „Wybrane”. Pracujecie w jednym repo, na laptopie jednej osoby, i tam robicie commity:
   ```powershell
   git add docs/projekt.md
   git commit -m "Projekt: wybrane scenariusze"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Projekt: wybrane scenariusze` (skrót będzie inny). Jeśli to repo jest forkiem (ścieżka A z ćwiczenia 01), druga osoba może dostać dostęp (GitHub › fork › Settings › Collaborators › Add people), a po każdym commicie dopisujecie `git push`. Bez konta GitHub wszystko zostaje na jednym laptopie i to wystarcza.

2. **Napiszcie pierwszy test z Claude Code.** Osoba A ma klawiaturę. Prompt do Claude zawiera numer scenariusza, plik docelowy (`tests/projekt/pN-….spec.ts`), oczekiwany wynik przepisany z `docs/projekt.md` i prośbę o logowanie funkcją z `tests/pomocnicze/logowanie.ts`. Przed akceptacją zmiany osoba A czyta kod i porównuje każdy punkt „Oczekiwany wynik” z asercjami.
   ```powershell
   npx playwright test tests/projekt/p5-api-katalog.spec.ts
   ```
   Oczekiwany wynik: wszystkie testy z pliku `passed` (tu przykład dla P5).

3. **Zróbcie review i weryfikację.** Klawiaturę bierze osoba B.

   a) B czyta test z listą kontrolną review i mówi, co poprawić.

   b) B zmienia oczekiwaną wartość w jednej asercji i uruchamia to samo polecenie co w kroku 2. Oczekiwany wynik: `1 failed`.

   c) B przywraca tę wartość i uruchamia polecenie jeszcze raz. Oczekiwany wynik: wszystkie testy z pliku `passed`.

   d) Commit z wynikiem review w drugiej linii opisu:
   ```powershell
   git add tests/projekt
   git commit -m "Projekt P5: katalog produktów w API" -m "Review: OK"
   ```
   Przy poprawkach po review zamiast `Review: OK` wpiszcie, co zostało poprawione, np. `Review: exact: true w nazwie produktu, dopisana asercja statusu 404`.

> **Jeśli utknęliście po 15 minutach na jednym teście**
> Najpierw przejdźcie scenariusz ręcznie w przeglądarce albo w `/api/docs` i zapiszcie, co dokładnie widać na ekranie lub w odpowiedzi. Potem uruchomcie test z `--ui` albo z `--trace on` i porównajcie krok, na którym test staje, z tym, co widzieliście ręcznie. Prośba do Claude o poprawkę zawiera przyczynę, którą sami ustaliliście.

4. **Powtarzajcie kroki 2 i 3 dla kolejnych scenariuszy.** Po każdym teście zmiana ról: kto pisał, robi teraz review. Po czwartym teście z P1–P12 przechodzicie do P13–P16 albo do polowania (karta 13), jeśli trwa.

5. **Sprawdźcie cały pakiet.** Przed review krzyżowym i jeszcze raz przed prezentacją:
   ```powershell
   npx playwright test tests/projekt --repeat-each=3 --workers=1
   ```
   Oczekiwany wynik: żadnego `failed`. `--workers=1` uruchamia testy jeden po drugim. Dwie kopie tego samego testu nie zmieniają wtedy naraz jednego koszyka. Jeśli test przechodzi tylko za pierwszym razem, zostawia dane, które psują drugi przebieg.

6. **Przygotujcie 5 minut na spotkanie „wydajemy czy nie”.** Szablon jest na końcu `docs/projekt.md`: co pokrywa pakiet, co znaleźliście, rekomendacja. Pokazujecie jeden test zielony i ten sam test celowo czerwony.

> **Pracujecie na wspólnym serwerze, nie na swoim komputerze**
> Przed uruchomieniem ustawcie w oknie testów konto pary i adres serwera: `$env:APP_USER="tester05"`, `$env:APP_PASSWORD="czarny-piatek-2026"`, `$env:BASE_URL="https://namssor-376292984721.europe-central2.run.app"`. Zamiast `tester05` wpiszcie swój numer. Testy z kontem `admin` uruchamiajcie lokalnie: na serwerze hasło tego konta zna tylko trener. Kolizje z danymi innych par są tam normalne: test, który tworzy własne dane i po sobie sprząta, ich nie odczuje.

## Przykład wyniku

```
PS C:\e2e\e2e-podstawy-demo> git log --oneline -4
4e1d2c3 (HEAD -> main) Projekt P13: zmiana wymagań Bożeny z 13:00
9f8e7d6 Projekt P9: cena promocyjna w trzech miejscach
5c4b3a2 Projekt P5: katalog produktów w API
1a2b3c4 Projekt: wybrane scenariusze
PS C:\e2e\e2e-podstawy-demo> git log -1 --format=%b 9f8e7d6
Review: dopisana asercja ceny w koszyku, sprzątanie koszyka na końcu testu
```

## Kryterium „gotowe”

- [ ] W `tests/projekt/` są testy co najmniej 4 scenariuszy z P1–P12, w tym 1 API i 1 z kontem `admin`.
- [ ] `npx playwright test tests/projekt --repeat-each=3 --workers=1` kończy się bez `failed`.
- [ ] Przy każdym teście w `git log` jest linia `Review: …`.
- [ ] Dla każdego testu para pokazała, że pada po zmianie oczekiwanej wartości.
- [ ] Spełnione kryteria oceny z tabeli „Kryteria oceny pary” w `docs/projekt.md`.

## Dla szybszych

> **Skończyliście wcześniej**
> Weźcie scenariusz, którego nikt w parze nie chciał, albo dopiszcie do jednego testu API wszystkie ścieżki negatywne z `/api/docs` (400, 401, 403, 404, 409) dla jednego endpointu. Potem polowanie na błędy (karta 13): tam liczy się każdy test, który odróżni wersję `rc` od zwykłej. Dłuższe zadania (Page Object, fixtures, zamówienie firmowe przygotowane przez API): gałąź `extra/d3-page-object-fixtures`.

## Artefakt do zabrania

Repo (na laptopie albo na forku) z folderem `tests/projekt/`: pakiet regresji z historią review w `git log`, gotowy do pokazania zespołowi, i wasza rekomendacja „wydajemy czy nie” z uzasadnieniem testami.

## Rozwiązanie wzorcowe

Gałąź `solution/12` z przykładowymi testami czterech scenariuszy (P5, P9, P10, P11), do porównania po projekcie:
```powershell
git fetch origin
git diff main origin/solution/12 -- tests/projekt
```
