# Ćwiczenie 01. Własna kopia repo na GitHubie, zielone testy i pierwszy commit

Blok 1.1 · 30 min · w parach: każda osoba robi kroki na swoim laptopie, druga sprawdza wynik

## Cel

Założysz własną kopię repo (fork), uruchomisz w niej testy i wyślesz pierwszą zmianę na GitHub. Od tej chwili każdą swoją pracę zapisujesz w git i masz ją na GitHubie.

## Materiał wejściowy

- Repo: https://github.com/agentGreg/e2e-podstawy-demo
- `README.md` w repo: wymagania, instalacja, sekcja „Firmowe proxy”, sekcja „Problemy i rozwiązania”.
- Twoje konto GitHub, PowerShell, VS Code.

## Kroki

PowerShell. Każde polecenie w osobnej linii, zatwierdzone Enterem.

1. **Zrób fork repo.** Otwórz https://github.com/agentGreg/e2e-podstawy-demo, kliknij **Fork**. Na ekranie „Create a new fork” **odznacz** pole „Copy the `main` branch only” (potrzebujesz też gałęzi z rozwiązaniami) i kliknij **Create fork**.
   Oczekiwany wynik: strona `https://github.com/<twój-login>/e2e-podstawy-demo` z napisem „forked from agentGreg/e2e-podstawy-demo”.

2. **Sklonuj swój fork do folderu poza OneDrive.** `<twój-login>` zamień na swój login z GitHuba.
   ```powershell
   mkdir C:\e2e
   cd C:\e2e
   git clone https://github.com/<twój-login>/e2e-podstawy-demo.git
   cd e2e-podstawy-demo
   ```
   Oczekiwany wynik: `Cloning into 'e2e-podstawy-demo'...`, a po `cd` znak zachęty `PS C:\e2e\e2e-podstawy-demo>`.

3. **Zainstaluj zależności i przeglądarkę.**
   ```powershell
   npm ci
   npx playwright install chromium
   ```
   Oczekiwany wynik `npm ci`: `added 6 packages, and audited 7 packages in …` i `found 0 vulnerabilities`. `npx playwright install chromium` pobiera ok. 150 MB i kończy się bez słowa `Error`.

> **Jeśli utknąłeś po 10 minutach**
> Komunikat `running scripts is disabled on this system`: zamiast `npm` i `npx` wpisz `npm.cmd` i `npx.cmd`, np. `npm.cmd ci`. Komunikat z `ETIMEDOUT`, `ECONNRESET` albo `SELF_SIGNED_CERT_IN_CHAIN`: to firmowe proxy. Ustaw je według sekcji „Firmowe proxy” w `README.md`, w tym samym oknie PowerShell, i powtórz polecenie.

4. **Uruchom wszystkie testy.**
   ```powershell
   npm test
   ```
   Oczekiwany wynik na końcu:
   ```
     12 skipped
     20 passed (4.4s)
   ```
   Czas będzie inny. `skipped` to szkielety ćwiczeń, które wypełnisz później. Słowa `failed` być nie może.

5. **Zrób pierwszy commit i wyślij go na GitHub.** Otwórz folder w VS Code (`code .`), utwórz w głównym folderze repo plik `notatki.md` i wpisz w nim jedną linię: `Środowisko działa, npm test bez błędów.` Zapisz plik. Potem w PowerShell:
   ```powershell
   git add notatki.md
   git commit -m "Pierwszy commit: środowisko działa"
   git push
   ```
   Oczekiwany wynik `git commit`:
   ```
   [main 1a2b3c4] Pierwszy commit: środowisko działa
    1 file changed, 1 insertion(+)
    create mode 100644 notatki.md
   ```
   Skrót `1a2b3c4` będzie inny. Przy pierwszym `git push` otworzy się okno logowania do GitHuba. Oczekiwany wynik `git push` kończy się linią `main -> main`.

> **Git prosi o `user.name` i `user.email`**
> Komunikat `Please tell me who you are` przy `git commit` znaczy, że ten laptop jeszcze nie zna Twojego podpisu. Ustaw go raz i powtórz `git commit`:
> ```powershell
> git config --global user.name "Imię Nazwisko"
> git config --global user.email "login@users.noreply.github.com"
> ```
> Adres `…@users.noreply.github.com` znajdziesz na GitHubie w Settings › Emails.

6. **Sprawdź wynik na GitHubie.** Odśwież stronę swojego forka.
   Oczekiwany wynik: na liście plików jest `notatki.md`, a przy nim Twój opis commita „Pierwszy commit: środowisko działa”.

## Przykład wyniku

```
PS C:\e2e\e2e-podstawy-demo> git log --oneline -1
1a2b3c4 (HEAD -> main, origin/main, origin/HEAD) Pierwszy commit: środowisko działa
```

## Kryterium „gotowe”

- [ ] `git remote -v` pokazuje adres Twojego forka (`github.com/<twój-login>/…`), a nie `agentGreg`.
- [ ] `npm test` kończy się bez słowa `failed`.
- [ ] Druga osoba z pary widzi `notatki.md` na Twoim forku w przeglądarce.
- [ ] `git branch -r` pokazuje gałęzie `origin/solution/…` (fork ma też rozwiązania).

## Dla szybszych

> **Skończyłeś wcześniej**
> Uruchom aplikację (`npm start`) i otwórz http://localhost:4100. Zaloguj się jako `user` / `user123` i przejdź ręcznie ścieżkę: dodaj produkt do koszyka, otwórz koszyk, usuń produkt. Zatrzymaj aplikację `Ctrl+C`. Potem `npm run test:smoke` (oczekiwany wynik `2 passed`) i porównaj, który z testów dymnych sprawdza fragment tej ścieżki. Dłuższe zadania na dzień 1: gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Twój fork na GitHubie z pierwszym commitem `notatki.md`. W nim będziesz zapisywać wszystkie kolejne ćwiczenia.

## Rozwiązanie wzorcowe

Brak. To ćwiczenie sprawdza lista „gotowe”.
