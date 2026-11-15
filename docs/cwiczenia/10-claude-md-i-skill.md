# Ćwiczenie 10. Zasady review w CLAUDE.md i pierwszy skill „test E2E”

Blok 2.6 · 25 min · w parach, zmiana ról co blok

## Cel

Umiesz zapisać zasady zespołu tak, żeby Claude stosował je bez przypominania: stałe reguły w `CLAUDE.md`, powtarzalną procedurę w skillu. Umiesz wywołać własny skill i sprawdzić jego wynik listą kontrolną.

## Materiał wejściowy

Wiadomość od Bożeny:

> Klaudiusz pisze test w 30 sekund, a potem my przez pół godziny robimy z nim review i co rano poprawiamy te same błędy. `CLAUDE.md` to jego instrukcja obsługi: czyta ją przed każdą pracą. Wpiszcie mu tam zasady, których chcę pilnować: test sprząta po sobie, sprawdza efekt biznesowy, a oczekiwane wartości biorą się z wymagania, nie ze strony. I niech przestanie pisać „jestem pewien”.

- `CLAUDE.md`: obecne zasady pisania testów w tym repo.
- `docs/lista-kontrolna-review.md`: lista kontrolna z ćwiczenia 05 (z twoim dopisanym pytaniem).
- Format skilla w Claude Code: folder `.claude/skills/<nazwa>/` z plikiem `SKILL.md`. Na górze pliku, między dwiema liniami `---`, są dwa pola. `name` to nazwa polecenia po `/`. `description` mówi, co skill robi i kiedy go użyć. Po tym opisie Claude sam decyduje, czy go wczytać. Pod drugą linią `---` są instrukcje w Markdown.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx playwright …` i `git …` wpisujesz w oknie testów, `claude` działa w oknie Claude.

1. **Porównaj CLAUDE.md z listą kontrolną.** Przy każdym pytaniu z listy kontrolnej zaznacz, czy w `CLAUDE.md` jest już zasada na ten temat. Oczekiwany wynik: lista pytań, których w `CLAUDE.md` brakuje (zwykle 8–10 z 15).

2. **Dopisz brakujące zasady do CLAUDE.md.** Dodaj sekcję `## Review i dane testowe`, najwyżej 8 punktów, każdy jednym zdaniem w trybie rozkazującym. Trzy zasady Bożeny z wiadomości muszą się w niej znaleźć. Możesz poprosić Claude o propozycję, ale każdy punkt zatwierdzasz sam.

3. **Utwórz skill.** W VS Code wybierz File › New File… i wpisz całą ścieżkę `.claude/skills/test-e2e/SKILL.md`. Wpisz nagłówek:
   ```markdown
   ---
   name: test-e2e
   description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
   ---
   ```
   Pod nagłówkiem wpisz procedurę jako listę numerowaną, np.:
   1. Przeczytaj przypadek testowy.
   2. Przejdź scenariusz w aplikacji.
   3. Pokaż plan i poczekaj na akceptację.
   4. Napisz test.
   5. Uruchom go dwa razy.
   6. Pokaż, że test potrafi paść.
   7. Przejdź listę kontrolną.

   Procedura to kolejność pracy. Zasady pisania kodu zostają w `CLAUDE.md`.

4. **Sprawdź, że Claude widzi skill.** W oknie Claude uruchom `claude` (jeśli jeszcze nie działa) i wpisz `/`. Oczekiwany wynik: na liście poleceń jest `/test-e2e`. Jeśli go nie ma, a Claude był już uruchomiony, gdy tworzyłeś folder `.claude/skills`, wpisz `/reload-skills`.

5. **Wywołaj skill i uruchom test.** W oknie Claude wpisz:
   ```
   /test-e2e Filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty
   ```
   Na końcu Claude poda polecenie do uruchomienia testu. W oknie testów uruchom test tym poleceniem. W rozwiązaniu wzorcowym plik nazywa się tak (jeśli twój ma inną nazwę, wpisz ją):
   ```powershell
   npx playwright test tests/cwiczenia/10-filtr-kategorii.spec.ts
   ```
   Oczekiwany wynik: `1 passed`. Zmień w teście oczekiwaną liczbę produktów z 3 na 4 i uruchom go jeszcze raz. Oczekiwany wynik: `1 failed`. Przywróć liczbę 3 i uruchom test jeszcze raz. Oczekiwany wynik: `1 passed`.

> **Jeśli utknąłeś po 10 minutach**
> Czy Claude zrobił wszystkie kroki procedury ze skilla? Jeśli pominął któryś, sprawdź, czy krok w `SKILL.md` jest poleceniem („Uruchom test dwa razy”), czy opisem („Testy powinny być stabilne”). Polecenia działają lepiej.

6. **Zrób review nowego testu.** Przejdź nowy test listą kontrolną. Każde „nie” to poprawka w `SKILL.md` albo w `CLAUDE.md`.

7. **Porozmawiaj w parze o udostępnianiu skilla (5 minut).** Marketplace skilli to wspólne firmowe miejsce, z którego cały zespół instaluje te same skille. Odpowiedz na dwa pytania. Gdyby ten skill tam trafił, kto byłby jego właścicielem? Jak zgłosisz poprawkę, gdy skill napisze zły test? Zapisz obie odpowiedzi.

8. **Zapisz pracę w git.** W oknie testów wpisz:
   ```powershell
   git add .
   git commit -m "Ćwiczenie 10: zasady review w CLAUDE.md i skill test-e2e"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Ćwiczenie 10: zasady review w CLAUDE.md i skill test-e2e` (skrót będzie inny), a `git status` pokazuje potem `nothing to commit, working tree clean`. Jeśli masz fork (ścieżka A z ćwiczenia 01), wpisz jeszcze `git push`.

## Przykład wyniku

Fragment `CLAUDE.md` po kroku 2:
```markdown
## Review i dane testowe
- Każda asercja ma paść, gdy akcja testu się nie uda. Nie sprawdzaj elementów, które były widoczne przed akcją.
- Test, który zmienia dane, sprząta po sobie w `afterEach`.
```

## Kryterium „gotowe”

- [ ] `CLAUDE.md` ma sekcję `## Review i dane testowe` z najwyżej 8 punktami. Wśród nich są trzy zasady Bożeny: test sprząta po sobie, sprawdza efekt biznesowy, oczekiwane wartości biorą się z wymagania.
- [ ] Po wpisaniu `/` w Claude Code widać `/test-e2e`.
- [ ] Test napisany przez skill przechodzi (`1 passed`) i przeszedł review listą kontrolną. Pokazujesz drugiej osobie, jak padł po zmianie oczekiwanej liczby produktów.
- [ ] Masz zapisane dwie odpowiedzi o marketplace skilli z kroku 7.

## Dla szybszych

> **Skończyłeś wcześniej**
> Napisz drugi skill, `review-testu`, który robi review wskazanego pliku według `docs/lista-kontrolna-review.md` i zwraca tabelę z ćwiczenia 05. Wypróbuj go na `tests/review/02-moje-zamowienia.spec.ts` i porównaj z twoim review. Dłuższe zadania: gałąź `extra/d2-iframe-dialog-pliki`.

## Artefakt do zabrania

`CLAUDE.md` z zasadami review i `.claude/skills/test-e2e/SKILL.md`. Oba pliki przeniesiesz do repo testów w swoim zespole.

## Rozwiązanie wzorcowe

Gałąź `solution/10`, pokazywana po ćwiczeniu:
```powershell
git fetch origin
git diff main origin/solution/10 -- CLAUDE.md .claude/skills tests/cwiczenia/10-filtr-kategorii.spec.ts
```
