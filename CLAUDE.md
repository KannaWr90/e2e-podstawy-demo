# Zasady pisania testów w tym repo

Repo szkoleniowe: aplikacja Namssor (`app/`, port 4100) i testy Playwright w TypeScript (`tests/`).
Testy czytają i oceniają testerzy, którzy dopiero uczą się kodu. Pisz prosto i czytelnie.

## Kod testu
- Importuj wyłącznie `import { test, expect } from '@playwright/test';`.
- Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.
- Lokatory w tej kolejności: `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`.
  Nie używaj selektorów CSS i XPath, `id` ani klas.
- Wiersz tabeli znajdź po treści: `page.getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Asercje web-first, które same czekają: `await expect(lokator).toBeVisible()`, `toHaveText`, `toHaveURL`.
- Nigdy `page.waitForTimeout()` ani stałych pauz. Nie sprawdzaj stanu przez `isVisible()` w `if`.
- Jeden test sprawdza jedno zachowanie. Nazwa testu po polsku opisuje oczekiwany wynik.
- Komentarze po polsku, krótkie: co robi krok i dlaczego, gdy to nieoczywiste.
- Testy API przez fixture `request`; sprawdzaj status i treść odpowiedzi.

## Review i dane testowe
Zasady z `docs/lista-kontrolna-review.md`. Każdy test ma je spełniać, zanim pokażesz go użytkownikowi.
- Nad testem napisz komentarz „Wymaganie: …” i sprawdź asercją każde zdanie wymagania.
- Każda asercja ma paść, gdy akcja testu się nie uda. Nie sprawdzaj elementów, które były widoczne już przed akcją; gdy trzeba, sprawdź stan przed akcją.
- Sprawdzaj efekt biznesowy (status, zapisane dane, dokładny tekst komunikatu). Nie sprawdzaj kolorów, klas CSS ani układu strony.
- Teksty w asercjach przepisuj z aplikacji, w całości (`toHaveText`). `toContainText` tylko wtedy, gdy reszta tekstu jest zmienna.
- Nie używaj `.first()`, `.nth()` ani `.last()` do obejścia lokatora, który pasuje do kilku elementów. Zawęź lokator, np. do wiersza tabeli.
- Test, który zmienia dane (koszyk, adres, zamówienia), sprząta po sobie w `afterEach` albo tworzy własne dane przez API w `beforeEach`.
- Wymaganie klienta testuj na koncie `user`, wymaganie administratora na koncie `admin`. Test nie zależy od innych testów.
- Po napisaniu uruchom test dwa razy pod rząd i pokaż, że pada, gdy zmienisz oczekiwaną wartość.

## Uruchamianie
- `npx playwright test` (wszystkie), `npx playwright test <plik>` (jeden plik), `npm run test:smoke`.
- Playwright sam uruchamia aplikację (`webServer` w `playwright.config.ts`).
- Po zmianach: `npm run typecheck`. Polecenia mają działać w PowerShell 5.1 (bez `&&`).
- Stan bazy psuje się po testach zmieniających dane: `npm run db:reset` przy zatrzymanej aplikacji.

## Dane
- Konta demo: `user` / `user123` (klient), `admin` / `admin123` (administrator).
- Opis API: `app/openapi.json`, w przeglądarce http://localhost:4100/api/docs.
- Nie zmieniaj kodu aplikacji w `app/`, chyba że użytkownik wyraźnie o to prosi.
