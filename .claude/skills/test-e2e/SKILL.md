---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Nowy test E2E według zasad repo

Wejście od użytkownika: $ARGUMENTS

Pracuj w tej kolejności. Nie pomijaj kroków.

1. Przeczytaj `CLAUDE.md` i `docs/lista-kontrolna-review.md`. Jeśli wejście wskazuje plik przypadku testowego (np. `docs/scenariusze/*.md`), przeczytaj go.
2. Zapisz wymaganie jednym lub dwoma zdaniami. Jeśli czegoś w nim brakuje (konto, dane, oczekiwany tekst), zapytaj użytkownika.
3. Przejdź scenariusz w aplikacji http://localhost:4100 przez Playwright MCP, jeśli jest dostępny. Zapisz dokładne nazwy przycisków, etykiety pól i treść komunikatów. Bez MCP weź je z kodu w `app/`.
4. Pokaż plan w punktach: nazwa testu, konto, kroki, asercje z dokładnym tekstem, sprzątanie danych. Poczekaj na akceptację planu.
5. Napisz test w `tests/cwiczenia/` (albo w pliku wskazanym przez użytkownika). Nad testem komentarz „Wymaganie: …”.
6. Uruchom `npm run typecheck`, potem test dwa razy pod rząd: `npx playwright test <plik>`.
7. Zmień na chwilę oczekiwaną wartość w jednej asercji, uruchom test i pokaż, że pada. Przywróć wartość.
8. Przejdź `docs/lista-kontrolna-review.md` punkt po punkcie i wypisz wynik jako tabelę: pytanie, odpowiedź, linia.
9. Na koniec podaj polecenie, którym użytkownik uruchomi test w PowerShell.
