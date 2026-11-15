# Ćwiczenie 01. Repo Namssor na twoim laptopie: zielone testy i pierwszy commit

Blok 1.1 · 15 min · w parach: każda osoba robi kroki na swoim laptopie, druga sprawdza wynik

## Cel

Uruchomisz testy repo Namssor na swoim laptopie i zapiszesz w nim pierwszą zmianę. Od tej chwili każde ćwiczenie kończysz commitem.

## Materiał wejściowy

> **Od Bożeny, product ownerki Namssor:** Witaj w zespole automatyzacji Namssor! W piątek 27.11 startuje Czarny Piątek, a w środę 18.11 o 16:00 zamrażamy kod. Ręczna regresja trwa trzy dni, których nie mamy, więc tym razem testy mają biec same. Na dobry początek weź repo i sprawdź, czy u ciebie też świeci się na zielono.

- Repo: https://github.com/agentGreg/e2e-podstawy-demo
- `README.md` w repo: wymagania, instalacja, sekcje „Firmowe proxy” i „Problemy i rozwiązania”.
- PowerShell, VS Code. Konto GitHub przydaje się, ale nie jest konieczne.

## Kroki

Na zajęciach pracujesz w trzech oknach PowerShell, każde otwarte w folderze repo. **Okno aplikacji**: tu działa `npm start`. **Okno testów**: tu wpisujesz `npx playwright …` i `git …`. **Okno Claude**: tu działa `claude`. W tym ćwiczeniu wystarczy okno testów. Każde polecenie wpisz w osobnej linii i zatwierdź Enterem.

1. **Pobierz repo do folderu poza OneDrive.** Repo to folder projektu razem z historią wszystkich zmian. Wybierz jedną ścieżkę.

   **A. Masz konto GitHub. Zrobisz fork, czyli własną kopię repo na swoim koncie.** Otwórz https://github.com/agentGreg/e2e-podstawy-demo i kliknij **Fork**. Na ekranie „Create a new fork” **odznacz** pole „Copy the `main` branch only”, bo potrzebujesz też gałęzi z rozwiązaniami. Gałąź to osobna wersja plików w tym samym repo. Kliknij **Create fork**. Potem sklonuj fork, czyli pobierz jego kopię na laptop. `<twój-login>` zamień na swój login z GitHuba:
   ```powershell
   New-Item -ItemType Directory -Force C:\e2e
   cd C:\e2e
   git clone https://github.com/<twój-login>/e2e-podstawy-demo.git
   cd e2e-podstawy-demo
   ```

   **B. Nie masz konta GitHub. Sklonujesz repo trenera, czyli pobierzesz jego kopię na laptop.**
   ```powershell
   New-Item -ItemType Directory -Force C:\e2e
   cd C:\e2e
   git clone https://github.com/agentGreg/e2e-podstawy-demo.git
   cd e2e-podstawy-demo
   ```
   `New-Item` wypisuje tabelkę z folderem `e2e`. Gdy folder już istnieje, polecenie też działa i niczego w nim nie usuwa. Oczekiwany wynik w obu ścieżkach: `Cloning into 'e2e-podstawy-demo'...`, a po `cd` znak zachęty `PS C:\e2e\e2e-podstawy-demo>`.

2. **Zainstaluj zależności i przeglądarkę.**
   ```powershell
   npm ci
   npx playwright install chromium
   ```
   Oczekiwany wynik `npm ci`: `added 6 packages, and audited 7 packages in …` i `found 0 vulnerabilities`. `npx playwright install chromium` pobiera ok. 150 MB i kończy się bez słowa `Error`.

> **Jeśli polecenie kończy się błędem**
> Komunikat `running scripts is disabled on this system`: zamiast `npm` i `npx` wpisz `npm.cmd` i `npx.cmd`, np. `npm.cmd ci`. Komunikat z `ETIMEDOUT`, `ECONNRESET` albo `SELF_SIGNED_CERT_IN_CHAIN`: to firmowe proxy. Ustaw je według sekcji „Firmowe proxy” w `README.md`, w tym samym oknie PowerShell, i powtórz polecenie.

3. **Uruchom wszystkie testy.**
   ```powershell
   npm test
   ```
   Oczekiwany wynik na końcu:
   ```
     18 skipped
     38 passed (4.4s)
   ```
   Czas będzie inny. `skipped` to szkielety ćwiczeń, które wypełnisz później. Słowa `failed` być nie może.

4. **Otwórz repo w VS Code.**
   ```powershell
   code .
   ```
   Oczekiwany wynik: okno VS Code z plikami repo w panelu po lewej, m.in. `README.md`. Jeśli PowerShell nie zna polecenia `code`, uruchom VS Code z menu Start i wybierz File › Open Folder… › `C:\e2e\e2e-podstawy-demo`.

5. **Utwórz plik `notatki.md`.** W VS Code utwórz w głównym folderze repo plik `notatki.md`, wpisz w nim jedną linię: `Środowisko działa, npm test bez błędów.` i zapisz plik (`Ctrl+S`).

6. **Zapisz zmianę w git.** Commit to zapisana wersja plików, do której da się wrócić. W oknie testów:
   ```powershell
   git add notatki.md
   git commit -m "Pierwszy commit: środowisko działa"
   ```
   Oczekiwany wynik:
   ```
   [main 1a2b3c4] Pierwszy commit: środowisko działa
    1 file changed, 1 insertion(+)
    create mode 100644 notatki.md
   ```
   Skrót `1a2b3c4` będzie inny.

> **Git prosi o `user.name` i `user.email`**
> Komunikat `Please tell me who you are` przy `git commit` znaczy, że ten laptop jeszcze nie zna twojego podpisu. Ustaw go raz i powtórz `git commit`:
> ```powershell
> git config --global user.name "Imię Nazwisko"
> git config --global user.email "login@users.noreply.github.com"
> ```
> Bez konta GitHub wpisz dowolny adres, np. służbowy. Z kontem: adres `…@users.noreply.github.com` znajdziesz na GitHubie w Settings › Emails.

7. **Tylko ścieżka A: wyślij commit na swój fork.** `git push` wysyła commity z laptopa na GitHub.
   ```powershell
   git push
   ```
   Oczekiwany wynik: przy pierwszym pushu otworzy się okno logowania do GitHuba, a wynik kończy się linią `main -> main`. Ścieżka B pomija ten krok. Do repo trenera nie masz prawa zapisu, więc commity zostają na twoim laptopie.

## Przykład wyniku

```
PS C:\e2e\e2e-podstawy-demo> git log --oneline -1
1a2b3c4 (HEAD -> main, origin/main, origin/HEAD) Pierwszy commit: środowisko działa
```
Tak wygląda ścieżka A po `git push`. W ścieżce B w nawiasie jest tylko `HEAD -> main`, bo commit nie wyszedł z laptopa.

## Kryterium „gotowe”

- [ ] `npm test` kończy się bez słowa `failed`, a druga osoba z pary widzi na twoim ekranie `38 passed`.
- [ ] `git log --oneline -1` pokazuje commit „Pierwszy commit: środowisko działa”.
- [ ] `git branch -r` pokazuje gałęzie `origin/solution/…` i `origin/extra/…`.
- [ ] Ścieżka A: `git remote -v` pokazuje adres twojego forka (`github.com/<twój-login>/…`), a druga osoba widzi `notatki.md` na twoim forku w przeglądarce.

## Dla szybszych

> **Skończyłeś wcześniej**
> Otwórz drugie okno PowerShell w folderze repo (okno aplikacji) i uruchom w nim aplikację: `npm start`. Otwórz http://localhost:4100. Zaloguj się jako `user` / `user123` i przejdź ręcznie ścieżkę klienta Czarnego Piątku: kafelek „Krem do twarzy na dzień” pod tabelą produktów, karta produktu, „Dodaj do koszyka”, koszyk, kod rabatowy `CZARNY20`. Zapisz w `notatki.md`, w ilu miejscach widzisz cenę kremu i jaką. Zatrzymaj aplikację w oknie aplikacji: `Ctrl+C`. Potem w oknie testów uruchom `npm run test:smoke` (oczekiwany wynik `4 passed`) i znajdź test dymny, który sprawdza fragment tej ścieżki. Dłuższe zadania na dzień 1: gałąź `extra/d1-przegladarki-i-dane`.

## Artefakt do zabrania

Repo z pierwszym commitem `notatki.md`: w ścieżce A na twoim forku na GitHubie, w ścieżce B na laptopie. W nim zapisujesz wszystkie kolejne ćwiczenia.

## Rozwiązanie wzorcowe

Brak. Wynik sprawdzasz z listą „gotowe”.
