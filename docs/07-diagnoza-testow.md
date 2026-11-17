# Ćwiczenie 07: diagnoza czerwonych testów

| Test | Pierwsza linia błędu | Co widać w trace w chwili błędu | Przyczyna (jedno zdanie) | Dlaczego u Mirka przechodził |
|---|---|---|---|---|
| 01 | `Error: expect(locator).toBeVisible() failed` | | Locator `getByRole('cell', { name: 'Szampon' })` pasuje do 4 komórek, bo szuka fragmentu nazwy, a wymaganie dotyczy jednego produktu „Szampon nawilżający”. | |
| 02 | `Error: locator.click: Test timeout of 30000ms exceeded.` | | Test szuka przycisku „Zaloguj się”, a na stronie jest „Zaloguj”, więc locator nie znajduje żadnego elementu i klik czeka do limitu 30 s. | |
| 03 | `Error: expect(received).toBeGreaterThan(expected)` | | `count()` liczy wiersze od razu po otwarciu strony, zanim lista zamówień się załaduje, więc dostaje 0 i nie czeka na dane. | |
| 04 | `Error: expect(locator).toBeVisible() failed` | Strona „Ustawienia”, „Stan: wyłączony”, brak komunikatu „Zapisano ustawienia”. | Komunikat „Zapisano ustawienia” znika po 3–5 s, a test czeka 6 s (`waitForTimeout(6000)`), zanim go sprawdzi, więc komunikatu już nie ma. | Bez pauzy albo z krótszą pauzą komunikat jeszcze jest na stronie. |
| 05 | `Test timeout of 30000ms exceeded.` | Koszyk: „Pozycji: 0”, „Koszyk jest pusty.”, przycisk „Złóż zamówienie” wyłączony (`disabled`). | Test nie dodaje nic do koszyka, a przy pustym koszyku przycisk „Złóż zamówienie” jest wyłączony, więc klik czeka na aktywny przycisk do limitu 30 s. | Mirek miał coś w koszyku tester09 (dodane ręcznie albo przez inny test). |
| 06 | `Error: expect(received).toContain(expected) // indexOf` | Adres `/logowanie?next=%2Fkonto%2Fadres`, czyli strona logowania tuż po naciśnięciu Enter, zanim przeglądarka przeszła na adres dostawy. | `page.url()` odczytuje adres raz, od razu po Enter, zanim nastąpi przekierowanie, a zwykłe `expect(page.url())` nie czeka. | Na szybkim komputerze przekierowanie czasem zdąży przed odczytem adresu. |
