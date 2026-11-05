# Zadanie dodatkowe D2. Ramka płatności, okno potwierdzenia, nowa karta i pliki

Zadanie dodatkowe · dzień 2 · ok. 70 min · w parach

## Cel

Napiszesz testy dla elementów, na których zwykłe locatory nie wystarczają: formularz w ramce `<iframe>`, okno potwierdzenia `<dialog>`, link otwierający nową kartę, pobieranie i wysyłanie pliku. Użyjesz miękkich asercji, żeby jeden przebieg pokazał wszystkie błędy naraz, i porównasz stronę ze zrzutem wzorcowym.

## Materiał wejściowy

Gałąź `extra/d2-iframe-dialog-pliki`. Nowe pliki są w `tests/extra/d2/`, każdy test ma `test.fixme` i TODO:

| Plik | Ekran | Testy |
|---|---|---|
| `platnosc.spec.ts` | `/koszyk/platnosc`, ramka „Bramka płatnicza” | karta odrzucona, karta przyjęta |
| `dialog.spec.ts` | `/admin/zamowienia/potwierdzenie` | „Wróć”, „Tak, anuluj” (dane i sprzątanie przez API są gotowe) |
| `karta-i-pobieranie.spec.ts` | link „Regulamin” w stopce, „Eksportuj do CSV” w `/admin/zamowienia` | nowa karta, pobieranie pliku |
| `import-i-wyglad.spec.ts` | `/admin/produkty`, `/logowanie` | wysłanie pliku CSV z błędami, porównanie zrzutu |

Karty testowe: `4111 1111 1111 1111` (płatność przyjęta), `4000 0000 0000 0002` (odrzucona).

## Kroki

PowerShell, z katalogu głównego repo. Po każdym kroku uruchamiasz jeden plik i zamieniasz w nim `test.fixme` na `test`.

1. **Przełącz się na gałąź zadania i opłać koszyk w ramce.** Najpierw zrób commit swoich zmian, potem:
   ```powershell
   git fetch origin
   git switch extra/d2-iframe-dialog-pliki
   npx playwright test tests/extra/d2
   ```
   Oczekiwany wynik: `8 skipped`. Przejdź płatność ręcznie (w drugim oknie `npm start`, konto `user` / `user123`, coś w koszyku, „Zapłać kartą online”). Potem zrób TODO w `platnosc.spec.ts`. Do wnętrza ramki wchodzisz przez `page.getByTitle('Bramka płatnicza').contentFrame()`.
   ```powershell
   npx playwright test tests/extra/d2/platnosc.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Gdy `page.getByLabel('Numer karty')` czeka 5 s i pada z `element(s) not found`, szukasz pola na stronie głównej, a ono jest w ramce. Każdy locator elementu z formularza karty, także komunikat i nagłówek po płatności, musi zaczynać się od zmiennej z `contentFrame()`.

2. **Obsłuż okno potwierdzenia.** Zrób TODO w `dialog.spec.ts`. Okno znajdziesz przez `page.getByRole('dialog')`. To element strony (`<dialog>`), więc działa na nim każdy locator i asercja. `page.on('dialog')` z dokumentacji Playwright dotyczy tylko okien przeglądarki (`alert`, `confirm`, `prompt`) i tutaj nic nie zrobi.
   ```powershell
   npx playwright test tests/extra/d2/dialog.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

3. **Złap nową kartę i pobrany plik.** Zrób TODO w `karta-i-pobieranie.spec.ts`. Kolejność ma znaczenie: najpierw `page.waitForEvent('popup')` albo `page.waitForEvent('download')` zapisane w zmiennej, potem kliknięcie, na końcu `await` tej zmiennej. Wiersz `ZAM-1001` do asercji przepisz z pliku `zamowienia.csv`, który pobierzesz ręcznie z panelu admina.
   ```powershell
   npx playwright test tests/extra/d2/karta-i-pobieranie.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

4. **Wyślij plik i zbierz wszystkie błędy miękkimi asercjami.** Zrób TODO w pierwszym teście `import-i-wyglad.spec.ts`. Plik powstaje w pamięci (`setInputFiles` z `buffer`), więc nie potrzebujesz pliku na dysku. Uruchom test, gdy przejdzie, zepsuj na chwilę dwie z trzech asercji o wierszach (np. `Wiersz 2` zamień na `Wiersz 5`) i uruchom go jeszcze raz.
   ```powershell
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "pliku CSV"
   ```
   Oczekiwany wynik: najpierw `1 passed`. Po zepsuciu `1 failed`, a w opisie błędu dwa osobne bloki `Error: expect(locator).toContainText(expected) failed`: test nie zatrzymał się na pierwszym. Przywróć asercje.

5. **Porównaj stronę logowania ze zrzutem wzorcowym.** Zrób TODO w drugim teście `import-i-wyglad.spec.ts` i uruchom go dwa razy:
   ```powershell
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "zrzucie"
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "zrzucie"
   ```
   Oczekiwany wynik pierwszego: `1 failed` i komunikat `Error: A snapshot doesn't exist at ...\logowanie-chromium-win32.png, writing actual.` Playwright zapisał właśnie zrzut wzorcowy w folderze `tests\extra\d2\import-i-wyglad.spec.ts-snapshots\`. Drugi przebieg: `1 passed`. Zmień w teście adres na `/logowanie?error=1` (strona pokaże czerwony komunikat), uruchom test i otwórz `npx playwright show-report`. Oczekiwany wynik: `1 failed`, `pixels (ratio ... of all image pixels) are different`, a w raporcie zakładki „Diff”, „Actual”, „Expected”. Przywróć adres.

> **Pracujesz na Windows, a zrzut wzorcowy przyszedł z innego komputera**
> Nazwa zrzutu zawiera przeglądarkę i system: `logowanie-chromium-win32.png` na Windows, `logowanie-chromium-darwin.png` na macOS, `-linux` na serwerze CI. Czcionki i wygładzanie różnią się między systemami, więc zrzut z macOS nie pasuje do Windows. Swój zrzut wzorcowy generujesz u siebie: `npx playwright test tests/extra/d2 --update-snapshots`. Zrzuty dla CI generuje się na tym samym systemie, na którym biegnie CI.

6. **Uruchom cały zestaw dwa razy.**
   ```powershell
   npx playwright test tests/extra/d2 --repeat-each=2
   ```
   Oczekiwany wynik: `16 passed`.

## Przykład wyniku

Locator w ramce na innym przykładzie (ramka o tytule „Mapa”, której w tej aplikacji nie ma):
```ts
const mapa = page.getByTitle('Mapa').contentFrame();
await mapa.getByRole('button', { name: 'Powiększ' }).click();
await expect(mapa.getByText('Skala 1:500')).toBeVisible();
```

Wynik kroku 6 dla jednego powtórzenia (czasy i kolejność u ciebie będą inne):
```
  ✓  2 [chromium] › tests/extra/d2/import-i-wyglad.spec.ts:32:5 › strona logowania wygląda tak jak na zrzucie wzorcowym (202ms)
  ✓  4 [chromium] › tests/extra/d2/karta-i-pobieranie.spec.ts:7:5 › link „Regulamin” otwiera regulamin w nowej karcie (261ms)
  ✓  7 [chromium] › tests/extra/d2/karta-i-pobieranie.spec.ts:21:5 › eksport zamówień pobiera plik CSV z nagłówkiem i zamówieniem ZAM-1001 (347ms)
  ✓  6 [chromium] › tests/extra/d2/dialog.spec.ts:41:5 › „Wróć” zamyka okno i zamówienie zostaje nowe (394ms)
  ✓  1 [chromium] › tests/extra/d2/import-i-wyglad.spec.ts:6:5 › import pliku CSV z błędami pokazuje wszystkie błędne wiersze (393ms)
  ✓  5 [chromium] › tests/extra/d2/dialog.spec.ts:55:5 › „Tak, anuluj” anuluje zamówienie (412ms)
  ✓  3 [chromium] › tests/extra/d2/platnosc.spec.ts:21:5 › karta odrzucona przez bank pokazuje komunikat w ramce (536ms)
  ✓  8 [chromium] › tests/extra/d2/platnosc.spec.ts:37:5 › przyjęta płatność daje numer zamówienia (345ms)

  8 passed (1.4s)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/extra/d2 --repeat-each=2` daje `16 passed`.
- [ ] Po przebiegu koszyk klienta `user` nie zawiera „Mydło w kostce”, a w `/admin/zamowienia` każde zamówienie utworzone przez testy ma status „Anulowane”.
- [ ] W `tests\extra\d2\import-i-wyglad.spec.ts-snapshots\` jest twój zrzut z `win32` w nazwie. Pokazujesz drugiej osobie zakładkę „Diff” z kroku 5.
- [ ] Zmieniasz w teście pobierania oczekiwaną nazwę pliku na `zamowienia.xlsx`: test pada, a w opisie błędu jest `Expected: "zamowienia.xlsx"` i `Received: "zamowienia.csv"`. Przywracasz nazwę.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dopisz w `platnosc.spec.ts` trzeci test: numer karty z 15 cyframi daje w ramce komunikat przy polu „Numer karty musi mieć 16 cyfr”, a koszyk zostaje bez zmian. Potem w teście pobierania sprawdź każdy wiersz pliku: podziel treść na linie (`tresc.split('\r\n')`), sprawdź liczbę wierszy z danymi przez `GET /api/admin/orders` jako admin i porównaj obie liczby.

## Artefakt do zabrania

Cztery wzorce do skopiowania: `contentFrame()` dla ramki, `getByRole('dialog')` dla okna na stronie, `waitForEvent` przed kliknięciem dla nowej karty i pobierania, `setInputFiles` z plikiem w pamięci. Do tego `expect.soft` dla testów, które mają pokazać wszystkie różnice naraz.

## Rozwiązanie wzorcowe

Gałąź `solution/extra-d2`:
```powershell
git fetch origin
git diff origin/extra/d2-iframe-dialog-pliki origin/solution/extra-d2 -- tests/extra/d2
```
Zrzut wzorcowy na tej gałęzi ma nazwę `logowanie-chromium-darwin.png` (zrobiony na macOS). Na Windows test zrzutu za pierwszym razem padnie z `A snapshot doesn't exist`, tak jak w kroku 5.
