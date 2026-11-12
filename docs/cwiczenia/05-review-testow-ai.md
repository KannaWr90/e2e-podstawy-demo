# Ćwiczenie 05. Review testów napisanych przez Claude

Blok 2.1 · 80 min (część A 50 min, część B 30 min) · w parach, zmiana ról co blok

## Cel

Umiesz w kilka minut ocenić test napisany przez Claude: wskazać linię, w której test sprawdza mniej, niż obiecuje jego wymaganie, udowodnić to uruchomieniem i zaproponować poprawkę.

## Materiał wejściowy

Wiadomość od Bożeny, wtorek, 8:05:

> Klaudiusz oddał w nocy pięć testów do Czarnego Piątku. Wszystkie zielone, w opisie napisał „Jestem pewien, że to działa”. A rano klientka z testów akceptacyjnych zgłosiła, że cena promocyjna w koszyku się nie zgadza. Czyli coś przeszło. Przejrzyjcie te testy, zanim cokolwiek wydamy. Zamrożenie kodu w środę o 16:00, a ja obiecałam zarządowi, że „mamy automaty”.

- `tests/review/01-dodanie-do-koszyka.spec.ts` … `tests/review/05-zmiana-adresu.spec.ts`: pięć nocnych testów Klaudiusza. Każdy ma na górze komentarz „Wymaganie: …”. Wszystkie przechodzą.
- `docs/lista-kontrolna-review.md`: 15 pytań do review testu.

Tabela do wypełnienia (na kartce albo w pliku `docs/moje-review.md`):

| Test | Linia | Co jest nie tak | Pytanie z listy | Poprawka |
|---|---|---|---|---|
| 01 | | | | |
| 02 | | | | |
| 03 | | | | |
| 04 | | | | |
| 05 | | | | |

## Kroki: część A, nocne testy (50 min)

PowerShell, z katalogu głównego repo.

1. **Uruchom testy do review.**
   ```powershell
   npx playwright test tests/review
   ```
   Oczekiwany wynik: `11 passed`. Pliki 01–05 to część A, pliki 06–10 to część B. Zielony wynik niczego tu nie przesądza. Sprawdzasz, czy testy pilnują tego, co obiecują.

2. **Przeczytaj listę kontrolną.** Otwórz `docs/lista-kontrolna-review.md`. Pytania 2, 3 i 12 przydadzą się przy każdym teście.

3. **Zrób review testu 01 razem.** Osoba z kodem czyta na głos wymaganie z komentarza, zdanie po zdaniu. Osoba z listą pyta: która linia sprawdza to zdanie? Wpisz do tabeli numer linii i problem. Test może mieć więcej niż jeden problem.

> **Jeśli utknąłeś po 10 minutach**
> Weź jedną asercję i zadaj pytanie 3 z listy: czy przeszłaby, gdyby kliknięcie albo zapis się nie udał? Otwórz aplikację (`npm start` w drugim oknie, potem http://localhost:4100) i sprawdź ręcznie, jak strona wygląda przed akcją i po niej.

4. **Zrób review testów 02–05.** Zamieniajcie się rolami po każdym teście. Na każdy test macie około 6 minut.

5. **Udowodnij jedno znalezisko.** Wybierz jeden problem z tabeli i zmień test albo dane tak, żeby test powinien paść: zakomentuj akcję (`Ctrl+/` w VS Code), zmień oczekiwany tekst, uruchom test dwa razy pod rząd. Uruchom go:
   ```powershell
   npx playwright test tests/review/01-dodanie-do-koszyka.spec.ts
   ```
   Jeśli test nadal przechodzi, masz dowód. Cofnij zmianę (`Ctrl+Z`).

6. **Popraw jeden test z Claude.** Uruchom `claude` w repo. Opisz w prośbie wymaganie, linię i problem z tabeli oraz to, co test ma sprawdzać po poprawce. Po zmianie uruchom test: ma przejść. Potem powtórz eksperyment z kroku 5: teraz test ma paść.

## Kroki: część B, druga partia Klaudiusza (30 min)

Wiadomość od Klaudiusza, wtorek, 10:40:

> Wyciągnąłem wnioski z porannego review. Oto pięć nowych testów do Czarnego Piątku: kod rabatowy, faktura na firmę, adresy, produkt niedostępny i cena promocyjna. Każdy przechodzi. Tym razem jestem naprawdę pewien.

Pliki `tests/review/06-kod-rabatowy.spec.ts` … `tests/review/10-cena-promocyjna.spec.ts`: pięć plików, sześć testów (plik 08 ma dwa). Błędy są innego rodzaju niż w części A. Dopisz do tabeli wiersze 06–10.

7. **Uruchom drugą partię.**
   ```powershell
   npx playwright test tests/review/06 tests/review/07 tests/review/08 tests/review/09 tests/review/10
   ```
   Oczekiwany wynik: `6 passed`.

8. **Zrób review testów 06–10.** Ta sama metoda co w części A: wymaganie zdanie po zdaniu, asercja dla każdego zdania. Pytania 11, 13, 14 i 15 z listy są nowe w tej partii. Na każdy test macie około 4 minut.

> **Jeśli utknąłeś po 10 minutach**
> Przy każdej asercji sprawdź trzy rzeczy. Czy tekst z asercji jest na stronie (wyszukaj go w aplikacji)? Czy przed `expect` stoi `await`, a po nim jest asercja Playwright (`toBeVisible`, `toHaveText`)? Czy liczba w asercji jest tą samą liczbą co w wymaganiu?

9. **Udowodnij dwa znaleziska.** Jedno w teście 06, 07, 09 albo 10: zmiana, po której test powinien paść, a przechodzi. Drugie w teście 08: uruchom sam drugi test z pliku:
   ```powershell
   npx playwright test tests/review/08-adresy.spec.ts -g "domyślny"
   ```
   Zapisz wynik i wyjaśnij go drugiej osobie. Ten przebieg trwa około 30 sekund.

## Przykład wyniku

Wiersz tabeli dla testu spoza tego ćwiczenia (`tests/przyklady/logowanie.spec.ts`, test „wylogowanie przywraca link „Zaloguj””):

| Test | Linia | Co jest nie tak | Pytanie z listy | Poprawka |
|---|---|---|---|---|
| logowanie | 42 | Sprawdza tylko, że jest link „Zaloguj”. Nie sprawdza, że zniknął napis „Zalogowano jako user” | 2 | dopisać `await expect(page.getByText('Zalogowano jako user')).toHaveCount(0);` |

Dowód z kroku 5 wygląda tak: po zakomentowaniu akcji test nadal kończy się wynikiem `1 passed`.

## Kryterium „gotowe”

- [ ] Tabela ma wpis dla każdego z testów 01–05 (a po części B także 06–10), z numerem linii i numerem pytania z listy.
- [ ] Pokazujesz drugiej osobie eksperyment z kroku 5: zmiana, po której test powinien paść, a wynik to `1 passed`.
- [ ] Poprawiony test przechodzi (`1 passed`), a po zakomentowaniu akcji pada (`1 failed`).
- [ ] Umiesz powiedzieć własnymi słowami, dlaczego `11 passed` z kroku 1 nie znaczyło, że testy są dobre.
- [ ] Po części B: umiesz wyjaśnić, dlaczego drugi test z pliku 08 uruchomiony sam pada, choć cały plik przechodzi.

## Dla szybszych

> **Skończyłeś wcześniej**
> Poproś Claude o review jednego z testów bez listy kontrolnej („Zrób review tego testu”). Porównaj jego uwagi z twoją tabelą: co znalazł on, a co tylko ty? Dopisz do listy kontrolnej pytanie, którego ci brakowało. Potem popraw test 08 tak, żeby każdy z jego dwóch testów przechodził sam, także uruchomiony dwa razy pod rząd z `--repeat-each=2`. Trzecia partia testów Klaudiusza, z błędami trudniejszymi do zauważenia: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Wypełniona tabela review i `docs/lista-kontrolna-review.md` z twoim pytaniem. Lista przyda się w ćwiczeniu 10 i przy każdym teście w twoim projekcie.

## Rozwiązanie wzorcowe

Gałąź `solution/05`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/05 -- tests/review docs/odpowiedzi/05.md
```
