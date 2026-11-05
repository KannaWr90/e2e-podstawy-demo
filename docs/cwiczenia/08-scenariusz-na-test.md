# Ćwiczenie 08. Z przypadku testowego do testu: plan, review planu, test

Blok 2.4 · 40 min · w parach, zmiana ról co blok

## Cel

Umiesz dać Claude przypadek testowy jako wejście, sprawdzić jego plan testu przed napisaniem kodu i dostać test, który pokrywa każdy oczekiwany wynik z przypadku.

## Materiał wejściowy

- `docs/scenariusze/zmiana-adresu.md`: przypadek testowy TC-ADR-01 (zmiana adresu dostawy) i negatywny TC-ADR-02 (błędny kod pocztowy), z krokami, danymi i oczekiwanym wynikiem.
- `docs/scenariusze/zmiana-adresu.feature`: ten sam scenariusz w Gherkinie (słowa kluczowe po polsku).
- `.mcp.json`: konfiguracja Playwright MCP. Dzięki niej Claude może sam otworzyć aplikację w przeglądarce i przejść scenariusz.

## Kroki

PowerShell, z katalogu głównego repo.

1. **Przeczytaj przypadek testowy.** Otwórz oba pliki z `docs/scenariusze/`. Zaznacz ołówkiem albo w notatce każdy oczekiwany wynik. Policz je: to twoja lista do review planu.

2. **Sprawdź, że Playwright MCP działa.** W drugim oknie uruchom aplikację (`npm start`). W pierwszym:
   ```powershell
   claude mcp list
   ```
   Oczekiwany wynik: wiersz `playwright` ze statusem `✔ Connected`. Status `⏸ Pending approval` znaczy, że trzeba raz uruchomić `claude` w tym folderze i zgodzić się na serwery z `.mcp.json`.

> **Serwer MCP nie startuje na Windows (`✘ Failed to connect`)**
> W `.mcp.json` zamień `"command": "npx"` na `"command": "cmd"` i dodaj `"/c", "npx"` na początku listy `args`. Sprawdź jeszcze raz `claude mcp list`. Jeśli nadal nie działa (proxy, blokada pobierania), rób kroki 3–5 bez MCP: Claude napisze test z samego przypadku testowego i kodu aplikacji.

3. **Poproś Claude o plan, bez kodu.** Uruchom `claude`. Wskaż oba pliki z `docs/scenariusze/` i poproś o plan testów w punktach: nazwy testów, kroki, asercje, dane i sprzątanie. Poproś, żeby przed planem przeszedł scenariusz w przeglądarce przez Playwright MCP i zapisał, jakie etykiety i komunikaty naprawdę widzi.

4. **Zrób review planu.** Zestaw plan z listą oczekiwanych wyników z kroku 1 i z pytaniami z `docs/lista-kontrolna-review.md`. Dla każdego oczekiwanego wyniku wskaż punkt planu, który go sprawdza. Szczególnie: czy plan przywraca adres startowy po teście, czy sprawdza, że błędny adres się nie zapisał, czy używa konta `user`. Odpisz Claude listą poprawek.

> **Jeśli utknąłeś po 10 minutach**
> Wklej do Claude ten prompt:
> „Przeczytaj docs/scenariusze/zmiana-adresu.md i docs/scenariusze/zmiana-adresu.feature oraz CLAUDE.md. Najpierw przez Playwright MCP zaloguj się w http://localhost:4100 jako user / user123, otwórz „Adres dostawy” i przejdź scenariusz poprawnej zmiany adresu oraz przypadek z kodem pocztowym 31001. Zapisz dokładne etykiety pól i treść komunikatów. Potem przedstaw plan testów w punktach: osobny test dla poprawnej zmiany adresu i po jednym teście na każdy wiersz tabeli Przykłady. Dla każdego testu podaj kroki, asercje z dokładnym tekstem i sposób przywrócenia adresu startowego (ul. Przykładowa 12/3, 00-001, Warszawa, 500 100 200). Nie pisz jeszcze kodu, poczekaj na moją akceptację planu.”

5. **Zatwierdź plan i uruchom test.** Poproś Claude o test w pliku `tests/cwiczenia/08-zmiana-adresu.spec.ts` według zaakceptowanego planu. Uruchom go dwa razy pod rząd:
   ```powershell
   npx playwright test tests/cwiczenia/08-zmiana-adresu.spec.ts
   ```
   Oczekiwany wynik za każdym razem: wszystkie testy zielone, np. `4 passed` (jeden test zmiany adresu i trzy z tabeli Przykłady).

## Przykład wyniku

Fragment planu po review (komentarze pary dopisane ręcznie):
```
Test 1: poprawna zmiana adresu zapisuje nowy adres
  - zaloguj jako user, otwórz /konto/adres
  - wpisz ul. Lipowa 7 / 31-001 / Kraków / 600 200 300, kliknij „Zapisz adres”
  - asercja: komunikat „Zapisano adres dostawy.”
  - asercja: po przeładowaniu strony pole Miasto ma wartość „Kraków”
  - po teście: wpisz adres startowy i zapisz
  [review: OK, pokrywa kroki 4 i 5 z TC-ADR-01]
Test 2: kod pocztowy 31001 blokuje zapis
  - asercja: komunikat „Popraw błędy w formularzu (1).”
  [review: brak sprawdzenia, że adres się nie zapisał (krok 4 z TC-ADR-02). Dopisać]
```

## Kryterium „gotowe”

- [ ] Każdy oczekiwany wynik z kroku 1 ma w teście asercję. Pokazujesz drugiej osobie pary, która linia sprawdza który wynik.
- [ ] Plik testu uruchomiony dwa razy pod rząd daje za każdym razem same zielone testy.
- [ ] Po teście adres konta `user` jest znowu startowy: na http://localhost:4100/konto/adres pole Miasto ma „Warszawa”.
- [ ] Masz zapisaną co najmniej jedną poprawkę, którą wniosłeś do planu Claude.

## Dla szybszych

> **Skończyłeś wcześniej**
> Napisz przypadek testowy w tym samym formacie dla innego ekranu, np. wyszukiwarki produktów, i daj go drugiej parze jako wejście do kroków 3–5. Zapisz, co w twoim opisie było niejasne dla Claude. Dłuższe zadania: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Format przypadku testowego z `docs/scenariusze/zmiana-adresu.md`, przejrzany plan i test `tests/cwiczenia/08-zmiana-adresu.spec.ts`.

## Rozwiązanie wzorcowe

Gałąź `solution/08`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/08 -- tests/cwiczenia/08-zmiana-adresu.spec.ts docs/odpowiedzi/08.md
```
