# Ćwiczenie 10. Zasady review w CLAUDE.md i pierwszy skill „test E2E”

Blok 2.6 · 25 min · w parach, zmiana ról co blok

## Cel

Umiesz zapisać zasady zespołu tak, żeby Claude stosował je bez przypominania: stałe reguły w `CLAUDE.md`, powtarzalną procedurę w skillu. Umiesz wywołać własny skill i sprawdzić jego wynik listą kontrolną.

## Materiał wejściowy

Wiadomość od Bożeny:

> Klaudiusz pisze test w 30 sekund, a potem my przez pół godziny robimy z nim review i co rano poprawiamy te same błędy. `CLAUDE.md` to jego instrukcja obsługi: czyta ją przed każdą pracą. Wpiszcie mu tam zasady, których chcę pilnować: test sprząta po sobie, sprawdza efekt biznesowy, a oczekiwane wartości biorą się z wymagania, nie ze strony. I niech przestanie pisać „jestem pewien”.

- `CLAUDE.md`: obecne zasady pisania testów w tym repo.
- `docs/lista-kontrolna-review.md`: lista kontrolna z ćwiczenia 05 (z twoim dopisanym pytaniem).
- Format skilla w Claude Code: folder `.claude/skills/<nazwa>/` z plikiem `SKILL.md`. Plik zaczyna się od nagłówka YAML między liniami `---` z polami `name` (nazwa polecenia po `/`) i `description` (co robi skill i kiedy go użyć; po tym opisie Claude sam decyduje, czy go wczytać). Pod nagłówkiem instrukcje w Markdown.

## Kroki

PowerShell, z katalogu głównego repo.

1. **Porównaj CLAUDE.md z listą kontrolną.** Przy każdym pytaniu z listy kontrolnej zaznacz, czy `CLAUDE.md` już je pokrywa. Oczekiwany wynik: lista pytań, których w `CLAUDE.md` brakuje (zwykle 8–10 z 15).

2. **Dopisz brakujące zasady do CLAUDE.md.** Dodaj sekcję `## Review i dane testowe`, najwyżej 8 punktów, każdy jednym zdaniem w trybie rozkazującym. Trzy zasady Bożeny z wiadomości muszą się w niej znaleźć. Możesz poprosić Claude o propozycję, ale każdy punkt zatwierdzacie sami.

3. **Utwórz skill.** Utwórz plik `.claude/skills/test-e2e/SKILL.md`. Nagłówek:
   ```markdown
   ---
   name: test-e2e
   description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
   ---
   ```
   Pod nagłówkiem wpisz procedurę w krokach, np.: przeczytaj przypadek testowy, przejdź scenariusz w aplikacji, pokaż plan i poczekaj na akceptację, napisz test, uruchom go dwa razy, pokaż, że test potrafi paść, przejdź listę kontrolną. Procedura to kolejność pracy. Zasady pisania kodu zostają w `CLAUDE.md`.

4. **Wywołaj skill.** Uruchom `claude` i wpisz `/`. Oczekiwany wynik: na liście poleceń jest `/test-e2e`. Jeśli go nie ma, a folder `.claude/skills` powstał przy włączonym Claude, wpisz `/reload-skills`. Potem:
   ```
   /test-e2e Filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty
   ```
   Uruchom test, który powstał. Oczekiwany wynik: `1 passed`. Zmień w teście oczekiwaną liczbę produktów z 3 na 4 i uruchom go jeszcze raz. Oczekiwany wynik: `1 failed`. Cofnij zmianę.

> **Jeśli utknąłeś po 10 minutach**
> Czy Claude zrobił wszystkie kroki procedury ze skilla? Jeśli pominął któryś, sprawdź, czy krok w `SKILL.md` jest poleceniem („Uruchom test dwa razy”), czy opisem („Testy powinny być stabilne”). Polecenia działają lepiej.

5. **Zrób review wyniku i porozmawiaj o udostępnianiu.** Przejdź nowy test listą kontrolną. Każde „nie” to poprawka w `SKILL.md` albo w `CLAUDE.md`. Potem w parze, 5 minut: gdyby ten skill trafił do firmowego marketplace skilli, kto byłby jego właścicielem? Jak zgłosicie poprawkę, gdy skill napisze zły test? Zapiszcie dwie odpowiedzi.

## Przykład wyniku

Fragment `CLAUDE.md` po kroku 2:
```markdown
## Review i dane testowe
- Każda asercja ma paść, gdy akcja testu się nie uda. Nie sprawdzaj elementów, które były widoczne przed akcją.
- Test, który zmienia dane, sprząta po sobie w `afterEach`.
```

## Kryterium „gotowe”

- [ ] `CLAUDE.md` ma nową sekcję z zasadami, które pokrywają brakujące pytania z kroku 1.
- [ ] Po wpisaniu `/` w Claude Code widać `/test-e2e`.
- [ ] Test napisany przez skill przechodzi (`1 passed`) i przeszedł review listą kontrolną. Pokazujesz drugiej osobie, jak padł po zmianie oczekiwanej liczby produktów.
- [ ] Macie zapisane dwie odpowiedzi o marketplace skilli.

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
