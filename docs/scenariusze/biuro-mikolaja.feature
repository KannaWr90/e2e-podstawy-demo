# language: pl
Funkcja: Zamówienie firmowe z fakturą
  Klient firmowy „Biuro Mikołaja” zamawia kalendarze adwentowe na fakturę.
  Admin zmienia status zamówienia, a klient pobiera fakturę z NIP-em nabywcy.
  Zamówienia ZAM-1007 nie zmieniamy: scenariusz zakłada własne zamówienie.

  Założenia:
    Zakładając, że jestem zalogowany jako "biuro" z hasłem "biuro123"
    Oraz mój koszyk jest pusty

  Scenariusz: Faktura dla wysłanego zamówienia firmowego
    Jeżeli dodam do koszyka 10 sztuk produktu "Kalendarz adwentowy 2026" z karty produktu
    Oraz zaznaczę "Faktura na firmę" z danymi:
      | NIP         | 241-224-12-28  |
      | Nazwa firmy | Biuro Mikołaja |
    Oraz kliknę "Złóż zamówienie (płatność przy odbiorze)"
    Wtedy zobaczę komunikat "Złożono zamówienie: <numer>"
    Oraz na stronie zamówienia zobaczę status "Nowe" i NIP "2412241228"
    Jeżeli admin zmieni status zamówienia na "Opłacone", a potem na "Wysłane"
    Wtedy na stronie zamówienia zobaczę status "Wysłane"
    Jeżeli kliknę "Pobierz fakturę"
    Wtedy pobiorę plik "faktura-<numer>.html"
    Oraz faktura będzie zawierać "NIP nabywcy: 2412241228"
    Oraz faktura będzie mieć pozycję:
      | Nazwa                    | Ilość | Cena     | Wartość   |
      | Kalendarz adwentowy 2026 | 10    | 39,99 zł | 399,90 zł |
    Oraz faktura będzie zawierać "Razem do zapłaty: 399,90 zł"
