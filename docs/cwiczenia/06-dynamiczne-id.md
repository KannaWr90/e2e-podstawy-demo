# Ćwiczenie 06. Wiersz tabeli bez stałego id, okno potwierdzenia i ramka płatności

Blok 2.2 · 55 min (część A 35 min, część B 20 min) · w parach, zmiana ról co blok

## Cel

Umiesz znaleźć wiersz tabeli po jego treści i kliknąć przycisk w tym wierszu, gdy strona nie daje stałego `id` ani `data-testid`. Umiesz sprawdzić liczbę wierszy po wyszukiwaniu. W części B obsłużysz okno potwierdzenia `<dialog>` i formularz w ramce `<iframe>`.

## Materiał wejściowy

Wiadomość od Bożeny:

> W Czarny Piątek klienci będą masowo anulować zamówienia, a admin musi to robić szybko. Mirek mówi, że wiersze w tabeli mają losowe id „ze względów bezpieczeństwa” i że testu na to się nie da napisać. Ja mówię, że się da. Udowodnijcie, że mam rację.

- Ekran http://localhost:4100/admin/zamowienia (konto `admin` / `admin123`): tabela zamówień, wyszukiwarka „Szukaj zamówienia”, przycisk „Anuluj” w każdym nowym zamówieniu.
- `tests/cwiczenia/06-admin-zamowienia.spec.ts`: trzy testy z `test.fixme` i listą TODO. Logowanie admina jest już w `beforeEach`.

## Kroki: część A, tabela (35 min)

PowerShell, z katalogu głównego repo.

1. **Zobacz, jak zmienia się id wiersza.** W drugim oknie PowerShell uruchom aplikację:
   ```powershell
   npm start
   ```
   Zaloguj się jako `admin`, otwórz http://localhost:4100/admin/zamowienia. Kliknij prawym przyciskiem wiersz ZAM-1003 i wybierz „Zbadaj” (Inspect). Zanotuj `id` elementu `<tr>`, np. `row-3fa9c21b`. Odśwież stronę (F5) i sprawdź jeszcze raz. Oczekiwany wynik: inne `id`. Przycisk „Anuluj” nie zawiera numeru zamówienia.

2. **Uruchom szkielet.**
   ```powershell
   npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts
   ```
   Oczekiwany wynik: `3 skipped`.

3. **Napisz test anulowania ZAM-1003.** Sam albo z Claude, według TODO w pierwszym teście. Zamień `test.fixme` na `test`. Przycisk „Anuluj” szukaj wewnątrz lokatora wiersza. Uruchom plik jak w kroku 2. Oczekiwany wynik: `1 passed` i `2 skipped`.

> **Jeśli utknąłeś po 10 minutach**
> Lokator może zaczynać się od innego lokatora: `wiersz.getByRole(...)` szuka tylko w środku wiersza. Na ile przycisków „Anuluj” pasuje `page.getByRole('button', { name: 'Anuluj' })`, a na ile ten sam lokator wewnątrz wiersza?

4. **Przywróć dane przed kolejnym uruchomieniem.** Test anulowania zmienia bazę: po pierwszym przebiegu ZAM-1003 jest już anulowane i test padnie na sprawdzeniu statusu „Nowe”. Zatrzymaj aplikację w drugim oknie (`Ctrl+C`), potem:
   ```powershell
   npm run db:reset
   ```
   Oczekiwany wynik zaczyna się od `Baza odtworzona z danymi startowymi`.

5. **Napisz dwa testy wyszukiwania.** Według TODO w drugim i trzecim teście. Uruchom plik. Oczekiwany wynik: `3 passed`.

6. **Sprawdź, że test liczenia potrafi paść.** W teście „Mydło” zmień oczekiwaną liczbę wierszy z 1 na 2 i uruchom tylko ten test:
   ```powershell
   npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts -g "zostawia jedno"
   ```
   Oczekiwany wynik: `1 failed`, w komunikacie `Expected: 2` i `Received: 1`. Cofnij zmianę, zrób `npm run db:reset` (przy zatrzymanej aplikacji) i uruchom cały plik jeszcze raz: `3 passed`.

## Kroki: część B, okno „Czy na pewno?” i ramka płatności (20 min)

Druga wiadomość od Bożeny:

> Mirek dodał przy anulowaniu okienko „Czy na pewno?”, bo ktoś z obsługi anulował zamówienie hurtowe. Płatność kartą jest teraz w ramce od operatora płatności. Klaudiusz napisał, że „ramek i okienek nie da się testować automatycznie”. Pewnym głosem.

- `tests/cwiczenia/06-okno-anulowania.spec.ts`: ekran `/admin/zamowienia/potwierdzenie`, gdzie „Anuluj” otwiera okno z przyciskami „Wróć” i „Tak, anuluj”. Zamówienie do anulowania i sprzątanie przez API są gotowe w `beforeEach` i `afterEach`.
- `tests/cwiczenia/06-platnosc-w-ramce.spec.ts`: ekran `/koszyk/platnosc`, formularz karty w ramce „Bramka płatnicza”. Konto `tester07` / `czarny-piatek-2026`, z koszykiem tylko dla tego pliku. Karty testowe: `4111 1111 1111 1111` (płatność przyjęta), `4000 0000 0000 0002` (odrzucona).

7. **Obsłuż okno potwierdzenia.** Zrób TODO w obu testach `06-okno-anulowania.spec.ts`. Okno znajdziesz przez `page.getByRole('dialog')`. To element strony (`<dialog>`), więc działa na nim każdy lokator i asercja. `page.on('dialog')` z dokumentacji Playwright dotyczy tylko okien przeglądarki (`alert`, `confirm`, `prompt`) i tutaj nic nie zrobi.
   ```powershell
   npx playwright test tests/cwiczenia/06-okno-anulowania.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

8. **Zapłać w ramce.** Przejdź płatność raz ręcznie (konto `tester07`, coś w koszyku, „Zapłać kartą online”). Potem zrób TODO w `06-platnosc-w-ramce.spec.ts`. Do wnętrza ramki wchodzisz przez `page.getByTitle('Bramka płatnicza').contentFrame()`.
   ```powershell
   npx playwright test tests/cwiczenia/06-platnosc-w-ramce.spec.ts
   ```
   Oczekiwany wynik: `2 passed`. Uruchom plik drugi raz: znowu `2 passed`, bo testy sprzątają koszyk i anulują swoje zamówienia.

> **Jeśli utknąłeś po 10 minutach**
> Gdy `getByLabel('Numer karty')` czeka 5 s i pada z `element(s) not found`, szukasz pola na stronie głównej, a ono jest w ramce. Każdy lokator elementu z formularza karty, także komunikat i nagłówek po płatności, musi zaczynać się od zmiennej z `contentFrame()`.

## Przykład wyniku

Przebieg po kroku 5 (kolejność, numery linii i czasy mogą się różnić):
```
  ✓  1 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:16:7 › Panel admina: zamówienia › anulowanie ZAM-1003 zmienia jego status na „Anulowane” (251ms)
  ✓  2 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:29:7 › Panel admina: zamówienia › wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006 (219ms)
  ✓  3 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:40:7 › Panel admina: zamówienia › wyszukanie nieistniejącego numeru daje pustą tabelę (220ms)

  3 passed (1.1s)
```

Lokator w ramce na innym przykładzie (ramka o tytule „Mapa”, której w tej aplikacji nie ma):
```ts
const mapa = page.getByTitle('Mapa').contentFrame();
await mapa.getByRole('button', { name: 'Powiększ' }).click();
await expect(mapa.getByText('Skala 1:500')).toBeVisible();
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts` po `npm run db:reset` daje `3 passed`.
- [ ] W kodzie nie ma `id`, `#row-`, klas CSS ani `nth-child`. Pokazujesz palcem, gdzie lokator łączy wiersz (`filter({ hasText })`) z przyciskiem w środku.
- [ ] Test anulowania sprawdza stan przed akcją („Nowe”) i po niej („Anulowane”, brak „Anuluj”).
- [ ] Krok 6 zrobiony: test liczenia padł po zmianie oczekiwanej liczby.
- [ ] Po części B: `npx playwright test tests/cwiczenia/06-okno-anulowania.spec.ts tests/cwiczenia/06-platnosc-w-ramce.spec.ts` uruchomione dwa razy pod rząd daje za każdym razem `4 passed`.

## Dla szybszych

> **Skończyłeś wcześniej**
> Napisz trzy zdania do zespołu deweloperów z prośbą o `data-testid` na wierszu tabeli zamówień: co jest dziś trudne w teście, jaki atrybut proponujesz (np. `data-testid="order-ZAM-1003"`) i ile to kosztuje. Pokaż je drugiej osobie z pary. Potem dopisz w `06-platnosc-w-ramce.spec.ts` trzeci test: numer karty z 15 cyframi daje w ramce komunikat przy polu „Numer karty musi mieć 16 cyfr”, a koszyk zostaje bez zmian. Nowa karta przeglądarki, pobieranie i wysyłanie plików: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

`tests/cwiczenia/06-admin-zamowienia.spec.ts` z trzema działającymi testami i wzorzec „wiersz po treści, przycisk w wierszu” do tabel w twoich aplikacjach. Z części B dwa wzorce: `getByRole('dialog')` dla okna na stronie i `contentFrame()` dla ramki.

## Rozwiązanie wzorcowe

Gałąź `solution/06`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/06 -- tests/cwiczenia/06-admin-zamowienia.spec.ts tests/cwiczenia/06-okno-anulowania.spec.ts tests/cwiczenia/06-platnosc-w-ramce.spec.ts
```
