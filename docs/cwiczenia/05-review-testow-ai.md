# Ćwiczenie 05. Review pięciu testów napisanych przez Claude

Blok 2.1 · 50 min · w parach: jedna osoba czyta kod, druga trzyma listę kontrolną, zmiana ról po każdym teście

## Cel

Umiesz w kilka minut ocenić test napisany przez Claude: wskazać linię, w której test sprawdza mniej, niż obiecuje jego wymaganie, udowodnić to uruchomieniem i zaproponować poprawkę.

## Materiał wejściowy

- `tests/review/01-dodanie-do-koszyka.spec.ts` … `tests/review/05-zmiana-adresu.spec.ts`: pięć testów sklepu Namssor napisanych przez Claude. Każdy ma na górze komentarz „Wymaganie: …”. Wszystkie przechodzą.
- `docs/lista-kontrolna-review.md`: 12 pytań do review testu.

Tabela do wypełnienia (na kartce albo w pliku `docs/moje-review.md`):

| Test | Linia | Co jest nie tak | Pytanie z listy | Poprawka |
|---|---|---|---|---|
| 01 | | | | |
| 02 | | | | |
| 03 | | | | |
| 04 | | | | |
| 05 | | | | |

## Kroki

PowerShell, z katalogu głównego repo.

1. **Uruchom testy do review.**
   ```powershell
   npx playwright test tests/review
   ```
   Oczekiwany wynik: `5 passed`. Zielony wynik niczego tu nie przesądza. Sprawdzasz, czy testy pilnują tego, co obiecują.

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

## Przykład wyniku

Wiersz tabeli dla testu spoza tego ćwiczenia (`tests/przyklady/logowanie.spec.ts`, test „wylogowanie przywraca link „Zaloguj””):

| Test | Linia | Co jest nie tak | Pytanie z listy | Poprawka |
|---|---|---|---|---|
| logowanie | 42 | Sprawdza tylko, że jest link „Zaloguj”. Nie sprawdza, że zniknął napis „Zalogowano jako user” | 2 | dopisać `await expect(page.getByText('Zalogowano jako user')).toHaveCount(0);` |

Dowód z kroku 5 wygląda tak: po zakomentowaniu akcji test nadal kończy się wynikiem `1 passed`.

## Kryterium „gotowe”

- [ ] Tabela ma wpis dla każdego z 5 testów, z numerem linii i numerem pytania z listy.
- [ ] Pokazujesz drugiej osobie eksperyment z kroku 5: zmiana, po której test powinien paść, a wynik to `1 passed`.
- [ ] Poprawiony test przechodzi (`1 passed`), a po zakomentowaniu akcji pada (`1 failed`).
- [ ] Umiesz powiedzieć własnymi słowami, dlaczego `5 passed` z kroku 1 nie znaczyło, że testy są dobre.

## Dla szybszych

> **Skończyłeś wcześniej**
> Poproś Claude o review jednego z testów bez listy kontrolnej („Zrób review tego testu”). Porównaj jego uwagi z twoją tabelą: co znalazł on, a co tylko ty? Dopisz do listy kontrolnej pytanie, którego ci brakowało. Dłuższe zadania (asercje miękkie `expect.soft`, porównania wizualne `toHaveScreenshot`): gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Wypełniona tabela review i `docs/lista-kontrolna-review.md` z twoim pytaniem. Lista przyda się w ćwiczeniu 10 i przy każdym teście w twoim projekcie.

## Rozwiązanie wzorcowe

Gałąź `solution/05`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/05 -- tests/review docs/odpowiedzi/05.md
```
