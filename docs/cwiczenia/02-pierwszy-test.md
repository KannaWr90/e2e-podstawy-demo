# Ćwiczenie 02. Test „dodanie produktu do koszyka” z Claude Code, raport i trace

Blok 1.2 · 40 min · w parach, zmiana ról co blok

## Cel

Uruchomisz test napisany z Claude Code, sprawdzisz w raporcie HTML i w trace, co test zrobił krok po kroku, a z komunikatu błędu odczytasz, która linia i które oczekiwanie nie zostały spełnione.

## Materiał wejściowy

- `tests/cwiczenia/02-koszyk.spec.ts`: szkielet testu z `test.fixme` i komentarzami TODO.
- `tests/przyklady/logowanie.spec.ts`: wzór logowania.
- `CLAUDE.md`: zasady pisania testów, które Claude Code czyta sam.
- Konto klienta: `user` / `user123`. Produkt: „Płyn micelarny”.

## Kroki

PowerShell, z folderu repo (`C:\e2e\e2e-podstawy-demo`).

1. **Uruchom szkielet.**
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 skipped`. Test oznaczony `test.fixme` jest pomijany.

2. **Napisz test z Claude Code.** Uruchom `claude` w folderze repo. Poproś o uzupełnienie testu w `tests/cwiczenia/02-koszyk.spec.ts` według komentarzy TODO. Zanim zaakceptujesz zmianę, przeczytaj ją: każdy TODO ma swoją linię kodu, w pliku nie ma już `test.fixme`, nie ma `waitForTimeout`.

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

5. **Zepsuj test celowo.** W asercji z komunikatem dopisz do oczekiwanego tekstu ` 400 ml`, tak żeby test oczekiwał „Dodano do koszyka: Płyn micelarny 400 ml”. Zapisz i uruchom:
   ```powershell
   npx playwright test tests/cwiczenia/02-koszyk.spec.ts
   ```
   Oczekiwany wynik: `1 failed` po ok. 5 s, a w opisie błędu:
   ```
   Error: expect(locator).toBeVisible() failed

   Locator: getByText('Dodano do koszyka: Płyn micelarny 400 ml')
   Expected: visible
   Timeout: 5000ms
   Error: element(s) not found
   ```
   Tak wygląda błąd, gdy test szuka komunikatu przez `getByText`. Jeśli Claude użył innego locatora albo `toHaveText`, pierwsze linie będą inne, ale znajdziesz w nich ten sam oczekiwany tekst z ` 400 ml`. Pod spodem fragment kodu ze znakiem `>` przy linii, która nie przeszła. Otwórz `npx playwright show-report`: przy nieudanym teście są zrzut ekranu i trace, tym razem bez `--trace on`. Na zrzucie znajdź komunikat, który aplikacja naprawdę pokazała.

6. **Przywróć test i zapisz pracę.** Usuń ` 400 ml`, uruchom test jeszcze raz (oczekiwany wynik `1 passed`), potem:
   ```powershell
   git add tests/cwiczenia/02-koszyk.spec.ts
   git commit -m "Ćwiczenie 02: test dodania produktu do koszyka"
   git push
   ```

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
- [ ] Test padał po dopisaniu ` 400 ml` i przechodzi po przywróceniu. Druga osoba z pary widziała oba wyniki.
- [ ] Pokazujesz palcem w opisie błędu: który locator, jakie oczekiwanie, ile czekał test i w której linii pliku.
- [ ] Umiesz powiedzieć własnymi słowami, co zmieniło się na stronie między **Before** i **After** przy kliknięciu „Dodaj do koszyka”.

## Dla szybszych

> **Skończyłeś wcześniej**
> Uruchom test trzy razy z rzędu: `npx playwright test tests/cwiczenia/02-koszyk.spec.ts --repeat-each=3`. Potem uruchom aplikację (`npm start`), zaloguj się jako `user` i otwórz koszyk. Zapisz w `notatki.md`: co test zostawia po sobie w aplikacji i jak to może przeszkodzić innemu testowi, który liczy pozycje w koszyku. Dopisz na końcu testu krok, który przywraca koszyk do stanu sprzed testu, i sprawdź `--repeat-each=3` jeszcze raz. Dłuższe zadania: gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Działający test `tests/cwiczenia/02-koszyk.spec.ts` w Twoim forku na GitHubie.

## Rozwiązanie wzorcowe

Gałąź `solution/02`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/02 -- tests/cwiczenia/02-koszyk.spec.ts
```
