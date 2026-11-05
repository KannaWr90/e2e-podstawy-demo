# Ćwiczenie 03. Trzy gotowe testy opisane słowami: co sprawdzają, a czego nie

Blok 1.3 · 45 min · w parach, zmiana ról co blok

## Cel

Przeczytasz test Playwright bez uruchamiania go i powiesz własnymi słowami, co sprawdza, czego nie sprawdza i kiedy zrobi się czerwony. Tak samo będziesz czytać testy pisane przez Claude, zanim je zatwierdzisz.

## Materiał wejściowy

- `tests/czytanie/01-wyszukiwarka.spec.ts`
- `tests/czytanie/02-moje-zamowienia.spec.ts`
- `tests/czytanie/03-produkt-niedostepny.spec.ts`
- Aplikacja: http://localhost:4100 po `npm start` (do sprawdzania, co jest na ekranie).

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
   npx playwright test tests/czytanie
   ```
   Oczekiwany wynik: `5 passed`, także test z kroku 3. Przy każdym wierszu tabeli zapisz, czy zielony wynik potwierdza to, co obiecuje nazwa testu.

## Przykład wyniku

Wiersz dla testu, którego nie ma w tym ćwiczeniu (`tests/przyklady/logowanie.spec.ts`, „błędne hasło pokazuje komunikat”):

| Test | Co robi użytkownik | Co test sprawdza | Czego test nie sprawdza | Kiedy zrobi się czerwony |
|---|---|---|---|---|
| błędne hasło pokazuje komunikat | otwiera logowanie, wpisuje `user` i złe hasło, klika „Zaloguj” | komunikat z rolą `alert` ma dokładnie tekst „Nieprawidłowy login lub hasło”; adres nadal zawiera `logowanie` | że użytkownik nie jest zalogowany (np. brak „Zalogowano jako user”); że pole „Hasło” jest wyczyszczone | ktoś zmieni treść komunikatu; błędne hasło zaloguje albo przeniesie na inną stronę |

## Kryterium „gotowe”

- [ ] Tabela ma 5 wierszy, każda kolumna wypełniona.
- [ ] Dla testu z `03-produkt-niedostepny.spec.ts` wskazujesz palcem brakującą asercję i mówisz, jaką linią kodu byś ją dopisał.
- [ ] Druga osoba z pary wskazuje dowolną linię z `await`, a Ty mówisz, na co ta linia czeka.
- [ ] Umiesz powiedzieć, w której linii drugi test z `02-moje-zamowienia.spec.ts` upewnia się, że lista zamówień już się załadowała.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dopisz w `03-produkt-niedostepny.spec.ts` asercję, której brakuje według Twojej tabeli. Sprawdź, że test nadal przechodzi (`1 passed`). Potem odwróć chwilowo swoją asercję na przeciwną i uruchom test jeszcze raz: oczekiwany wynik `1 failed`. Dopiero wtedy wiesz, że asercja coś sprawdza. Przywróć ją. Dłuższe zadania (typy danych testowych, jeden test dla kilku zestawów danych): gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Tabela pięciu testów w `notatki.md` w Twoim forku: wzór, jak opisywać test przed review.

## Rozwiązanie wzorcowe

Gałąź `solution/03`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/03 -- docs/odpowiedzi/03.md
```
