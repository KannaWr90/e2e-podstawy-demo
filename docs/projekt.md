# Projekt w parach: pakiet scenariuszy biznesowych Namssor

Osiem scenariuszy z aplikacji Namssor do zamiany na testy automatyczne: cztery E2E w przeglądarce, trzy API i jeden łączony (API + E2E). Wybierzcie co najmniej cztery, w tym co najmniej jeden API i jeden z kontem `admin`. Numery wybranych scenariuszy wpiszcie w linii „Wybrane” pod nagłówkiem „Scenariusze”.

Testy zapisujecie w folderze `tests/projekt/`, jeden scenariusz w jednym pliku: `tests/projekt/p1-zakup.spec.ts`, `tests/projekt/p5-api-katalog.spec.ts` itd.

## Zasada pracy

Każdy test przechodzi review drugiej osoby z pary, zanim trafi do commita. Osoba, która pisała test z Claude Code, oddaje klawiaturę. Druga osoba czyta test z listą kontrolną review (`docs/lista-kontrolna-review.md`) i mówi, co poprawić. Role zmieniacie po każdym teście.

## Scenariusze

Wybrane: (np. P1, P3, P5, P7)

### P1. Zakup z płatnością przy odbiorze (E2E)

Zalogowany klient (`user`) dodaje do koszyka „Balsam do ciała” i klika „Złóż zamówienie (płatność przy odbiorze)”.

Oczekiwany wynik:
- aplikacja przechodzi na stronę „Moje zamówienia” i pokazuje komunikat „Złożono zamówienie: ZAM-…” z nowym numerem;
- na liście jest wiersz z tym numerem, produktem „Balsam do ciała” i statusem „Nowe”;
- na stronie „Produkty” stan „Balsam do ciała” jest mniejszy o 1 niż przed zakupem.

### P2. Koszyk wymaga logowania (E2E)

Niezalogowany klient otwiera adres `/koszyk`, a potem loguje się jako `user` / `user123`.

Oczekiwany wynik:
- przed logowaniem aplikacja pokazuje stronę „Logowanie”, adres zawiera `next=%2Fkoszyk`;
- po zalogowaniu klient wraca na stronę „Koszyk”, a nie na stronę główną.

### P3. Administrator dodaje produkt (E2E)

Administrator (`admin`) na stronie „Panel admina” › „Produkty” dodaje produkt: nazwa unikalna (np. z datą i godziną), kategoria „Testowe”, cena `12,50`, stan `5`.

Oczekiwany wynik:
- komunikat „Dodano produkt: <nazwa>”;
- na stronie „Produkty” wyszukiwarka znajduje ten produkt, z ceną „12,50 zł”, jako „Dostępny”, z aktywnym przyciskiem „Dodaj do koszyka”.

### P4. Klient nie wejdzie do panelu administratora (E2E)

Klient (`user`) po zalogowaniu otwiera adres `/admin`.

Oczekiwany wynik:
- strona z nagłówkiem „Brak uprawnień” i tekstem „Ta strona wymaga roli admin.”;
- w menu klienta nie ma pozycji „Panel admina”, a w menu administratora jest.

### P5. Katalog produktów w API (API)

`GET /api/products?category=Dziecko` oraz `GET /api/products/999`.

Oczekiwany wynik:
- pierwsze żądanie: status 200, lista 3 produktów, każdy z `category` równym `"Dziecko"`;
- drugie żądanie: status 404 i treść `{ "error": "Nie ma takiego produktu" }`.

### P6. Zamówienie przez API i błędne dane (API)

Klient loguje się przez `POST /api/login` i składa zamówienie `POST /api/orders` z treścią `{ "product_id": 10, "qty": 2 }`.

Oczekiwany wynik:
- status 201, w odpowiedzi nowy numer `ZAM-…`, `qty` równe 2, `status` równy `"new"`, `product` równy `"Balsam do ciała"`;
- `GET /api/orders/<numer>` zwraca 200 i to samo zamówienie;
- `qty` równe 0 daje status 400, a w `errors` jest pole `qty`;
- produkt niedostępny (`product_id` 3) daje status 409 i `{ "error": "Brak towaru na stanie" }`.

### P7. Klient nie widzi cudzych zamówień (API)

`ZAM-1005` należy do konta `admin`, `ZAM-1001` do konta `user`.

Oczekiwany wynik:
- klient `user`: `GET /api/orders/ZAM-1001` daje 200, `GET /api/orders/ZAM-1005` daje 404 i `{ "error": "Nie ma takiego zamówienia" }`;
- administrator: `GET /api/orders/ZAM-1001` daje 200;
- bez logowania: 401 i `{ "error": "Wymagane logowanie" }`.

### P8. Zamówienie z API anulowane w panelu (API + E2E)

Test zakłada zamówienie przez API jako `user`. Administrator znajduje je w „Panel admina” › „Zamówienia” po numerze i klika „Anuluj”.

Oczekiwany wynik:
- w wierszu tego zamówienia status „Anulowane” i brak przycisku „Anuluj”;
- `GET /api/orders/<numer>` zwraca `status` równy `"cancelled"`;
- inne zamówienia nie zmieniły statusu.

## Dane i stan aplikacji

- Konta: `user` / `user123`, `admin` / `admin123`. Jeśli macie już funkcję logowania z ćwiczenia 11, używajcie jej.
- Opis API: http://localhost:4100/api/docs.
- Koszyk należy do konta. Testy, które zmieniają koszyk konta `user`, mogą sobie przeszkadzać, gdy biegną równolegle. Jeśli test raz przechodzi, a raz nie, uruchomcie go z `--workers=1` i porównajcie wynik.
- Testy, które dodają dane, używają unikalnych nazw albo po sobie sprzątają. Stan startowy przywraca `npm run db:reset` (przy zatrzymanej aplikacji).

## Kryteria oceny pary

| Kryterium | Jak sprawdzić |
|---|---|
| Co najmniej 4 scenariusze, w tym 1 API i 1 z kontem `admin` | pliki w `tests/projekt/`, linia „Wybrane” wyżej |
| Pakiet jest zielony za każdym razem | `npx playwright test tests/projekt --repeat-each=3` bez `failed` |
| Test pada, gdy wynik jest inny niż oczekiwany | para pokazuje: zmiana oczekiwanej wartości w jednej asercji daje `1 failed` |
| Asercje sprawdzają wynik biznesowy ze scenariusza | każdy punkt „Oczekiwany wynik” ma swoją asercję albo komentarz, dlaczego jej nie ma |
| Locatory odporne na zmiany UI | `getByRole`, `getByLabel`, `getByText`, potem `getByTestId`; bez CSS, XPath, `nth()` |
| Bez stałych pauz | w kodzie nie ma `waitForTimeout` |
| Każdy test po review drugiej osoby | w historii (`git log`) przy każdym teście linia `Review: OK` albo lista poprawek |
| Nazwa testu mówi, co ma się stać | po samej nazwie w raporcie wiadomo, jaki wynik jest oczekiwany |
