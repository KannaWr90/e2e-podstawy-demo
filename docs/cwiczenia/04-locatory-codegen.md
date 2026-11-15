# Ćwiczenie 04. Testy z Codegena z odpornymi locatorami

Blok 1.4 · 50 min + 30 min karta produktu (04b) · w parach, zmiana ról co scenariusz

## Cel

Nagrasz scenariusz w Codegenie, przeczytasz wygenerowany kod i poprawisz w nim locatory i asercje tak, żeby test sprawdzał wynik scenariusza i nie psuł się po drobnej zmianie wyglądu strony. Zawęzisz locator do fragmentu strony, gdy ta sama nazwa występuje na niej dwa razy.

## Materiał wejściowy

> **Od Mirka:** Przestawiłem w nocy kolumny w tabeli produktów, bo tak ładniej. Testy poprzednika, które miały selektory skopiowane z DevTools, padły. U mnie działa. Nagrajcie testy, które przeżyją moje następne poprawki.

Szkielety z `test.fixme` i listą kroków w komentarzach TODO:

| Plik | Scenariusz | Konto |
|---|---|---|
| `tests/cwiczenia/04-filtr-kategorii.spec.ts` | A. Filtr kategorii „Dziecko” | bez logowania |
| `tests/cwiczenia/04-koszyk-usuwanie.spec.ts` | B. Dodanie „Żel pod prysznic” do koszyka i usunięcie go | `user` / `user123` |
| `tests/cwiczenia/04-adres-walidacja.spec.ts` | C. Adres dostawy z błędnym kodem pocztowym `00000` | `user` / `user123` |
| `tests/cwiczenia/04-karta-produktu.spec.ts` | 04b. Cena promocyjna na kafelku, karcie produktu i w koszyku | `tester11` / `czarny-piatek-2026` |

Kolejność wyboru locatorów (z `CLAUDE.md`): `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`. Bez selektorów CSS, XPath, `id` i klas.

Uwaga: pod tabelą produktów są kafelki z tymi samymi nazwami i cenami. Codegen może nagrać `getByText('Żel pod prysznic')`, który znajdzie dwa elementy (komórkę tabeli i kafelek). Zawęź locator do tabeli: `page.getByRole('row').filter({ hasText: 'Żel pod prysznic' })`.

## Kroki

PowerShell, z folderu repo. Polecenia `npx` i `git` wpisujesz w oknie testów.

1. **Uruchom aplikację w oknie aplikacji.** Otwórz drugie okno PowerShell w folderze repo i wpisz:
   ```powershell
   npm start
   ```
   Oczekiwany wynik: `Namssor działa: http://localhost:4100  (baza: …)` i `Zatrzymanie: Ctrl+C`. To okno zostaw otwarte do końca ćwiczenia.

2. **Nagraj scenariusz A.** W oknie testów:
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
> Najpierw przeczytaj komunikat błędu od góry: który locator, co było oczekiwane. `strict mode violation … resolved to 2 elements` znaczy, że locator pasuje do dwóch elementów: zobacz, które dwa wypisał Playwright i co je różni. Pomaga `exact: true` albo zawężenie do fragmentu strony, w którym element jest tylko raz: do wiersza tabeli (`page.getByRole('row').filter({ hasText: '…' })`) albo do kafelka.

4. **Nagraj i popraw scenariusz B, potem C.** Zmiana osoby przy klawiaturze. Ten sam rytm: Codegen, wklejenie, review locatorów, uruchomienie. W B i C nagrywasz także logowanie. W B koszyk ma kolumny Produkt, Cena, Ilość, Wartość, a po kliknięciu „Usuń” adres strony to `/koszyk?usunieto=1`: asercja `toHaveURL(/\/koszyk/)` przejdzie, `toHaveURL(/\/koszyk$/)` nie. W C sprawdź oba komunikaty błędu i to, że komunikat „Zapisano adres dostawy.” się nie pojawił.
   ```powershell
   npx playwright test tests/cwiczenia/04-koszyk-usuwanie.spec.ts
   npx playwright test tests/cwiczenia/04-adres-walidacja.spec.ts
   ```
   Oczekiwany wynik każdego polecenia: `1 passed`.

> **Codegen się nie otwiera albo nie nagrywa**
> Uruchom `npx playwright test --ui`, wybierz swój test i użyj przycisku **Pick locator** (ikona celownika): kliknięty element daje gotowy locator do skopiowania. Kod testu piszesz wtedy sam, krok po kroku według TODO.

5. **Sprawdź, że testy są stabilne i potrafią paść.**

   a) Uruchom trzy scenariusze po trzy razy:
   ```powershell
   npx playwright test tests/cwiczenia/04- --repeat-each=3 --workers=1
   ```
   Oczekiwany wynik: `3 skipped` i `9 passed`. `skipped` to szkielet 04b, który zrobisz w kolejnych krokach.

   b) W scenariuszu C zmień oczekiwany komunikat przy polu na „Kod pocztowy musi mieć format 00-0000” i uruchom C:
   ```powershell
   npx playwright test tests/cwiczenia/04-adres-walidacja.spec.ts
   ```
   Oczekiwany wynik: `1 failed`.

   c) Cofnij zmianę komunikatu, uruchom C jeszcze raz (oczekiwany wynik `1 passed`) i zapisz pracę:
   ```powershell
   git add tests/cwiczenia
   git commit -m "Ćwiczenie 04: trzy scenariusze z Codegena"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 04: trzy scenariusze z Codegena` (skrót będzie inny). Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

### Część 04b. Karta produktu · 30 min

> **Od Bożeny:** Cena promocyjna ma być wszędzie taka sama: na kafelku, na karcie produktu i w koszyku. Jak klient zobaczy trzy różne ceny, zadzwoni do mnie, a ja do was. To ostatnia zmiana wymagań przed Czarnym Piątkiem, obiecuję.

Produkt: „Krem do twarzy na dzień”, cena regularna 32,99 zł, promocyjna 26,39 zł, plakietka `-20%`. Kafelki są w sekcji „Oferta na Czarny Piątek” pod tabelą produktów. Konto `tester11` ma własny koszyk, do którego nie dodają nic testy z ćwiczeń 02 i 04.

6. **Obejrzyj trzy miejsca z ceną.** W przeglądarce (aplikacja z kroku 1 działa) otwórz http://localhost:4100, znajdź krem w tabeli i w kafelku, kliknij jego nazwę w kafelku, dodaj go do koszyka jako `tester11` i otwórz koszyk. Zanotuj, jak w każdym miejscu wygląda cena.

7. **Napisz test według TODO w `04-karta-produktu.spec.ts`.** Codegenem, z Claude Code albo ręcznie. Na stronie produktów każdy locator z nazwą albo ceną kremu sprawdź pod kątem drugiego elementu o tej samej treści.
   ```powershell
   npx playwright test tests/cwiczenia/04-karta-produktu.spec.ts
   ```
   Oczekiwany wynik: `1 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Błąd `strict mode violation: getByText('Krem do twarzy na dzień') resolved to 2 elements` wypisuje oba elementy: komórkę tabeli (`<td …>`) i link w kafelku (`<a href="/produkt/5">`). Każdy kafelek to osobny element z nazwą produktu. Zbuduj najpierw locator całego kafelka kremu (Pick locator w `--ui` podpowie jego rolę), a ceny i plakietki szukaj już w nim, tak jak w scenariuszu B szukałeś przycisku w wierszu.

8. **Zepsuj cenę w asercji koszyka.** Zmień oczekiwaną cenę `26,39 zł` na `26,40 zł` tylko w asercji koszyka i uruchom test:
   ```powershell
   npx playwright test tests/cwiczenia/04-karta-produktu.spec.ts
   ```
   Oczekiwany wynik: `1 failed`, a w opisie błędu locator z koszyka. Cofnij zmianę ceny w asercji (z powrotem `26,39 zł`) i zapisz plik. Test uruchomisz w kroku 10, po sprzątaniu koszyka.

9. **Posprzątaj koszyk `tester11`.** Test padł przed usunięciem kremu, więc krem został w koszyku `tester11`. Zaloguj się w przeglądarce jako `tester11`, otwórz koszyk i kliknij „Usuń” przy kremie. Oczekiwany wynik: „Koszyk jest pusty.”.

10. **Uruchom test dwa razy i zapisz pracę.**
    ```powershell
    npx playwright test tests/cwiczenia/04-karta-produktu.spec.ts --repeat-each=2 --workers=1
    ```
    Oczekiwany wynik: `2 passed`. Zapisz pracę w git:
    ```powershell
    git add tests/cwiczenia
    git commit -m "Ćwiczenie 04b: cena promocyjna w trzech miejscach"
    ```
    Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 04b: cena promocyjna w trzech miejscach` (skrót będzie inny). Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

## Przykład wyniku

Ten sam przycisk dwa razy (inny produkt niż w ćwiczeniu). Pierwsza linia to selektor skopiowany z DevTools: psuje się, gdy zmieni się kolejność produktów albo kolumn. Druga to locator po review:
```ts
await page.locator('tbody > tr:nth-child(10) > td:nth-child(6) > form > button').click();
await page.getByRole('button', { name: 'Dodaj do koszyka: Pasta do zębów' }).click();
```
Wynik kroku 5a (fragment, czasy będą inne):
```
  3 skipped
  9 passed (3.3s)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/04- --repeat-each=3 --workers=1` daje `12 passed` (trzy scenariusze i 04b, każdy 3 razy).
- [ ] W czterech plikach nie ma `test.fixme`, `locator('…')` z CSS, `nth(`, `first()` ani `waitForTimeout`.
- [ ] Scenariusz C padał po zmianie oczekiwanego komunikatu, a 04b po zmianie ceny w koszyku. Oba przechodzą po przywróceniu.
- [ ] W 04b pokazujesz palcem, w obrębie jakiego elementu szukasz ceny na stronie produktów, i mówisz, co by znalazł locator bez tego zawężenia.

## Dla szybszych

> **Skończyłeś wcześniej**
> 1. Kod rabatowy: dopisz w `04-karta-produktu.spec.ts` drugi test na koncie `tester12` (hasło jak `tester11`). Dodaj krem do koszyka, wpisz kod `CZARNY20` w pole „Kod rabatowy”, kliknij „Zastosuj kod” i sprawdź komunikat „Kod CZARNY20 przyjęty: -20% na całe zamówienie.” oraz sumę do zapłaty po rabacie: 21,11 zł. Na końcu testu usuń kod i krem, a potem uruchom plik z `--repeat-each=2 --workers=1`.
> 2. Produkt niedostępny: trzeci test otwiera kartę „Serum z witaminą C” przez kafelek i sprawdza, że przycisk „Dodaj do koszyka” i pole „Ilość” są wyłączone.
> 3. Scenariusz A ma nazwę „pokazuje tylko produkty dla dzieci”. Sprawdź, czy twój test to udowadnia, czy tylko sprawdza, że trzy produkty są widoczne. Dopisz asercję, która liczy wiersze produktów, i porównaj ją z licznikiem „Liczba produktów”.
>
> Dłuższe zadania (przeglądarki, telefon, kody rabatowe z tabeli danych): gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Cztery działające testy w `tests/cwiczenia/04-*.spec.ts` w twoim repo i nawyk: każdy nagrany locator przechodzi review, a nazwa, która występuje na stronie dwa razy, dostaje zawężenie.

## Rozwiązanie wzorcowe

Gałąź `solution/04`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/04 -- tests/cwiczenia
```
