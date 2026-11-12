# Ćwiczenie 04. Trzy scenariusze nagrane Codegenem i poprawione do odpornych locatorów

Blok 1.4 · 50 min · w parach, zmiana ról co scenariusz

## Cel

Nagrasz scenariusz w Codegenie, przeczytasz wygenerowany kod i poprawisz w nim locatory i asercje tak, żeby test sprawdzał wynik scenariusza i nie psuł się po drobnej zmianie wyglądu strony.

## Materiał wejściowy

Szkielety z `test.fixme` i listą kroków w komentarzach TODO:

| Plik | Scenariusz | Konto |
|---|---|---|
| `tests/cwiczenia/04-filtr-kategorii.spec.ts` | A. Filtr kategorii „Dziecko” | bez logowania |
| `tests/cwiczenia/04-koszyk-usuwanie.spec.ts` | B. Dodanie „Żel pod prysznic” do koszyka i usunięcie go | `user` / `user123` |
| `tests/cwiczenia/04-adres-walidacja.spec.ts` | C. Adres dostawy z błędnym kodem pocztowym `00000` | `user` / `user123` |

Uwaga: pod tabelą produktów są kafelki z tymi samymi nazwami i cenami. Codegen może nagrać `getByText('Żel pod prysznic')`, który znajdzie dwa elementy (komórkę tabeli i kafelek). Zawęź locator do tabeli: `page.getByRole('row').filter({ hasText: 'Żel pod prysznic' })`. W scenariuszu B koszyk ma kolumny Produkt, Cena, Ilość, Wartość, a po kliknięciu „Usuń” adres strony to `/koszyk?usunieto=1` (asercja `toHaveURL(/\/koszyk/)` przejdzie, `toHaveURL(/\/koszyk$/)` nie).

Kolejność wyboru locatorów (z `CLAUDE.md`): `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`. Bez selektorów CSS, XPath, `id` i klas.

## Kroki

1. **Uruchom aplikację w osobnym oknie.** Otwórz drugie okno PowerShell w folderze repo:
   ```powershell
   npm start
   ```
   Oczekiwany wynik: `Namssor działa: http://localhost:4100  (baza: …)` i `Zatrzymanie: Ctrl+C`. To okno zostaw otwarte do końca ćwiczenia.

2. **Nagraj scenariusz A.** W pierwszym oknie:
   ```powershell
   npx playwright codegen http://localhost:4100
   ```
   Otwierają się dwa okna: przeglądarka i Playwright Inspector z kodem. Przejdź w przeglądarce kroki z TODO w `04-filtr-kategorii.spec.ts`. Asercje dodasz przyciskami na pasku nad stroną (**Assert visibility**, **Assert text**): kliknij przycisk, potem element na stronie. Skopiuj z Inspectora linie z wnętrza testu (bez `import` i bez `test('test', …)`) i wklej je w miejsce komentarzy TODO. Zamień `test.fixme` na `test`. Zamknij okna Codegena.

3. **Zrób review nagranego kodu i uruchom test.** Przy każdym locatorze zadaj pytanie: czy to `getByRole`, `getByLabel` albo `getByText`? Jeśli widzisz `locator('#…')`, `locator('.…')`, `nth(…)` albo `first()`, zamień je. Codegen nagrywa tylko to, co klikasz: sprawdzenie, że czegoś na stronie nie ma (TODO 5), dopisz ręcznie (podpowiedź: `toHaveCount`).
   ```powershell
   npx playwright test tests/cwiczenia/04-filtr-kategorii.spec.ts
   ```
   Oczekiwany wynik: `1 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Najpierw przeczytaj komunikat błędu od góry: który locator, co było oczekiwane. `strict mode violation … resolved to 2 elements` znaczy, że locator pasuje do dwóch elementów: zobacz, które dwa wypisał Playwright i co je różni. Pomaga `exact: true` albo zawężenie do wiersza tabeli: `page.getByRole('row').filter({ hasText: '…' })`.

4. **Nagraj i popraw scenariusz B, potem C.** Zmiana osoby przy klawiaturze. Ten sam rytm: Codegen, wklejenie, review locatorów, uruchomienie. W B i C nagrywasz także logowanie. W C sprawdź oba komunikaty błędu i to, że komunikat „Zapisano adres dostawy.” się nie pojawił.
   ```powershell
   npx playwright test tests/cwiczenia/04-koszyk-usuwanie.spec.ts
   npx playwright test tests/cwiczenia/04-adres-walidacja.spec.ts
   ```
   Oczekiwany wynik każdego polecenia: `1 passed`.

> **Codegen się nie otwiera albo nie nagrywa**
> Uruchom `npx playwright test --ui`, wybierz swój test i użyj przycisku **Pick locator** (ikona celownika): kliknięty element daje gotowy locator do skopiowania. Kod testu piszesz wtedy sam, krok po kroku według TODO.

5. **Sprawdź, że testy są stabilne i potrafią paść.**
   ```powershell
   npx playwright test tests/cwiczenia/04- --repeat-each=3 --workers=1
   ```
   Oczekiwany wynik: `9 passed`. Potem w scenariuszu C zmień oczekiwany komunikat przy polu na „Kod pocztowy musi mieć format 00-0000”, uruchom C i zobacz `1 failed`. Przywróć.

6. **Zapisz pracę.**
   ```powershell
   git add tests/cwiczenia
   git commit -m "Ćwiczenie 04: trzy scenariusze z Codegena"
   git push
   ```

## Przykład wyniku

Ten sam przycisk dwa razy (inny produkt niż w ćwiczeniu). Pierwsza linia to selektor skopiowany z DevTools: psuje się, gdy zmieni się kolejność produktów albo kolumn. Druga to locator po review:
```ts
await page.locator('tbody > tr:nth-child(10) > td:nth-child(6) > form > button').click();
await page.getByRole('button', { name: 'Dodaj do koszyka: Pasta do zębów' }).click();
```
Wynik kroku 5 (fragment, czasy będą inne):
```
  9 passed (3.3s)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/04- --repeat-each=3 --workers=1` daje `9 passed`.
- [ ] W trzech plikach nie ma `test.fixme`, `locator('…')` z CSS, `nth(`, `first()` ani `waitForTimeout`.
- [ ] Scenariusz C padał po zmianie oczekiwanego komunikatu i przechodzi po przywróceniu.
- [ ] Przy każdym locatorze z `getByTestId` umiesz powiedzieć, dlaczego `getByRole`, `getByLabel` i `getByText` nie wystarczyły.

## Dla szybszych

> **Skończyłeś wcześniej**
> Scenariusz A ma nazwę „pokazuje tylko produkty dla dzieci”. Sprawdź, czy Twój test to udowadnia, czy tylko sprawdza, że trzy produkty są widoczne. Dopisz asercję, która liczy wszystkie wiersze produktów na stronie, i porównaj ją z licznikiem „Liczba produktów”. Potem uruchom scenariusz A na innej przeglądarce: `npx playwright install firefox`, a następnie `npx playwright test tests/cwiczenia/04-filtr-kategorii.spec.ts --project=firefox`. Dłuższe zadania (przeglądarki, rozdzielczości, zrzuty przy błędzie): gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Trzy działające testy w `tests/cwiczenia/04-*.spec.ts` w Twoim forku i nawyk: każdy nagrany locator przechodzi review.

## Rozwiązanie wzorcowe

Gałąź `solution/04`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/04 -- tests/cwiczenia
```
