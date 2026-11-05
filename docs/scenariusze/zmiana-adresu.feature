# language: pl
Funkcja: Zmiana adresu dostawy
  Klient zmienia adres, na który wysyłamy jego zamówienia.
  Adres startowy konta user: ul. Przykładowa 12/3, 00-001 Warszawa, telefon 500 100 200.

  Założenia:
    Zakładając, że jestem zalogowany jako "user" z hasłem "user123"
    Oraz jestem na stronie "Adres dostawy"

  Scenariusz: Zapisanie poprawnego adresu
    Jeżeli wpiszę adres:
      | Ulica i numer | ul. Lipowa 7 |
      | Kod pocztowy  | 31-001       |
      | Miasto        | Kraków       |
      | Telefon       | 600 200 300  |
    Oraz kliknę "Zapisz adres"
    Wtedy zobaczę komunikat "Zapisano adres dostawy."
    Oraz po odświeżeniu strony pole "Miasto" będzie zawierać "Kraków"

  Szablon scenariusza: Błędne dane blokują zapis adresu
    Jeżeli w polu "<pole>" wpiszę "<wartość>"
    Oraz kliknę "Zapisz adres"
    Wtedy zobaczę komunikat "Popraw błędy w formularzu (1)."
    Oraz pod polem "<pole>" zobaczę komunikat "<komunikat>"
    Ale adres zapisany na koncie się nie zmieni

    Przykłady:
      | pole          | wartość | komunikat                                     |
      | Kod pocztowy  | 31001   | Kod pocztowy musi mieć format 00-000          |
      | Telefon       | 12345   | Telefon musi mieć 9 cyfr (opcjonalnie z +48)  |
      | Miasto        |         | Podaj miasto                                  |
