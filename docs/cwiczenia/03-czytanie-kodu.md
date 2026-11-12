# Ćwiczenie 03. Testy po poprzedniku i od Klaudiusza opisane słowami: co sprawdzają, a czego nie

Blok 1.3 · 45 min + 20 min runda 2 (03b) · w parach, zmiana ról co blok

## Cel

Przeczytasz test Playwright bez uruchamiania go i powiesz własnymi słowami, co sprawdza, czego nie sprawdza i kiedy zrobi się czerwony. Tak samo będziesz czytać testy pisane przez Claude, zanim je zatwierdzisz.

## Materiał wejściowy

> **Od Mirka:** Twój poprzednik odszedł i zostawił w `tests/czytanie/` trzy pliki bez słowa komentarza. Wszystkie są zielone, ale nikt w zespole nie wie, co właściwie sprawdzają. Zanim cokolwiek w nich zmienimy, opisz je po ludzku.

- `tests/czytanie/01-wyszukiwarka.spec.ts`
- `tests/czytanie/02-moje-zamowienia.spec.ts`
- `tests/czytanie/03-produkt-niedostepny.spec.ts`
- Aplikacja: http://localhost:4100 po `npm start` (do sprawdzania, co jest na ekranie).

> **Słowniczek**
> - `const nazwa = …`: stała, czyli nazwa nadana wartości albo lokatorowi, żeby użyć jej dalej w teście.
> - `await`: czekaj, aż ta linia się skończy (strona się załaduje, kliknięcie się wykona, oczekiwanie się spełni), dopiero potem idź dalej.
> - `test.beforeEach`: kroki wykonywane przed każdym testem w pliku albo w grupie.
> - `for (const produkt of produkty)`: pętla, która powtarza blok kodu dla każdego elementu listy.
> - `` `${produkt.nazwa} ma cenę…` ``: tekst w odwrotnych apostrofach. W miejsce `${…}` wstawia się wartość, np. nazwa produktu.

Tabela do wypełnienia w `notatki.md` (skopiuj nagłówek):

```markdown
| Test | Co robi użytkownik | Co test sprawdza | Czego test nie sprawdza | Kiedy zrobi się czerwony |
|---|---|---|---|---|
```

## Kroki

1. **Przeczytaj `01-wyszukiwarka.spec.ts` i wypełnij dwa wiersze tabeli.** Nie uruchamiaj jeszcze testów. Przy okazji zapisz odpowiedzi:
   - Co robi blok `test.beforeEach` i ile razy wykona się przy uruchomieniu tego pliku?
   - Co jest w stałej `wyszukiwarka`: pole na stronie czy tekst wpisany w pole? Najedź na nią kursorem w VS Code i przeczytaj typ w podpowiedzi.
   - Dlaczego przy nazwach produktów jest `exact: true`? Podpowiedź: w tym samym wierszu tabeli jest przycisk, którego nazwa zawiera nazwę produktu.

2. **Przeczytaj `02-moje-zamowienia.spec.ts` i wypełnij dwa wiersze.** Odpowiedz:
   - Pod jaką nazwą zobaczysz każdy z tych testów w raporcie? Co zmienia `test.describe`?
   - Test otwiera `/zamowienia`, a zaraz potem wypełnia pole „Login”. Skąd na tej stronie pole „Login”? Sprawdź w aplikacji bez logowania.
   - W drugim teście co by się stało, gdyby usunąć linię z `ZAM-1001`? Strona ładuje listę zamówień 0,5–2 s.

3. **Przeczytaj `03-produkt-niedostepny.spec.ts` i wypełnij jeden wiersz.** Porównaj nazwę testu z jego asercjami (linie z `expect`). W kolumnie „Czego test nie sprawdza” wpisz to, co obiecuje nazwa, a czego nie sprawdza żadna asercja.

4. **Znajdź każde `await` w trzech plikach.** Policz je i odpowiedz w parze: na co czeka każda linia z `await`? Która z nich czeka na przeglądarkę, a która na spełnienie oczekiwania?

5. **Uruchom testy i porównaj z tabelą.**
   ```powershell
   npx playwright test tests/czytanie/01 tests/czytanie/02 tests/czytanie/03
   ```
   Oczekiwany wynik: `5 passed`, także test z kroku 3. Przy każdym wierszu tabeli zapisz, czy zielony wynik potwierdza to, co obiecuje nazwa testu.

## Runda 2 (03b): trzy testy od Klaudiusza · 20 min

> **Od Klaudiusza, nowego kolegi z zespołu:** W nocy dopisałem trzy testy do `tests/czytanie/`. Zajęło mi to 30 sekund. Jest pętla, funkcja pomocnicza i zagnieżdżone grupy, wszystko zielone. Jestem pewien, że sprawdzają wszystko, co trzeba.

- `tests/czytanie/04-ceny-promocyjne.spec.ts`: pętla po tablicy produktów w promocji.
- `tests/czytanie/05-karta-produktu.spec.ts`: funkcja pomocnicza `otworzKarteProduktu`.
- `tests/czytanie/06-filtr-kategorii.spec.ts`: `test.describe` w pętli po kategoriach, dwa `beforeEach`.

Druga tabela w `notatki.md`:

```markdown
| Test | Co sprawdza | Czego nie sprawdza |
|---|---|---|
| 04-ceny-promocyjne (jeden wiersz na cały plik) | | |
| 05 › karta produktu pokazuje opis i dostępność | | |
| 05 › cena na karcie produktu jest taka sama jak na kafelku | | |
| 05 › produktu niedostępnego nie da się dodać do koszyka z karty produktu | | |
| 06-filtr-kategorii (jeden wiersz na cały plik) | | |
```

6. **Przeczytaj trzy pliki i wypełnij drugą tabelę.** Nie uruchamiaj testów. Zapisz odpowiedzi:
   - `04`: ile testów powstanie z tego pliku i jakie będą miały nazwy? Nazwa obiecuje cenę „obniżoną o 20%”: która linia to sprawdza?
   - `05`: co robi funkcja `otworzKarteProduktu`, zanim test dojdzie do swoich linii z `expect`? Ile asercji ma drugi test razem z tymi w funkcji? Co o funkcjach pomocniczych mówi `CLAUDE.md` w repo?
   - `06`: ile testów powstanie i jak brzmi pełna nazwa jednego z nich w raporcie? W jakiej kolejności wykonają się oba `beforeEach` przed testem „licznik…” dla kategorii Dom?

7. **Sprawdź liczby i nazwy bez uruchamiania testów.**
   ```powershell
   npx playwright test tests/czytanie/04 tests/czytanie/05 tests/czytanie/06 --list
   ```
   Oczekiwany wynik na końcu: `Total: 12 tests in 3 files`. Porównaj nazwy z listy ze swoimi odpowiedziami z kroku 6. Potem uruchom te same pliki bez `--list`: oczekiwany wynik `12 passed`.

8. **Napisz jedno zdanie do Klaudiusza.** Wybierz najpoważniejszą lukę z drugiej tabeli i zapisz w `notatki.md` komentarz, jaki zostawiłbyś w review: który test, czego nie sprawdza, jaka asercja by to naprawiła.

9. **Zapisz pracę w git.**
   ```powershell
   git add .
   git commit -m "Ćwiczenie 03: opisy testów w notatkach"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 03: opisy testów w notatkach` (skrót będzie inny), a `git status` pokazuje potem `nothing to commit, working tree clean`. Masz fork (ścieżka A z ćwiczenia 01): dopisz `git push`.

## Przykład wyniku

Wiersz dla testu, którego nie ma w tym ćwiczeniu (`tests/przyklady/logowanie.spec.ts`, „błędne hasło pokazuje komunikat”):

| Test | Co robi użytkownik | Co test sprawdza | Czego test nie sprawdza | Kiedy zrobi się czerwony |
|---|---|---|---|---|
| błędne hasło pokazuje komunikat | otwiera logowanie, wpisuje `user` i złe hasło, klika „Zaloguj” | komunikat z rolą `alert` ma dokładnie tekst „Nieprawidłowy login lub hasło”; adres nadal zawiera `logowanie` | że użytkownik nie jest zalogowany (np. brak „Zalogowano jako user”); że pole „Hasło” jest wyczyszczone | ktoś zmieni treść komunikatu; błędne hasło zaloguje albo przeniesie na inną stronę |

## Kryterium „gotowe”

- [ ] Pierwsza tabela ma 5 wierszy, druga 5 wierszy, każda kolumna wypełniona.
- [ ] Dla testu z `03-produkt-niedostepny.spec.ts` wskazujesz palcem brakującą asercję i mówisz, jaką linią kodu byś ją dopisał.
- [ ] Druga osoba z pary wskazuje dowolną linię z `await`, a ty mówisz, na co ta linia czeka.
- [ ] Twoja liczba testów z kroku 6 zgadza się z `Total: 12 tests in 3 files` z kroku 7, a w drugim teście z `05` pokazujesz palcem asercję, która siedzi w funkcji pomocniczej.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dopisz w `03-produkt-niedostepny.spec.ts` asercję, której brakuje według twojej tabeli. Sprawdź, że test nadal przechodzi (`1 passed`). Potem odwróć chwilowo swoją asercję na przeciwną i uruchom test jeszcze raz: oczekiwany wynik `1 failed`. Dopiero wtedy wiesz, że asercja coś sprawdza. Przywróć ją. To samo zrób dla testu z `05`, który obiecuje „taka sama jak na kafelku”: dopisz asercję, która porównuje cenę z kafelkiem, i sprawdź, że pada, gdy w niej zmienisz cenę. Dłuższe zadania (typy danych testowych, jeden test dla kilku zestawów danych): gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Dwie tabele w `notatki.md` w twoim repo: wzór, jak opisywać test przed review, także test z pętlą i funkcją pomocniczą.

## Rozwiązanie wzorcowe

Gałąź `solution/03`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/03 -- docs/odpowiedzi/03.md
```
