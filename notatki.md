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