# Zadanie dodatkowe D2: odpowiedzi do rundy 3 review

Trzy testy z `tests/extra/d2/review/`. Każdy przechodził i każdy przeszedłby też listę kontrolną czytaną pobieżnie. Numery linii dotyczą wersji z gałęzi `extra/d2-iframe-dialog-pliki`, numery pytań `docs/lista-kontrolna-review.md`.

## R1. 01-suma-koszyka.spec.ts

| | |
|---|---|
| Błąd (linie 14 i 21) | Do koszyka trafia 1 sztuka. Przy 1 sztuce suma równa się cenie za sztukę, więc asercja `cart-total` = 11,99 zł nie sprawdza mnożenia przez ilość, o którym mówi wymaganie. Aplikacja, która liczy sumę bez ilości, przejdzie ten test. Pytania 2 i 3. |
| Poprawka | Ilość 3 na karcie produktu, w koszyku ilość `3` i suma 35,97 zł (3 × 11,99 zł). Na starcie `DELETE /api/cart`, żeby resztki z nieudanego przebiegu nie zmieniły ilości. |

Dowód: policz, jaka byłaby suma, gdyby aplikacja nie mnożyła przez ilość. Przy 1 sztuce wychodzi ta sama liczba, więc test nie odróżnia dobrej aplikacji od złej.

## R2. 02-kod-czarny-piatek.spec.ts

| | |
|---|---|
| Błąd | Wynik zależy od prawdziwej daty. Kod CZARNY20 jest ważny do 30.11.2026: test przechodzi do tego dnia, a od 1.12 pada, choć w aplikacji nic się nie zmieniło. Druga połowa wymagania (kod wygasły) nie jest sprawdzana wcale. Pytania 9 i 2. |
| Poprawka | Dwa testy, po jednym na każdą połowę wymagania. Każdy czyta datę aplikacji z `GET /api/promocja` (pole `today`) i pomija się (`test.skip`) z komunikatem, gdy data jest z drugiej połowy. Datę ustawia się zmienną `NAMSSOR_TERAZ` przed uruchomieniem aplikacji. Plik ma `mode: 'serial'`, bo oba testy używają koszyka konta `biuro`; każdy przygotowuje koszyk sam. |

Dowód w PowerShell (aplikacja nie może działać w innym oknie, bo Playwright jej użyje i zmienna nie zadziała):
```powershell
$env:NAMSSOR_TERAZ="2026-12-01"
npx playwright test tests/extra/d2/review/02-kod-czarny-piatek.spec.ts
Remove-Item Env:NAMSSOR_TERAZ
```
Wersja z `extra/d2`: `1 failed`, `Expected: "Kod CZARNY20 przyjęty: -20% na całe zamówienie."`, `Received: "Kod CZARNY20 wygasł 30.11.2026."`. Poprawiona: `1 passed`, `1 skipped`. Bez zmiennej, w listopadzie: `1 passed`, `1 skipped` (test wygasłego kodu pominięty).

Inna dobra odpowiedź: stała data dla całego zestawu w `playwright.config.ts`, w `webServer` pole `env: { NAMSSOR_TERAZ: '2026-11-20' }`. Wtedy każdy test ma tę samą datę, ale testu wygasłego kodu w tym samym przebiegu już nie uruchomisz.

## R3. 03-wyszukiwarka-cena.spec.ts

| | |
|---|---|
| Błąd (linia 13) | `page.getByText('11,99 zł', { exact: true })` szuka na całej stronie. Komórka ceny w tabeli ma tekst „14,99 zł 11,99 zł” (stara cena przekreślona i nowa), więc dokładne dopasowanie jej nie łapie. Łapie cenę na kafelku pod tabelą. Wymaganie mówi o tabeli, a test na nią nie patrzy. Pytania 7, 6 i 2. |
| Poprawka | Wiersz tabeli po treści (`getByRole('row').filter({ hasText: 'Odżywka do włosów' })`), dokładnie jeden, i komórka ceny w tym wierszu z tekstem „14,99 zł 11,99 zł”. |

Dowód: zamień lokator na `page.getByRole('row').getByText('11,99 zł', { exact: true })`. Test pada z `element(s) not found`: w żadnym wierszu tabeli nie ma elementu, którego cały tekst to „11,99 zł”. W UI mode zakładka „Locator” podświetla kafelek.

## Sprawdzenie

```powershell
npx playwright test tests/extra/d2 --repeat-each=2 --workers=1
```
Oczekiwany wynik na tej gałęzi: `14 passed` i `2 skipped` (w listopadzie pominięty jest test wygasłego kodu).
