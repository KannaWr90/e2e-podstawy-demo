# Ćwiczenie 02. Test „produkt w promocji w koszyku” z Claude Code, raport i trace

Blok 1.2 · 40 min · w parach, zmiana ról co blok

## Cel

Uruchomisz test napisany z Claude Code. W raporcie HTML i w trace sprawdzisz, co test zrobił krok po kroku. Z komunikatu błędu odczytasz, która linia i które oczekiwanie nie zostały spełnione.

## Materiał wejściowy

> **Od Bożeny:** Promocja w koszyku musi działać. Klient dodaje „Krem do twarzy na dzień” i ma w koszyku zobaczyć 26,39 zł, a nie 32,99 zł. Mirek mówi, że u niego działa. Poproszę test, który powie to za Mirka.

- `tests/cwiczenia/02-koszyk.spec.ts`: szkielet testu z `test.fixme` i komentarzami TODO.
- `tests/przyklady/logowanie.spec.ts`: wzór logowania.
- `CLAUDE.md`: zasady pisania testów, które Claude Code czyta sam.
- Konto klienta: `user` / `user123`. Produkt: „Krem do twarzy na dzień”, cena regularna 32,99 zł, cena promocyjna 26,39 zł.
- Uwaga: pod tabelą produktów są kafelki z tymi samymi nazwami i cenami. `getByText('Krem do twarzy na dzień')` znajdzie dwa elementy (komórkę tabeli i kafelek). Produkt szukaj w obrębie tabeli: `page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' })` albo przycisk `getByRole('button', { name: 'Dodaj do koszyka: Krem do twarzy na dzień' })`.

> **Słowniczek**
> - locator: sposób wskazania elementu strony, np. `page.getByRole('button', { name: 'Zaloguj' })`.
> - asercja: linia z `expect`, która sprawdza, czy na stronie jest to, czego oczekujesz. Gdy nie jest, test pada.
> - trace: nagranie przebiegu testu. Dla każdego kroku pokazuje stan strony przed nim i po nim.

## Kroki

PowerShell, z folderu repo (`C:\e2e\e2e-podstawy-demo`). Polecenia `npx` i `git` wpisujesz w oknie testów.

1. **Uruchom szkielet.**
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 skipped`. Test oznaczony `test.fixme` jest pomijany.

2. **Napisz test z Claude Code.**

   a) Otwórz drugie okno PowerShell w folderze repo (okno Claude) i uruchom w nim Claude Code:
   ```powershell
   cd C:\e2e\e2e-podstawy-demo
   claude
   ```
   Oczekiwany wynik: ekran powitalny Claude Code z polem do wpisania prośby. Polecenia `npx` wpisuj dalej w oknie testów.

   b) Poproś o uzupełnienie testu w `tests/cwiczenia/02-koszyk.spec.ts` według komentarzy TODO.

   c) Zanim zaakceptujesz zmianę, sprawdź cztery rzeczy:
   - każdy TODO ma swoją linię kodu,
   - w pliku nie ma już `test.fixme`,
   - w pliku nie ma `waitForTimeout`,
   - cena 26,39 zł jest sprawdzana w wierszu kremu w koszyku.

> **Jeśli utknąłeś po 10 minutach**
> Wklej do Claude Code ten prompt:
> ```
> Uzupełnij test w pliku tests/cwiczenia/02-koszyk.spec.ts według komentarzy TODO.
> Logowanie zrób tak jak w tests/przyklady/logowanie.spec.ts. Stosuj zasady z CLAUDE.md.
> Zamień test.fixme na test. Nie zmieniaj żadnego innego pliku.
> Potem uruchom: npx playwright test tests/cwiczenia/02-koszyk.spec.ts
> i pokaż mi wynik. Na końcu wyjaśnij każdą linię testu jednym zdaniem po polsku.
> ```

3. **Uruchom test z nagraniem przebiegu.**
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts --trace on
   ```
   Oczekiwany wynik: `1 passed`.

4. **Otwórz raport HTML i trace.**
   ```powershell
   npx playwright show-report
   ```
   Oczekiwany wynik w terminalu: `Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.` i raport w przeglądarce. Kliknij nazwę testu. W sekcji „Test Steps” policz kroki i znajdź klik w „Dodaj do koszyka”. Kliknij **View Trace**. W trace wybierz po lewej ten sam klik i przełączaj zakładki **Before** i **After**: widać stronę przed kliknięciem i po nim. Zamknij raport w terminalu `Ctrl+C`.

5. **Zepsuj test celowo.** W linii z `expect`, która sprawdza komunikat „Dodano do koszyka: Krem do twarzy na dzień”, dopisz do oczekiwanego tekstu ` 50 ml`, tak żeby test oczekiwał „Dodano do koszyka: Krem do twarzy na dzień 50 ml”. Zapisz plik i uruchom test:
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 failed` po ok. 5 s, a w opisie błędu:
   ```
   Error: expect(locator).toBeVisible() failed

   Locator: getByText('Dodano do koszyka: Krem do twarzy na dzień 50 ml')
   Expected: visible
   Timeout: 5000ms
   Error: element(s) not found
   ```
   Tak wygląda błąd, gdy test szuka komunikatu przez `getByText`. Jeśli Claude użył innego locatora albo `toHaveText`, pierwsze linie będą inne, ale znajdziesz w nich ten sam oczekiwany tekst z ` 50 ml`. Pod spodem jest fragment kodu ze znakiem `>` przy linii, która nie przeszła.

6. **Obejrzyj nieudany test w raporcie.**
   ```powershell
   npx playwright show-report
   ```
   Oczekiwany wynik: przy nieudanym teście są zrzut ekranu i trace, tym razem bez `--trace on`. Na zrzucie znajdź komunikat, który aplikacja naprawdę pokazała. Zamknij raport w terminalu `Ctrl+C`.

7. **Przywróć test i zapisz pracę.** Usuń ` 50 ml` z linii z `expect`, zapisz plik i uruchom test jeszcze raz:
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 passed`. Zapisz pracę w git:
   ```powershell
   git add tests/cwiczenia/02-koszyk.spec.ts
   git commit -m "Ćwiczenie 02: produkt w promocji w koszyku"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 02: produkt w promocji w koszyku` (skrót będzie inny). Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

## Przykład wyniku

Raport HTML, sekcja „Test Steps” dla przechodzącego testu (fragment, czasy będą inne):
```
Navigate /logowanie
Fill "user" getByLabel('Login')
Fill "user123" getByLabel('Hasło')
Click getByRole('button', { name: 'Zaloguj' })
…
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/cwiczenia/02-koszyk.spec.ts` daje `1 passed`, a w pliku nie ma `test.fixme`.
- [ ] Test padał po dopisaniu ` 50 ml` i przechodzi po przywróceniu. Druga osoba z pary widziała oba wyniki.
- [ ] Pokazujesz palcem w opisie błędu: który locator, jakie oczekiwanie, ile czekał test i w której linii pliku.
- [ ] Pokazujesz palcem linię, która sprawdza cenę 26,39 zł, i mówisz, w którym elemencie strony test jej szuka.

## Dla szybszych

> **Skończyłeś wcześniej**
> Zamień w asercji ceny `26,39 zł` na starą cenę `32,99 zł` i uruchom test. Jeśli nadal jest zielony, zapisz w `notatki.md`, dlaczego (podpowiedź: co jeszcze jest w wierszu kremu w koszyku). Napisz asercję, która pada przy `32,99 zł`, a przechodzi przy `26,39 zł`, i sprawdź oba przypadki. Potem uruchom test trzy razy z rzędu: `npx playwright test tests/cwiczenia/02-koszyk.spec.ts --repeat-each=3` i zobacz w aplikacji, co zostaje w koszyku konta `user`. Dłuższe zadania: gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Działający test `tests/cwiczenia/02-koszyk.spec.ts` w twoim repo.

## Rozwiązanie wzorcowe

Gałąź `solution/02`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/02 -- tests/cwiczenia/02-koszyk.spec.ts
```
