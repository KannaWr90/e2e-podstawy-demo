# Zadanie dodatkowe D2. Nowa karta, pliki i trzecia partia testów Klaudiusza

Zadanie dodatkowe · dzień 2 · ok. 70 min · w parach

## Cel

Napiszesz testy dla elementów, na których zwykłe locatory nie wystarczają: link otwierający nową kartę, pobieranie i wysyłanie pliku. Użyjesz miękkich asercji, żeby jeden przebieg pokazał wszystkie błędy naraz, i porównasz stronę ze zrzutem wzorcowym. Na koniec znajdziesz błędy w trzech testach, które wyglądają na poprawne nawet po review z listą kontrolną.

## Materiał wejściowy

Gałąź `extra/d2-iframe-dialog-pliki`. Okno potwierdzenia i ramka płatności, które kiedyś były na tej gałęzi, są teraz w ćwiczeniu 06 (część B). Nowe pliki są w `tests/extra/d2/`:

| Plik | Ekran | Testy |
|---|---|---|
| `karta-i-pobieranie.spec.ts` | link „Regulamin” w stopce, „Eksportuj do CSV” w `/admin/zamowienia` | nowa karta, pobieranie pliku (`test.fixme` i TODO) |
| `import-i-wyglad.spec.ts` | `/admin/produkty`, `/logowanie` | wysłanie pliku CSV z błędami, porównanie zrzutu (`test.fixme` i TODO) |
| `review/01-suma-koszyka.spec.ts` … `review/03-wyszukiwarka-cena.spec.ts` | koszyk, kod rabatowy, wyszukiwarka | trzy testy do review, przechodzą |

Wiadomość od Klaudiusza, wtorek, 15:20:

> Trzy ostatnie testy przed jutrzejszym zamrożeniem. Przeszły listę kontrolną z ćwiczenia 05, wszystkie 15 pytań. Tym razem naprawdę sprawdziłem. Dwa razy.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujesz w oknie testów. Kroki 3, 4 i 5–6 możesz robić w dowolnej kolejności. W każdym z nich zamieniasz w jednym pliku `test.fixme` na `test` i uruchamiasz ten plik.

1. **Zapisz swoje zmiany w git.** W oknie testów wpisz:
   ```powershell
   git add .
   git commit -m "Moja praca przed zadaniem D2"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Moja praca przed zadaniem D2` (skrót będzie inny). Jeśli nie było zmian, zobaczysz `nothing to commit, working tree clean` i to też jest w porządku.

2. **Przełącz się na gałąź zadania.** W oknie testów wpisz:
   ```powershell
   git fetch origin
   git switch extra/d2-iframe-dialog-pliki
   npx playwright test tests/extra/d2
   ```
   Oczekiwany wynik: `3 passed` i `4 skipped`. Trzy zielone testy to partia Klaudiusza z kroku 7.

3. **Złap nową kartę i pobrany plik.**
   a) Najpierw pobierz plik ręcznie. W oknie aplikacji uruchom `npm start`. W przeglądarce zaloguj się jako `admin` / `admin123`, otwórz http://localhost:4100/admin/zamowienia i kliknij „Eksportuj do CSV”.
   b) Zrób TODO w `karta-i-pobieranie.spec.ts`. Wiersz `ZAM-1001` przepisz z pobranego pliku `zamowienia.csv` do asercji. Kolejność w teście ma znaczenie: najpierw `page.waitForEvent('popup')` albo `page.waitForEvent('download')` zapisane w zmiennej, potem kliknięcie, na końcu `await` tej zmiennej.
   c) W oknie testów uruchom plik:
   ```powershell
   npx playwright test tests/extra/d2/karta-i-pobieranie.spec.ts
   ```
   Oczekiwany wynik: `2 passed`.

4. **Wyślij plik i zbierz wszystkie błędy miękkimi asercjami.** Zrób TODO w pierwszym teście `import-i-wyglad.spec.ts`. Plik powstaje w pamięci (`setInputFiles` z `buffer`), więc nie potrzebujesz pliku na dysku. Uruchom test poleceniem poniżej. Gdy przejdzie, zepsuj dwie z trzech asercji o wierszach (np. `Wiersz 2` zamień na `Wiersz 5`) i uruchom go jeszcze raz.
   ```powershell
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "pliku CSV"
   ```
   Oczekiwany wynik: najpierw `1 passed`. Po zepsuciu `1 failed`, a w opisie błędu dwa osobne bloki `Error: expect(locator).toContainText(expected) failed`: test nie zatrzymał się na pierwszym. Przywróć obie asercje i uruchom test jeszcze raz. Oczekiwany wynik: `1 passed`.

5. **Zapisz zrzut wzorcowy strony logowania.** Zrób TODO w drugim teście `import-i-wyglad.spec.ts` i uruchom go w oknie testów dwa razy:
   ```powershell
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "zrzucie"
   npx playwright test tests/extra/d2/import-i-wyglad.spec.ts -g "zrzucie"
   ```
   Oczekiwany wynik pierwszego: `1 failed` i komunikat `Error: A snapshot doesn't exist at ...\logowanie-chromium-win32.png, writing actual.` Playwright zapisał właśnie zrzut wzorcowy w folderze `tests\extra\d2\import-i-wyglad.spec.ts-snapshots\`. Drugi przebieg: `1 passed`.

6. **Sprawdź, że zrzut łapie różnicę.** Zmień w teście adres na `/logowanie?error=1` (strona pokaże czerwony komunikat) i uruchom test poleceniem z kroku 5. Potem w oknie testów otwórz raport:
   ```powershell
   npx playwright show-report
   ```
   Oczekiwany wynik: test kończy się `1 failed` z komunikatem `pixels (ratio ... of all image pixels) are different`, a w raporcie są zakładki „Diff”, „Actual”, „Expected”. Przywróć w teście adres `/logowanie` i uruchom test jeszcze raz. Oczekiwany wynik: `1 passed`.

> **Pracujesz na Windows, a zrzut wzorcowy przyszedł z innego komputera**
> Nazwa zrzutu zawiera przeglądarkę i system: `logowanie-chromium-win32.png` na Windows, `logowanie-chromium-darwin.png` na macOS, `-linux` na serwerze CI. Czcionki i wygładzanie różnią się między systemami, więc zrzut z macOS nie pasuje do Windows. Swój zrzut wzorcowy generujesz u siebie: `npx playwright test tests/extra/d2 --update-snapshots`. Zrzuty dla CI generuje się na tym samym systemie, na którym biegnie CI.

7. **Zrób review trzeciej partii Klaudiusza.** Trzy testy w `tests/extra/d2/review/`. Każdy ma komentarz „Wymaganie: …” i każdy przechodzi. Błędy są subtelniejsze niż w ćwiczeniu 05: przy każdej asercji zapytaj, w jakiej sytuacji przejdzie, choć wymaganie nie jest spełnione. Wpisz do tabeli z ćwiczenia 05 wiersze R1–R3 (pliki `review/01`–`03`) i dla każdego udowodnij błąd zmianą w teście albo w danych. W oknie testów uruchom:
   ```powershell
   npx playwright test tests/extra/d2/review
   ```
   Oczekiwany wynik: `3 passed`.

> **Jeśli utknąłeś po 10 minutach**
> R1: ile sztuk trafia do koszyka i czym wtedy różni się suma od ceny? R2: co pokaże ten test 1 grudnia? Zmienna `NAMSSOR_TERAZ` (README, „Zmienne środowiskowe”) zmienia datę, którą aplikacja uznaje za dzisiejszą. R3: w UI mode kliknij krok z asercją i zobacz, który element podświetla locator.

8. **Uruchom cały zestaw dwa razy.** W oknie testów wpisz:
   ```powershell
   npx playwright test tests/extra/d2 --repeat-each=2 --workers=1
   ```
   Oczekiwany wynik, gdy kroki 3–6 są zrobione: `14 passed`. `--workers=1`, bo testy z `review/` korzystają z koszyków kont `tester07` i `biuro`, a dwie kopie tego samego testu naraz przeszkadzają sobie w jednym koszyku.

9. **Wróć do projektu.** Zapisz pracę na gałęzi zadania i przełącz się z powrotem. W oknie testów wpisz:
   ```powershell
   git add .
   git commit -m "Zadanie D2: nowa karta, pliki, review R1-R3"
   git switch main
   ```
   Oczekiwany wynik ostatniego polecenia: `Switched to branch 'main'`.

## Przykład wyniku

Wynik kroku 8 dla jednego powtórzenia (czasy i kolejność u ciebie będą inne):
```
  ✓  1 [chromium] › tests/extra/d2/import-i-wyglad.spec.ts:6:5 › import pliku CSV z błędami pokazuje wszystkie błędne wiersze (393ms)
  ✓  2 [chromium] › tests/extra/d2/import-i-wyglad.spec.ts:32:5 › strona logowania wygląda tak jak na zrzucie wzorcowym (202ms)
  ✓  3 [chromium] › tests/extra/d2/karta-i-pobieranie.spec.ts:7:5 › link „Regulamin” otwiera regulamin w nowej karcie (261ms)
  ✓  4 [chromium] › tests/extra/d2/karta-i-pobieranie.spec.ts:21:5 › eksport zamówień pobiera plik CSV z nagłówkiem i zamówieniem ZAM-1001 (347ms)
```

Wiersz tabeli review dla testu spoza tego zadania:

| Test | Linia | Co jest nie tak | Pytanie z listy | Poprawka |
|---|---|---|---|---|
| logowanie | 42 | Sprawdza tylko, że jest link „Zaloguj”. Nie sprawdza, że zniknął napis „Zalogowano jako user” | 2 | dopisać `await expect(page.getByText('Zalogowano jako user')).toHaveCount(0);` |

## Kryterium „gotowe”

- [ ] `npx playwright test tests/extra/d2 --repeat-each=2 --workers=1` daje `14 passed`.
- [ ] W `tests\extra\d2\import-i-wyglad.spec.ts-snapshots\` jest twój zrzut z `win32` w nazwie. Pokazujesz drugiej osobie zakładkę „Diff” z kroku 6.
- [ ] Zmieniasz w teście pobierania oczekiwaną nazwę pliku na `zamowienia.xlsx`: test pada, a w opisie błędu jest `Expected: "zamowienia.xlsx"` i `Received: "zamowienia.csv"`. Przywracasz nazwę.
- [ ] Tabela ma wiersze R1–R3 (pliki `review/01`–`03`), każdy z dowodem: zmiana, po której test powinien paść, a przechodzi, albo przebieg, który pokazuje, kiedy test padnie bez błędu w aplikacji.

## Dla szybszych

> **Skończyłeś wcześniej**
> W teście pobierania sprawdź każdy wiersz pliku: podziel treść na linie (`tresc.split('\r\n')`), pobierz liczbę zamówień przez `GET /api/admin/orders` jako admin i porównaj obie liczby. Potem popraw test R2 tak, żeby dawał ten sam wynik każdego dnia, i opisz w jednym zdaniu, jak uruchomić go dla daty po 30.11.2026.

## Artefakt do zabrania

Wzorce do skopiowania: `waitForEvent` przed kliknięciem dla nowej karty i pobierania, `setInputFiles` z plikiem w pamięci, `expect.soft` dla testów, które mają pokazać wszystkie różnice naraz. Do tego trzy nowe wiersze w twojej liście kontrolnej, jeśli pytania z listy nie złapały błędów R1–R3.

## Rozwiązanie wzorcowe

Gałąź `solution/extra-d2`:
```powershell
git fetch origin
git diff origin/extra/d2-iframe-dialog-pliki origin/solution/extra-d2 -- tests/extra/d2 docs/odpowiedzi/extra-d2.md
```
Zrzut wzorcowy na tej gałęzi ma nazwę `logowanie-chromium-darwin.png` (zrobiony na macOS). Na Windows test zrzutu za pierwszym razem padnie z `A snapshot doesn't exist`, tak jak w kroku 5.
