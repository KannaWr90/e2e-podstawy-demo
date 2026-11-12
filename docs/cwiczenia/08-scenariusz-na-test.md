# Ćwiczenie 08. Z przypadku testowego do testu: plan, review planu, test

Blok 2.4 · 70 min (część A 40 min, część B 30 min) · w parach, zmiana ról co blok

## Cel

Umiesz dać Claude przypadek testowy jako wejście, sprawdzić jego plan testu przed napisaniem kodu i dostać test, który pokrywa każdy oczekiwany wynik z przypadku. W części B zamieniasz ten sam przypadek zapisany w dwóch formatach (kroki z Azure Test Plans i Gherkin) na jeden test, który kończy się pobraniem pliku.

## Materiał wejściowy

Wiadomość od Bożeny:

> Klienci przed Czarnym Piątkiem masowo zmieniają adresy dostawy. Przypadek testowy jest od dawna w repo, a Klaudiusz dopisał wersję w Gherkinie. Ręcznie przechodzimy go co wydanie. Niech wreszcie przechodzi się sam.

- `docs/scenariusze/zmiana-adresu.md`: przypadek testowy TC-ADR-01 (zmiana adresu dostawy) i negatywny TC-ADR-02 (błędny kod pocztowy), z krokami, danymi i oczekiwanym wynikiem.
- `docs/scenariusze/zmiana-adresu.feature`: ten sam scenariusz w Gherkinie (słowa kluczowe po polsku).
- `.mcp.json`: konfiguracja Playwright MCP. Dzięki niej Claude może sam otworzyć aplikację w przeglądarce i przejść scenariusz.

> **Słowniczek**
> - Playwright MCP: dodatek do Claude Code, przez który Claude sam klika w przeglądarce i czyta, co jest na stronie.
> - `test.describe.configure({ mode: 'serial' })`: testy z tej grupy biegną po kolei, jeden po drugim, a nie równolegle.
> - `toHaveValue('00-001')`: asercja, że pole formularza zawiera dokładnie tę wartość.
> - `afterEach`: kroki wykonywane po każdym teście, także po nieudanym. Tu przywracają adres startowy.
> - `page.waitForEvent('download')`: czekanie na pobranie pliku. Zapisujesz je w zmiennej przed kliknięciem, które pobiera plik.

## Kroki: część A, zmiana adresu (40 min)

PowerShell, z katalogu głównego repo.

1. **Przeczytaj przypadek testowy.** Otwórz oba pliki `zmiana-adresu` z `docs/scenariusze/`. Zaznacz ołówkiem albo w notatce każdy oczekiwany wynik. Policz je: to twoja lista do review planu.

2. **Sprawdź, że Playwright MCP działa.** W drugim oknie uruchom aplikację (`npm start`). W pierwszym:
   ```powershell
   claude mcp list
   ```
   Oczekiwany wynik przy pierwszym uruchomieniu: wiersz `playwright` ze statusem `⏸ Pending approval (run claude to approve)`. Uruchom wtedy `claude` w tym folderze, zgódź się na serwery z `.mcp.json`, zamknij Claude (`/exit`) i powtórz `claude mcp list`. Oczekiwany wynik: wiersz `playwright` ze statusem `✔ Connected`.

> **Serwer MCP nie startuje na Windows (`✘ Failed to connect`)**
> Zawołaj trenera. Plan B, którego nie opisuje dokumentacja i który trener najpierw sprawdzi: w `.mcp.json` zamień `"command": "npx"` na `"command": "cmd"` i dodaj `"/c", "npx"` na początku listy `args`. Sprawdź jeszcze raz `claude mcp list`. Jeśli nadal nie działa (proxy, blokada pobierania), rób kroki 3–5 bez MCP: Claude napisze test z samego przypadku testowego i kodu aplikacji.

3. **Poproś Claude o plan, bez kodu.** Uruchom `claude`. Wskaż oba pliki `zmiana-adresu` i poproś o plan testów w punktach: nazwy testów, kroki, asercje, dane i sprzątanie. Poproś, żeby przed planem przeszedł scenariusz w przeglądarce przez Playwright MCP i zapisał, jakie etykiety i komunikaty naprawdę widzi.

4. **Zrób review planu.** Zestaw plan z listą oczekiwanych wyników z kroku 1 i z pytaniami z `docs/lista-kontrolna-review.md`. Dla każdego oczekiwanego wyniku wskaż punkt planu, który go sprawdza. Szczególnie: czy plan przywraca adres startowy po teście, czy sprawdza, że błędny adres się nie zapisał, czy używa konta `user`. Odpisz Claude listą poprawek.

> **Jeśli utknąłeś po 10 minutach**
> Wklej do Claude ten prompt:
> „Przeczytaj docs/scenariusze/zmiana-adresu.md i docs/scenariusze/zmiana-adresu.feature oraz CLAUDE.md. Najpierw przez Playwright MCP zaloguj się w http://localhost:4100 jako user / user123, otwórz „Adres dostawy” i przejdź scenariusz poprawnej zmiany adresu oraz przypadek z kodem pocztowym 31001. Zapisz dokładne etykiety pól i treść komunikatów. Potem przedstaw plan testów w punktach: osobny test dla poprawnej zmiany adresu i po jednym teście na każdy wiersz tabeli Przykłady. Dla każdego testu podaj kroki, asercje z dokładnym tekstem i sposób przywrócenia adresu startowego (ul. Przykładowa 12/3, 00-001, Warszawa, 500 100 200). Wszystkie testy używają jednego konta user i jednego adresu, więc grupa testów ma zaczynać się od test.describe.configure({ mode: 'serial' }). Nie pisz jeszcze kodu, poczekaj na moją akceptację planu.”

5. **Zatwierdź plan i uruchom test.** Poproś Claude o test w pliku `tests/cwiczenia/08-zmiana-adresu.spec.ts` według zaakceptowanego planu, z linią `test.describe.configure({ mode: 'serial' });` na początku grupy testów. Wszystkie testy z pliku używają jednego konta `user` i jednego adresu, więc uruchomione równolegle nadpisywałyby sobie adres. Uruchom plik dwa razy pod rząd:
   ```powershell
   npx playwright test tests/cwiczenia/08-zmiana-adresu.spec.ts
   ```
   Oczekiwany wynik za każdym razem: wszystkie testy zielone, np. `4 passed` (jeden test zmiany adresu i trzy z tabeli Przykłady).

## Kroki: część B, Biuro Mikołaja (30 min)

Wiadomość od Bożeny, 13:30:

> Dzwonił klient firmowy, Biuro Mikołaja. W zeszłym tygodniu zamówili 1000 kalendarzy adwentowych na fakturę (ZAM-1007) i chcą domówić. Ich księgowa, pani elfka, ma jedną prośbę: na fakturze ma być NIP Biura, a nie nasz. Przypadek testowy wpisałam do Azure Test Plans, Klaudiusz przepisał go na Gherkina „dla porządku”. Próbujcie na 10 kalendarzach. ZAM-1007 nie ruszać, to prawdziwe pieniądze (fikcyjne).

- `docs/scenariusze/biuro-mikolaja.md`: przypadek TC-FV-01 w formacie Azure Test Plans: 10 kroków w kolumnach „Akcja” i „Oczekiwany wynik”, dane jako parametry `@nazwa`.
- `docs/scenariusze/biuro-mikolaja.feature`: ten sam przypadek w Gherkinie.
- `tests/cwiczenia/08-biuro-mikolaja.spec.ts`: szkielet z `test.fixme`. Krok 1 (logowanie i pusty koszyk) jest gotowy, kroki 2–10 jako TODO.

6. **Zestaw oba formaty.** Przy każdym kroku z `biuro-mikolaja.md` wskaż linię `.feature`, która go opisuje. Zapisz, czego brakuje w Gherkinie, a czego w krokach Azure Test Plans. Oczekiwany wynik: co najmniej jedna różnica w każdą stronę.

7. **Napisz test z Claude albo sam.** Wejściem jest przypadek testowy, nie Gherkin: każdy wiersz „Oczekiwany wynik” to co najmniej jedna asercja. Pobieranie faktury: najpierw `page.waitForEvent('download')` zapisane w zmiennej, potem kliknięcie „Pobierz fakturę”, na końcu `await` tej zmiennej. Zamień `test.fixme` na `test` i uruchom:
   ```powershell
   npx playwright test tests/cwiczenia/08-biuro-mikolaja.spec.ts
   ```
   Oczekiwany wynik: `1 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Uruchom test z `--ui` i sprawdź, który krok pada. Numer zamówienia znajdziesz w adresie strony po złożeniu zamówienia (`?zlozono=ZAM-…`). Gdy nie wiesz, co jest w fakturze, otwórz pobrany plik w przeglądarce: to zwykła strona HTML.

8. **Sprawdź, że test potrafi paść i nie rusza ZAM-1007.** Zmień w asercji NIP nabywcy na `1234563218` i uruchom test. Oczekiwany wynik: `1 failed`. Cofnij zmianę. Uruchom test drugi raz pod rząd: znowu `1 passed`, bo każdy przebieg zakłada nowe zamówienie. Na http://localhost:4100/zamowienia/ZAM-1007 (konto `biuro`) status to nadal „Opłacone”.

9. **Zapisz pracę w git.**
   ```powershell
   git add .
   git commit -m "Ćwiczenie 08: zmiana adresu i Biuro Mikołaja z przypadków testowych"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 08: zmiana adresu i Biuro Mikołaja z przypadków testowych` (skrót będzie inny), a `git status` pokazuje potem `nothing to commit, working tree clean`. Masz fork (ścieżka A z ćwiczenia 01): dopisz `git push`.

## Przykład wyniku

Fragment planu po review z części A (komentarze pary dopisane ręcznie):
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

Zestawienie z kroku 6 dla przypadku spoza ćwiczenia:

| Krok w Azure Test Plans | Linia w Gherkinie | Różnica |
|---|---|---|
| 3. Kliknij „Zapisz adres” → komunikat „Zapisano adres dostawy.” | `Oraz kliknę "Zapisz adres"`, `Wtedy zobaczę komunikat "Zapisano adres dostawy."` | brak |
| 4. Odśwież stronę → pola z nowym adresem | brak | Gherkin nie mówi o odświeżeniu |

## Kryterium „gotowe”

- [ ] Każdy oczekiwany wynik z kroku 1 ma w teście asercję. Pokazujesz drugiej osobie pary, która linia sprawdza który wynik.
- [ ] Plik `08-zmiana-adresu.spec.ts` uruchomiony dwa razy pod rząd daje za każdym razem same zielone testy, a po teście adres konta `user` jest znowu startowy (pole Miasto: „Warszawa”).
- [ ] Masz zapisaną co najmniej jedną poprawkę, którą wniosłeś do planu Claude.
- [ ] Po części B: `08-biuro-mikolaja.spec.ts` dwa razy pod rząd daje `1 passed`, po zmianie NIP-u w asercji `1 failed`. Pokazujesz asercję na NIP nabywcy, ilość i sumę z pobranej faktury.

## Dla szybszych

> **Skończyłeś wcześniej**
> Bożena dopisała: „Biuro pyta, czy kod CZARNY20 działa przy zamówieniu na firmę”. Dopisz drugi test: te same kroki, ale przed złożeniem zamówienia kod `CZARNY20` w koszyku. Policz sam, jaka będzie cena kalendarza i suma na fakturze, zanim uruchomisz test, i porównaj z wynikiem. Kod jest ważny do 30.11.2026. Potem napisz przypadek testowy w formacie z `docs/scenariusze/` dla innego ekranu, np. wyszukiwarki produktów, i daj go drugiej parze jako wejście do kroków 3–5. Dłuższe zadania: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

Format przypadku testowego z `docs/scenariusze/`, przejrzany plan, testy `tests/cwiczenia/08-zmiana-adresu.spec.ts` i `08-biuro-mikolaja.spec.ts`. Z części B wzorzec pobierania pliku: `waitForEvent('download')` przed kliknięciem i asercje na treści pliku.

## Rozwiązanie wzorcowe

Gałąź `solution/08`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/08 -- tests/cwiczenia docs/odpowiedzi/08.md
```
