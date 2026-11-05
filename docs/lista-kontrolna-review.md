# Lista kontrolna review testu

Przejdź ją przy każdym teście, zanim go zatwierdzisz, także przy teście napisanym przez Claude. Przy każdym „nie” zapisz numer linii i powód.

## Co test sprawdza

1. **Czy nazwa i komentarz mówią, jakie wymaganie sprawdza test?** Porównaj je z przypadkiem testowym albo zgłoszeniem.
2. **Czy asercje sprawdzają wszystko, co obiecuje wymaganie?** Przeczytaj wymaganie zdanie po zdaniu i wskaż palcem asercję dla każdego. Brak asercji to luka.
3. **Czy asercja padłaby, gdyby akcja nie zadziałała?** Zakryj w myślach kliknięcie albo zapis. Jeśli asercja nadal przejdzie (element był widoczny już wcześniej), nic nie sprawdza.
4. **Czy test sprawdza efekt biznesowy?** Efekt to status zamówienia, zapisane dane, treść komunikatu. Kolor, klasa CSS i układ strony zmieniają się także wtedy, gdy aplikacja działa dobrze.
5. **Czy tekst w asercji jest dokładny?** Zestaw go z wymaganiem znak po znaku. Fragment tekstu (`toContainText`) przejdzie także dla innego komunikatu, który zawiera ten fragment. Tekst, którego nie ma w aplikacji, to sygnał, że autor go zgadł.

## Jak test znajduje elementy

6. **Czy lokatory opisują to, co widzi użytkownik?** `getByRole`, `getByLabel`, `getByText`. Selektor CSS z `nth-child`, klasą albo `id` rozsypie się po zmianie wyglądu.
7. **Czy `.first()`, `.nth()` albo `.last()` nie ukrywa niejednoznaczności?** Zapytaj, które elementy pasują i czy test bierze właściwy. Element w wierszu tabeli szukaj wewnątrz tego wiersza.

## Czekanie

8. **Czy test czeka przez `await expect(...)`?** `page.waitForTimeout()` i stałe pauzy dają test wolny i niestabilny. `isVisible()` i `count()` sprawdzają stan w jednej chwili i nie czekają, aż strona się załaduje.

## Dane

9. **Czy test działa na świeżych danych i przy drugim uruchomieniu?** Uruchom go dwa razy pod rząd. Test, który zmienia dane (zapis, anulowanie, koszyk), sprząta po sobie albo tworzy własne dane.
10. **Czy test używa właściwego konta?** Wymaganie klienta testujemy na koncie klienta, wymaganie admina na koncie admina.
11. **Czy test jest niezależny od innych testów?** Nie zakłada, że inny test uruchomił się przed nim albo zostawił dane.

## Weryfikacja

12. **Czy widziałeś, że ten test potrafi paść?** Zmień na chwilę oczekiwany tekst albo pomiń akcję i uruchom test. Test, który nigdy nie był czerwony, niczego jeszcze nie udowodnił.
