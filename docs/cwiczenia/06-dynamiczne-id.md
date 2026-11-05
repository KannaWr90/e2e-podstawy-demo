# Ćwiczenie 06. Wiersz tabeli, który zmienia id przy każdym odświeżeniu

Blok 2.2 · 35 min · w parach, zmiana ról co blok

## Cel

Umiesz znaleźć wiersz tabeli po jego treści i kliknąć przycisk w tym wierszu, gdy strona nie daje stałego `id` ani `data-testid`. Umiesz też sprawdzić liczbę wierszy po wyszukiwaniu.

## Materiał wejściowy

- Ekran http://localhost:4100/admin/zamowienia (konto `admin` / `admin123`): tabela zamówień, wyszukiwarka „Szukaj zamówienia”, przycisk „Anuluj” w każdym nowym zamówieniu.
- `tests/cwiczenia/06-admin-zamowienia.spec.ts`: trzy testy z `test.fixme` i listą TODO. Logowanie admina jest już w `beforeEach`.

## Kroki

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

## Przykład wyniku

Przebieg po kroku 5 (kolejność, numery linii i czasy mogą się różnić):
```
  ✓  1 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:16:7 › Panel admina: zamówienia › anulowanie ZAM-1003 zmienia jego status na „Anulowane” (251ms)
  ✓  2 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:29:7 › Panel admina: zamówienia › wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006 (219ms)
  ✓  3 [chromium] › tests/cwiczenia/06-admin-zamowienia.spec.ts:40:7 › Panel admina: zamówienia › wyszukanie nieistniejącego numeru daje pustą tabelę (220ms)

  3 passed (1.1s)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts` po `npm run db:reset` daje `3 passed`.
- [ ] W kodzie nie ma `id`, `#row-`, klas CSS ani `nth-child`. Pokazujesz palcem, gdzie lokator łączy wiersz (`filter({ hasText })`) z przyciskiem w środku.
- [ ] Test anulowania sprawdza stan przed akcją („Nowe”) i po niej („Anulowane”, brak „Anuluj”).
- [ ] Krok 6 zrobiony: test liczenia padł po zmianie oczekiwanej liczby.

## Dla szybszych

> **Skończyłeś wcześniej**
> Napisz trzy zdania do zespołu deweloperów z prośbą o `data-testid` na wierszu tabeli zamówień: co jest dziś trudne w teście, jaki atrybut proponujesz (np. `data-testid="order-ZAM-1003"`) i ile to kosztuje. Pokaż je drugiej osobie z pary. Potem zrób test anulowania na ekranie `/admin/zamowienia/potwierdzenie`, gdzie „Anuluj” otwiera okno z pytaniem. Okno dialogowe, ramki i nowe karty: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

`tests/cwiczenia/06-admin-zamowienia.spec.ts` z trzema działającymi testami i wzorzec „wiersz po treści, przycisk w wierszu” do tabel w twoich aplikacjach.

## Rozwiązanie wzorcowe

Gałąź `solution/06`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/06 -- tests/cwiczenia/06-admin-zamowienia.spec.ts
```
