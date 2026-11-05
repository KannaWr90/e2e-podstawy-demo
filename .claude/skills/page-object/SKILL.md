---
name: page-object
description: Tworzy albo rozszerza Page Object dla ekranu aplikacji Namssor i używa go w teście przez fixture. Użyj, gdy użytkownik prosi o Page Object, klasę strony, fixture dla ekranu albo o przepisanie testu z tests/extra/d3 na Page Object.
---

# Page Object dla ekranu Namssor

Ten skill dotyczy tylko folderu `tests/extra/d3`. W pozostałych testach obowiązuje zasada z `CLAUDE.md`: bez Page Object i własnych fixtures.

## Kroki

1. Zapytaj, którego ekranu dotyczy Page Object i jakie czynności test ma na nim wykonać. Nie zgaduj adresu strony: sprawdź go w README (tabela „Mapa ekranów”).
2. Sprawdź w `tests/extra/d3/strony/`, czy klasa dla tego ekranu już istnieje. Jeśli tak, dopisz do niej metodę zamiast tworzyć nową klasę.
3. Otwórz ekran w przeglądarce (Playwright MCP) i zanotuj role i nazwy elementów, których użyjesz.
4. Napisz klasę w `tests/extra/d3/strony/<ekran>.ts`:
   - nazwa klasy po polsku, np. `StronaKoszyka`, `PanelZamowien`;
   - konstruktor przyjmuje `page: Page`;
   - metody nazwane czasownikiem, który opisuje czynność klienta: `otworz`, `dodajProdukt`, `usun`;
   - metody zwracające `Locator` nazwane rzeczownikiem: `pozycja(nazwa)`, `wiersz(numer)`;
   - asercje w klasie tylko po to, żeby poczekać na koniec czynności (komunikat, zniknięcie wiersza). Asercje sprawdzające wynik zostają w teście.
5. Dopisz fixture w `tests/extra/d3/fixtures.ts`, która tworzy obiekt klasy. Jeśli ekran wymaga logowania, fixture korzysta z `stronaKlienta` albo loguje admina.
6. Napisz albo przepisz test. Importuje `test` i `expect` z `./fixtures`.
7. Uruchom `npx playwright test tests/extra/d3` dwa razy. Oba przebiegi mają być zielone. Pokaż użytkownikowi wynik.
8. Pokaż różnicę: test przed zmianą i po niej, obok siebie.

## Czego nie robić

- Nie twórz klasy bazowej ani dziedziczenia.
- Nie przenoś do Page Object danych testowych (nazw produktów, numerów zamówień). Przychodzą z testu jako parametry.
- Nie zmieniaj kodu w `app/`.
