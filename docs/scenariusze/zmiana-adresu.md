# Przypadek testowy TC-ADR-01: zmiana adresu dostawy

| Pole | Wartość |
|---|---|
| Obszar | Konto klienta, ekran „Adres dostawy” (`/konto/adres`) |
| Priorytet | Wysoki: na ten adres wysyłamy zamówienia |
| Warunki wstępne | Konto `user` / `user123` istnieje. Stan startowy bazy (`npm run db:reset`): adres `ul. Przykładowa 12/3`, `00-001`, `Warszawa`, telefon `500 100 200` |
| Dane testowe | Nowy adres: `ul. Lipowa 7`, `31-001`, `Kraków`, `600 200 300` |
| Po teście | Przywróć adres startowy (dane z warunków wstępnych), żeby inne testy widziały ten sam stan |

## Kroki i oczekiwany wynik

| Nr | Krok | Oczekiwany wynik |
|---|---|---|
| 1 | Zaloguj się jako `user` / `user123` | W nagłówku napis „Zalogowano jako user (user)” |
| 2 | Kliknij w menu „Adres dostawy” | Nagłówek strony „Zmiana adresu dostawy”. Pola zawierają adres startowy |
| 3 | Wpisz w pola: Ulica i numer `ul. Lipowa 7`, Kod pocztowy `31-001`, Miasto `Kraków`, Telefon `600 200 300` | Pola pokazują wpisane wartości |
| 4 | Kliknij „Zapisz adres” | Komunikat „Zapisano adres dostawy.” |
| 5 | Odśwież stronę (F5) | Pola nadal zawierają nowy adres z kroku 3 |

## Przypadek negatywny TC-ADR-02: błędny kod pocztowy

| Nr | Krok | Oczekiwany wynik |
|---|---|---|
| 1 | Zaloguj się jako `user` i otwórz „Adres dostawy” | Formularz z adresem startowym |
| 2 | Zmień Kod pocztowy na `31001` (bez myślnika), resztę zostaw | |
| 3 | Kliknij „Zapisz adres” | Na górze komunikat „Popraw błędy w formularzu (1).”. Pod polem Kod pocztowy: „Kod pocztowy musi mieć format 00-000”. Brak komunikatu „Zapisano adres dostawy.” |
| 4 | Otwórz „Adres dostawy” jeszcze raz | Kod pocztowy to nadal `00-001`: błędny adres nie został zapisany |
