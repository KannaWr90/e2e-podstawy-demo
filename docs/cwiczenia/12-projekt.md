# Ćwiczenie 12. Projekt w parach: pakiet testów E2E i API z review każdego testu

Blok 3.2 · 210 min · w parach, zmiana ról po każdym teście

## Cel

Zamienisz w parze pakiet scenariuszy biznesowych na testy E2E i API pisane z Claude Code. Każdy test przejdzie review drugiej osoby z pary, zanim trafi do commita. Na koniec pokażesz jeden test i uzasadnisz wybór locatorów i asercji.

## Materiał wejściowy

- `docs/projekt.md`: 8 scenariuszy (P1–P8) z oczekiwanym wynikiem, dane, kryteria oceny pary.
- `docs/lista-kontrolna-review.md`: lista kontrolna review z ćwiczenia 05.
- `tests/pomocnicze/logowanie.ts` z ćwiczenia 11, jeśli go masz.
- Opis API: http://localhost:4100/api/docs (po `npm start`).

## Kroki

1. **Wybierzcie scenariusze i jedno repo.** Przeczytajcie `docs/projekt.md`. Wybierzcie co najmniej 4 scenariusze, w tym co najmniej 1 API i 1 z kontem `admin`. Wpiszcie numery w linii „Wybrane”. Pracujecie w forku jednej osoby. Druga osoba dostaje dostęp: GitHub › fork › Settings › Collaborators › Add people.
   ```powershell
   git add docs/projekt.md
   git commit -m "Projekt: wybrane scenariusze"
   git push
   ```

2. **Napiszcie pierwszy test z Claude Code.** Osoba A ma klawiaturę. Prompt do Claude zawiera numer scenariusza, plik docelowy (`tests/projekt/pN-….spec.ts`) i oczekiwany wynik przepisany z `docs/projekt.md`. Przed akceptacją zmiany osoba A czyta kod i porównuje każdy punkt „Oczekiwany wynik” z asercjami.
   ```powershell
   npx playwright test tests/projekt/p5-api-katalog.spec.ts
   ```
   Oczekiwany wynik: wszystkie testy z pliku `passed` (tu przykład dla P5).

3. **Zróbcie review i weryfikację.** Klawiaturę bierze osoba B. Przechodzi test z listą kontrolną review i mówi, co poprawić. Potem sprawdza, że test potrafi paść: zmienia oczekiwaną wartość w jednej asercji, uruchamia (oczekiwany wynik `1 failed`), przywraca. Dopiero wtedy commit z wynikiem review w drugiej linii opisu:
   ```powershell
   git add tests/projekt
   git commit -m "Projekt P5: katalog produktów w API" -m "Review: OK"
   git push
   ```
   Przy poprawkach po review zamiast `Review: OK` wpiszcie, co zostało poprawione, np. `Review: exact: true w nazwie produktu, dopisana asercja statusu 404`.

> **Jeśli utknąłeś po 15 minutach na jednym teście**
> Najpierw przejdźcie scenariusz ręcznie w przeglądarce albo w `/api/docs` i zapiszcie, co dokładnie widać na ekranie lub w odpowiedzi. Potem uruchomcie test z `--ui` albo z `--trace on` i porównajcie krok, na którym test staje, z tym, co widzieliście ręcznie. Prośba do Claude o poprawkę zawiera przyczynę, którą sami ustaliliście.

4. **Powtarzajcie kroki 2 i 3 dla kolejnych scenariuszy.** Po każdym teście zmiana ról: kto pisał, robi teraz review.

5. **Sprawdźcie cały pakiet.** Pół godziny przed prezentacjami:
   ```powershell
   npx playwright test tests/projekt --repeat-each=3
   ```
   Oczekiwany wynik: żadnego `failed`. Jeśli test raz przechodzi, a raz nie, uruchomcie go z `--workers=1` i porównajcie. Różnica zwykle oznacza, że dwa testy zmieniają te same dane (np. koszyk konta `user`).

6. **Przygotujcie prezentację jednego testu.** 3 minuty na parę: który scenariusz, dlaczego takie locatory, co sprawdzają asercje, czego test nie sprawdza i dlaczego. Pokazujecie test zielony i test celowo czerwony.

## Przykład wyniku

```
PS C:\e2e\e2e-podstawy-demo> git log --oneline -3
9f8e7d6 (HEAD -> main, origin/main) Projekt P3: administrator dodaje produkt
5c4b3a2 Projekt P5: katalog produktów w API
1a2b3c4 Projekt: wybrane scenariusze
PS C:\e2e\e2e-podstawy-demo> git log -1 --format=%b
Review: dopisana asercja aktywnego przycisku „Dodaj do koszyka”
```

## Kryterium „gotowe”

- [ ] W `tests/projekt/` są testy co najmniej 4 scenariuszy, w tym 1 API i 1 z kontem `admin`.
- [ ] `npx playwright test tests/projekt --repeat-each=3` kończy się bez `failed`.
- [ ] Przy każdym teście w `git log` jest linia `Review: …`.
- [ ] Dla każdego testu para pokazała, że pada po zmianie oczekiwanej wartości.
- [ ] Spełnione kryteria oceny z tabeli na końcu `docs/projekt.md`.

## Dla szybszych

> **Skończyłeś wcześniej**
> Zautomatyzujcie scenariusz, którego nikt w parze nie chciał wziąć, albo dopiszcie do testów API wszystkie ścieżki negatywne z opisu w `/api/docs` (400, 401, 403, 404, 409) dla jednego endpointu. Dłuższe zadania (Page Object dla ekranów projektu, fixture „zalogowany użytkownik”, własny skill pary): gałąź `extra/d3-page-object-fixtures`.

## Artefakt do zabrania

Fork z folderem `tests/projekt/`: pakiet testów z historią review w `git log`, gotowy do pokazania zespołowi.

## Rozwiązanie wzorcowe

Gałąź `solution/12` z przykładowymi testami trzech scenariuszy (P3, P5, P7), do porównania po projekcie:
```powershell
git fetch origin
git diff main origin/solution/12 -- tests/projekt
```
