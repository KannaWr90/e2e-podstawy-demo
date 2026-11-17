Środowisko działa, npm test bez błędów.

## Ćwiczenie 03: czytanie kodu testów

| Test | Co robi użytkownik | Co test sprawdza | Czego test nie sprawdza | Kiedy zrobi się czerwony |
|---|---|---|---|---|
|1|użytkownik filtruje wyszukiwanie po słowach: zębów oraz rower|czy aplikacja wyszukuje prawidłowo po wybranych słowach|---|---|
|2|zalogowanie się, wejście w moje zamówienia|klient widzi aktualne oraz anulowane zamówienia|---|---|
|2|zalogowanie się na innego użytkownika, wejście w moje zamówienia i wyszukwanie po numerze zamówień|klient widzi tylko swoje zamówienia|---|---|
|3|wyszukanie niedostepnego produktu|Nie wyświetla się niedostępny produkt więc nie moge sprawdzić czy mogę do dodać do koszyka|---|

| Test | Co sprawdza | Czego nie sprawdza |
|---|---|---|
| 04-ceny-promocyjne (jeden wiersz na cały plik) |Wyświetla produkty promocyjne ze starą ceną oraz tą po rabacie |ale test nie sprawdza czy są obniżone o 20% |
| 05 › karta produktu pokazuje opis i dostępność | otwarcie karty produktu| wyszukuje sie produkt i infomacje o nim|
| 05 › cena na karcie produktu jest taka sama jak na kafelku | | |
| 05 › produktu niedostępnego nie da się dodać do koszyka z karty produktu | | |
| 06-filtr-kategorii (jeden wiersz na cały plik) | | |
## Ćwiczenie 08: oczekiwane wyniki ze scenariuszy zmiany adresu

### docs/scenariusze/zmiana-adresu.md (11)

TC-ADR-01: zmiana adresu dostawy
- [ ] 1. W nagłówku napis „Zalogowano jako user (user)”
- [ ] 2. Nagłówek strony „Zmiana adresu dostawy”
- [ ] 3. Pola zawierają adres startowy (ul. Przykładowa 12/3, 00-001, Warszawa, 500 100 200)
- [ ] 4. Pola pokazują wpisane wartości (ul. Lipowa 7, 31-001, Kraków, 600 200 300)
- [ ] 5. Komunikat „Zapisano adres dostawy.”
- [ ] 6. Po odświeżeniu (F5) pola nadal zawierają nowy adres

TC-ADR-02: błędny kod pocztowy `31001`
- [ ] 7. Formularz z adresem startowym
- [ ] 8. Na górze komunikat „Popraw błędy w formularzu (1).”
- [ ] 9. Pod polem Kod pocztowy: „Kod pocztowy musi mieć format 00-000”
- [ ] 10. Brak komunikatu „Zapisano adres dostawy.”
- [ ] 11. Po ponownym otwarciu „Adres dostawy” kod pocztowy to nadal `00-001`

### docs/scenariusze/zmiana-adresu.feature (11)

Scenariusz: Zapisanie poprawnego adresu
- [ ] 12. Komunikat „Zapisano adres dostawy.”
- [ ] 13. Po odświeżeniu strony pole „Miasto” zawiera „Kraków”

Szablon scenariusza: Błędne dane blokują zapis adresu (3 wyniki × 3 przykłady)
- Kod pocztowy `31001`
  - [ ] 14. Komunikat „Popraw błędy w formularzu (1).”
  - [ ] 15. Pod polem Kod pocztowy: „Kod pocztowy musi mieć format 00-000”
  - [ ] 16. Adres zapisany na koncie się nie zmienił
- Telefon `12345`
  - [ ] 17. Komunikat „Popraw błędy w formularzu (1).”
  - [ ] 18. Pod polem Telefon: „Telefon musi mieć 9 cyfr (opcjonalnie z +48)”
  - [ ] 19. Adres zapisany na koncie się nie zmienił
- Miasto puste
  - [ ] 20. Komunikat „Popraw błędy w formularzu (1).”
  - [ ] 21. Pod polem Miasto: „Podaj miasto”
  - [ ] 22. Adres zapisany na koncie się nie zmienił

**Razem: 22 oczekiwane wyniki** (11 w .md, 11 w .feature). Część się powtarza: wyniki 12 i 13 pokrywają się z 5 i 6, a wyniki 14–16 z 8, 9 i 11.
