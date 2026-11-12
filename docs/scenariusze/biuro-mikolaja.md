# Przypadek testowy TC-FV-01: zamówienie firmowe z fakturą

Eksport z Azure Test Plans: kroki w kolumnach „Akcja” i „Oczekiwany wynik”, dane jako parametry `@nazwa` (wartości w tabeli „Parametry”).

| Pole | Wartość |
|---|---|
| Tytuł | Zamówienie na firmę: NIP nabywcy, zmiana statusu przez admina, faktura do pobrania |
| Obszar | Sklep / Koszyk, Zamówienia; Panel admina / Zamówienia |
| Priorytet | 1 |
| Stan | Gotowy |
| Warunki wstępne | Konta `@klient` i `admin` / `admin123` istnieją. Koszyk klienta jest pusty. Zamówienia ZAM-1007 nie zmieniamy: test zakłada własne zamówienie |
| Po teście | Zamówienie ma status „Wysłane” i zostaje w bazie. Wysłanego zamówienia nie da się anulować. Stan startowy przywraca `npm run db:reset` |

## Parametry

| Parametr | Wartość |
|---|---|
| `@klient` | `biuro` / `biuro123` |
| `@produkt` | Kalendarz adwentowy 2026 (`/produkt/21`) |
| `@ilosc` | 10 |
| `@nip` | 241-224-12-28 |
| `@firma` | Biuro Mikołaja |

## Kroki

| Krok | Akcja | Oczekiwany wynik |
|---|---|---|
| 1 | Zaloguj się jako `@klient` | W nagłówku napis „Zalogowano jako biuro (user)” |
| 2 | Otwórz kartę produktu `@produkt`, wpisz w pole „Ilość” `@ilosc` i kliknij „Dodaj do koszyka” | Komunikat „Dodano do koszyka: Kalendarz adwentowy 2026” |
| 3 | Otwórz „Koszyk” | Jedna pozycja: Kalendarz adwentowy 2026, ilość 10. Razem: 399,90 zł |
| 4 | Zaznacz „Faktura na firmę”, wpisz NIP `@nip` i nazwę firmy `@firma`, kliknij „Złóż zamówienie (płatność przy odbiorze)” | Komunikat „Złożono zamówienie: ZAM-…”. Zapisz numer zamówienia |
| 5 | Kliknij numer zamówienia na liście „Moje zamówienia” | Status „Nowe”. „Faktura na firmę: Biuro Mikołaja, NIP 2412241228” (NIP bez myślników). Przycisk „Pobierz fakturę” |
| 6 | Wyloguj się. Zaloguj się jako `admin`, otwórz zamówienie z kroku 4 w panelu admina (`/admin/zamowienia/<numer>`) | Status „Nowe”, pole „Status zamówienia” |
| 7 | Wybierz status „Opłacone” i kliknij „Zapisz status” | Status „Opłacone” |
| 8 | Wybierz status „Wysłane” i kliknij „Zapisz status” | Status „Wysłane” |
| 9 | Wyloguj się. Zaloguj się jako `@klient` i otwórz zamówienie z kroku 4 | Status „Wysłane” |
| 10 | Kliknij „Pobierz fakturę” | Pobrany plik `faktura-<numer>.html`. W pliku: „NIP nabywcy: 2412241228”, nabywca „Biuro Mikołaja”, pozycja „Kalendarz adwentowy 2026”: ilość 10, cena 39,99 zł, wartość 399,90 zł, „Razem do zapłaty: 399,90 zł” |
