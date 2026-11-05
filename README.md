# Namssor: pierwsze testy automatyczne w Playwright

Repo do warsztatu „Od testów manualnych do automatycznych: Playwright i TypeScript z Claude Code”.

W środku jest aplikacja **Namssor**, fikcyjna drogeria internetowa: sklep, panel administratora i API. Na niej piszemy, czytamy i poprawiamy testy. Aplikacja i jej dane są przykładowe, żadne dane nie trafiają poza Twój komputer.

## Wymagania

| Program | Wersja | Sprawdzenie w PowerShell |
|---|---|---|
| Node.js | LTS, co najmniej 22.13 (zalecany 24) | `node -v` |
| Git | dowolna aktualna | `git --version` |
| Visual Studio Code | dowolna aktualna | |

Node pobierzesz z https://nodejs.org (wersja LTS). Na laptopie firmowym zwykle instaluje go dział IT.

## Instalacja (PowerShell)

Każde polecenie wpisz w osobnej linii i zatwierdź Enterem. Folder `C:\e2e` to przykład. Wybierz folder **poza OneDrive** (powód w sekcji „Problemy”).

```powershell
mkdir C:\e2e
cd C:\e2e
git clone <adres repo od trenera> e2e-podstawy-demo
cd e2e-podstawy-demo
npm ci
npx playwright install chromium
```

`npm ci` instaluje Playwright i TypeScript w folderze `node_modules`. `npx playwright install chromium` pobiera przeglądarkę, którą sterują testy (ok. 150 MB).

Sprawdzenie, że wszystko działa:

```powershell
npm run test:smoke
```

Wynik `2 passed` oznacza, że środowisko jest gotowe.

## Uruchomienie aplikacji

```powershell
npm start
```

Otwórz http://localhost:4100. Aplikacja działa, dopóki okno terminala jest otwarte. Zatrzymasz ją klawiszami `Ctrl+C`.

Testy nie wymagają ręcznego uruchamiania aplikacji: Playwright sam ją włącza przed testami i wyłącza po nich. Jeśli aplikacja już działa w innym oknie, Playwright jej użyje.

## Uruchomienie testów

| Polecenie | Co robi |
|---|---|
| `npm test` | wszystkie testy w przeglądarce Chromium |
| `npm run test:smoke` | tylko testy dymne (oznaczone `@smoke`) |
| `npx playwright test tests/przyklady/logowanie.spec.ts` | jeden plik |
| `npx playwright test --headed` | z widocznym oknem przeglądarki |
| `npx playwright test --ui` | tryb UI: lista testów, podgląd kroków, ponowne uruchamianie |
| `npx playwright show-report` | raport HTML z ostatniego przebiegu |
| `npm run typecheck` | sprawdzenie kodu TypeScript bez uruchamiania testów |

Po nieudanym teście w folderze `test-results` zostaje nagranie przebiegu (trace). Otworzysz je z raportu HTML.

## Dane i konta demo

Konta są fikcyjne i istnieją tylko w lokalnej bazie:

| Rola | Login | Hasło |
|---|---|---|
| klient | `user` | `user123` |
| administrator | `admin` | `admin123` |

Baza to plik `data/app.db`, tworzony przy pierwszym uruchomieniu. Zawiera 20 produktów (trzy niedostępne) i zamówienia `ZAM-1001` do `ZAM-1006`. Przywrócenie stanu startowego:

```powershell
npm run db:reset
```

Polecenie działa tylko przy zatrzymanej aplikacji. Jeśli aplikacja działa, `db:reset` odmówi i podpowie, co zrobić.

## Mapa ekranów

| Adres | Co tam jest | Do czego na szkoleniu |
|---|---|---|
| `/` | Produkty: wyszukiwarka, kategorie, „Dodaj do koszyka”, produkty niedostępne | pierwsze testy, wybór lokatorów |
| `/logowanie` | Logowanie z komunikatem o błędzie | pierwszy test, `getByLabel`, `getByRole` |
| `/koszyk` | Koszyk, suma, „Złóż zamówienie” | scenariusz od produktu do zamówienia |
| `/zamowienia` | Moje zamówienia: lista ładuje się 0,5–2 s ze wskaźnikiem „Ładowanie…”; komunikat po złożeniu zamówienia znika po kilku sekundach | czekanie na elementy, asercje |
| `/konto/adres` | Zmiana adresu dostawy, walidacja po stronie serwera, błędy przy polach | formularze, komunikaty błędów |
| `/admin/zamowienia` | Tabela zamówień: wyszukiwarka, „Anuluj” w każdym wierszu, id wierszy zmienia się przy każdym odświeżeniu | znajdowanie wiersza po treści |
| `/admin/ustawienia` | Tryb konserwacji sklepu | stan globalny aplikacji |
| `/api/docs` | Lista endpointów API (opis OpenAPI: `/api/openapi.json`) | testy API |
| `/admin/zamowienia/potwierdzenie` | Anulowanie z oknem „Tak, anuluj / Wróć” | dla szybszych: okno dialogowe |
| `/koszyk/platnosc` | Bramka płatnicza w ramce (iframe) | dla szybszych: ramki |
| `/regulamin` | Link „Regulamin” w stopce otwiera nową kartę | dla szybszych: nowa karta |
| `/admin/zamowienia` | Link „Eksportuj do CSV” | dla szybszych: pobieranie pliku |
| `/admin/produkty` | Dodawanie produktu i import z pliku CSV (`tests/dane/produkty.csv`) | dla szybszych: wysyłanie pliku |

Karty do płatności w ramce: `4111 1111 1111 1111` (płatność przyjęta), `4000 0000 0000 0002` (odrzucona).

## Struktura repo

```
app/                  aplikacja Namssor (nie trzeba jej czytać, żeby pisać testy)
  server.mjs          start aplikacji
  sklep.mjs           strony sklepu
  admin.mjs           panel admina
  api.mjs             REST API
  openapi.json        opis API
tests/                testy Playwright
  smoke.spec.ts       testy dymne
  przyklady/          pierwsze przykłady z komentarzami
  api/                testy API
  dane/               pliki do testów (np. CSV do importu)
scripts/              pomocnicze skrypty (db:reset, sprawdzenie wersji Node)
playwright.config.ts  konfiguracja Playwright
CLAUDE.md             zasady pisania testów dla Claude Code
```

## Firmowe proxy

Jeśli `npm ci` albo `npx playwright install` kończy się błędem sieci (`ETIMEDOUT`, `ECONNRESET`, `SELF_SIGNED_CERT_IN_CHAIN`), ustaw proxy w tym samym oknie PowerShell. Adres proxy i plik certyfikatu poda dział IT.

```powershell
$env:HTTPS_PROXY = "http://proxy.firma.local:8080"
$env:HTTP_PROXY = "http://proxy.firma.local:8080"
$env:NO_PROXY = "localhost,127.0.0.1"
$env:NODE_EXTRA_CA_CERTS = "C:\certyfikaty\firma-ca.pem"
npm config set proxy http://proxy.firma.local:8080
npm config set https-proxy http://proxy.firma.local:8080
npm config set cafile "C:\certyfikaty\firma-ca.pem"
```

Zmienne `$env:` działają tylko w bieżącym oknie. `NO_PROXY` z `localhost` jest ważne: testy łączą się z aplikacją na Twoim komputerze i nie powinny iść przez proxy.

## Problemy i rozwiązania

**`npm : File ... npm.ps1 cannot be loaded because running scripts is disabled`**
PowerShell blokuje skrypty. Użyj `npm.cmd` zamiast `npm` (np. `npm.cmd ci`) albo uruchom raz:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Repo w OneDrive albo na dysku sieciowym.** Baza SQLite i synchronizacja OneDrive przeszkadzają sobie nawzajem (blokady pliku, pliki tymczasowe bazy). Sklonuj repo do folderu lokalnego, np. `C:\e2e`. Jeśli to niemożliwe, przenieś samą bazę:
```powershell
$env:APP_DB_PATH = "C:\Temp\namssor.db"
```

**Spacja albo polskie znaki w ścieżce** (`C:\Users\Jan Kowalski\...`) są obsługiwane. Jeśli coś mimo to nie działa, spróbuj w `C:\e2e`.

**`Port 4100 jest zajęty`.** Aplikacja działa już w innym oknie. Znajdź to okno i zamknij aplikację `Ctrl+C`. Kto używa portu:
```powershell
Get-NetTCPConnection -LocalPort 4100
```

**Dziwne dane po ćwiczeniach** (anulowane zamówienia, nowe produkty). Zatrzymaj aplikację i uruchom `npm run db:reset`.

## Dla trenera

- **Loginy i hasła są wpisane w testach wprost. To celowe.** Ćwiczenie dnia 3 („porządek w projekcie”) przenosi je do zmiennych środowiskowych. Nazwy zmiennych są w `.env.example` (`APP_USER`, `APP_PASSWORD`, `APP_ADMIN_USER`, `APP_ADMIN_PASSWORD`); `.env` jest w `.gitignore`. Playwright sam nie czyta pliku `.env`. Bez dodatkowej biblioteki wystarczy w `playwright.config.ts` wywołać `process.loadEnvFile()` (Node ≥ 20.12), np. warunkowo, gdy plik istnieje.
- Przed każdym dniem: zatrzymać aplikację, `npm run db:reset`. Testy anulowania i importu zmieniają dane.
- Jedyny port to 4100 (`APP_PORT` zmienia go w aplikacji, ale `playwright.config.ts` ma 4100 wpisany na stałe).
- Opóźnienie listy „Moje zamówienia” daje `GET /api/orders?opoznienie=1` (0,5–2 s). Bez parametru API odpowiada od razu.
- Komunikat „flash” (`data-testid="flash"`) znika po 3–5 s. Komunikat sukcesu na `/konto/adres` (`data-testid="success"`) zostaje.
- W tabeli `/admin/zamowienia` wiersze nie mają `data-testid`, a `id="row-…"` jest losowe przy każdym renderze. Przyciski mają tylko tekst „Anuluj”, bez numeru w `aria-label`. Wiersz znajdziemy przez `getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Firefox i WebKit są w konfiguracji z `default: false`: `npx playwright install firefox`, potem `npx playwright test --project=firefox`.
- `.mcp.json` dodaje Playwright MCP (`@playwright/mcp@latest`) dla Claude Code. Jeśli na Windows serwer MCP się nie uruchamia, zamień `"command": "npx"` na `"command": "cmd"` i dodaj `"/c", "npx"` na początku `args`.
- Gałęzie z rozwiązaniami i karty ćwiczeń dojdą w kolejnym kroku przygotowań.

- Testy bezpieczeństwa aplikacji (zepsute ciasteczko, przekierowanie po logowaniu) są w `tests/bezpieczenstwo/` i nie biegną domyślnie: `npx playwright test --project=bezpieczenstwo`.
