# Ćwiczenie 13. Polowanie na błędy w kandydacie do wydania

Blok 3.2, warstwa 5 · od 11:00 do 14:55, równolegle z projektem · w parach, klawiaturę ma osoba, która nie pisała ostatniego testu

## Cel

Umiesz znaleźć błąd w aplikacji, której kodu nie widzisz, i udowodnić go testem: ten sam test pada na wersji z błędem i przechodzi na wersji poprawnej. Umiesz pisać testy na środowisku, z którego w tej samej chwili korzysta 11 innych osób.

## Materiał wejściowy

Wiadomość od Mirka, 10:55:
> Wersja „kandydat do wydania” (`rc`) stoi na wspólnym serwerze. Przetestowałem wszystko. U mnie działa.

Wiadomość od Klaudiusza, 10:56:
> Ja też przetestowałem. Wszystko zielone. Zostawiłem w sklepie parę drobnych niespodzianek, ale to nie są błędy.

Bożena, 10:57:
> Klaudiusz zostawił w sklepie 6 niespodzianek. Mirek: 10 błędów. Kto znajdzie więcej, ten ma spokojny piątek.

| Co | Wartość |
|---|---|
| Wersja `rc` (kandydat do wydania) | `https://namssor-rc-XXXX.europe-central2.run.app` |
| Wersja zwykła na wspólnym serwerze | `https://namssor-XXXX.europe-central2.run.app` |
| Konta | `tester01`–`tester12`, hasło `czarny-piatek-2026`; numer konta poda trener |

Prawdziwe adresy w miejsce `XXXX` poda trener na sali.

## Zasady gry

- **Czarna skrzynka.** Nie czytacie kodu w folderze `app/`. Claude też nie: na początku rozmowy napiszcie mu, że folder `app/` jest zakazany, a aplikację poznajecie tylko przez przeglądarkę, `/api/docs` i odpowiedzi API. Para, która użyje kodu aplikacji, traci punkty za ten błąd.
- **Punkt za błąd** dostajecie tylko za test, który **pada na `rc`** i **przechodzi na wersji zwykłej**. Pokazujecie trenerowi oba uruchomienia (krok 3). Sam opis błędu, bez testu, nie daje punktu. Jeden błąd to jeden punkt, nawet jeśli łapie go kilka Waszych testów.
- **Punkt bonusowy za niespodziankę Klaudiusza:** test, który ją dokumentuje i przechodzi na obu wersjach.
- **Fair play na wspólnych danych.** Serwer i baza są wspólne dla wszystkich par:
  - tworzycie własne dane (produkt w koszyku, adres, zamówienie) i nie zakładacie, że ktoś inny ich nie zmienił;
  - sprzątacie po sobie: koszyk, dodane adresy, kod rabatowy;
  - nie ruszacie zamówienia `ZAM-1007` (Biuro Mikołaja): bez anulowania i zmiany statusu;
  - nie testujecie wydajności ani nie wysyłacie setek żądań w pętli.

## Kroki

PowerShell, z katalogu głównego repo.

1. **Ustawcie konto pary i sprawdźcie, czy serwer odpowiada.**
   ```powershell
   $env:APP_USER="tester05"
   $env:APP_PASSWORD="czarny-piatek-2026"
   $env:BASE_URL="https://namssor-rc-XXXX.europe-central2.run.app"
   npx playwright test tests/smoke.spec.ts
   ```
   Oczekiwany wynik: `4 passed`. W stopce strony `rc` widać „Wersja: rc”.

2. **Wybierzcie obszar i szukajcie ręcznie, potem testem.** Obszary warte sprawdzenia: ceny i promocje, kody rabatowe, faktura, koszyk, sortowanie i filtrowanie, walidacja formularzy, adresy w profilu, odpowiedzi API (statusy i treść), statusy zamówień. Przejdźcie scenariusz ręcznie na `rc` i na wersji zwykłej, porównajcie ekrany i odpowiedzi, a dopiero potem piszcie test w `tests/polowanie/`.

> **Jeśli utknąłeś po 15 minutach**
> Weźcie test z Waszego pakietu, który już przechodzi, i uruchomcie go na `rc`. Potem zadajcie pytania, których test nie zadaje: co, jeśli klient zrobi to dwa razy, cofnie się, wpisze wartość graniczną, usunie ostatnią rzecz? Co pokazuje API, gdy poprosi o coś, czego nie ma?

3. **Udowodnijcie błąd dwoma uruchomieniami.** Ten sam test, dwa adresy:
   ```powershell
   $env:BASE_URL="https://namssor-rc-XXXX.europe-central2.run.app"
   npx playwright test tests/polowanie/rabat-dla-wlosow.spec.ts
   $env:BASE_URL="https://namssor-XXXX.europe-central2.run.app"
   npx playwright test tests/polowanie/rabat-dla-wlosow.spec.ts
   ```
   Oczekiwany wynik: pierwsze uruchomienie `1 failed`, drugie `1 passed`. Jeśli oba przechodzą, test nie widzi różnicy. Jeśli oba padają, test jest zły albo dane zmieniła inna para.

4. **Zgłoście punkt i zróbcie commit.** Podnieście rękę, pokażcie trenerowi oba wyniki i jednym zdaniem, co jest źle. Trener wpisuje punkt do tablicy wyników. Potem:
   ```powershell
   git add tests/polowanie
   git commit -m "Polowanie: <co jest źle, jednym zdaniem>" -m "Review: OK"
   ```

5. **Sprzątnijcie po sobie przed kolejnym polowaniem.** Sprawdźcie na `rc` swoim kontem koszyk i „Moje adresy”. Usuńcie to, co zostało po nieudanych testach.

> **Pracujesz bez wspólnego serwera**
> Gdy serwer nie odpowiada przez proxy, trener udostępni plik wersji `rc`. Zapisz go poza folderem repo, np. `C:\e2e\wydanie\`, i nie otwieraj go. W drugim oknie PowerShell uruchom `rc` na porcie 4200 z osobną bazą:
> ```powershell
> $env:APP_VERSION="rc"
> $env:NAMSSOR_RC_MODULE="C:\e2e\wydanie\<plik od trenera>"
> $env:PORT="4200"
> $env:NAMSSOR_DB="data\rc.db"
> npm start
> ```
> W kroku 3 pierwsze uruchomienie z `$env:BASE_URL="http://localhost:4200"`, drugie po `Remove-Item Env:BASE_URL` (wersja zwykła na Twoim komputerze). Konto `user` też działa, bo cała baza jest Twoja.

## Tablica wyników

Trener prowadzi ją na rzutniku. Para widzi swój wiersz i liczby innych, nie widzi, co znaleźli.

| Para | Konto | Błędy Mirka (z 10) | Niespodzianki Klaudiusza (z 6) | Razem |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

Remis rozstrzyga godzina pierwszego zgłoszenia.

## Przykład wyniku

Para łapie błąd, którego w `rc` nie ma: kod `WLOSY15` działa na koszyk bez produktów do włosów. Test w `tests/polowanie/rabat-dla-wlosow.spec.ts` zna oczekiwany komunikat z wersji zwykłej. Na `rc` przechodzi, więc punktu nie ma:
```
PS C:\e2e\e2e-podstawy-demo> npx playwright test tests/polowanie/rabat-dla-wlosow.spec.ts

Running 1 test using 1 worker

  ✓  1 [chromium] › tests/polowanie/rabat-dla-wlosow.spec.ts:4:5 › kod WLOSY15 bez produktu do włosów jest odrzucony (376ms)

  1 passed (742ms)
```

## Kryterium „gotowe”

- [ ] Każdy zgłoszony błąd ma test w `tests/polowanie/` i para pokazuje oba uruchomienia z kroku 3: `failed` na `rc`, `passed` na wersji zwykłej.
- [ ] Ten sam test uruchomiony dwa razy z rzędu na wersji zwykłej daje ten sam wynik (sprząta po sobie).
- [ ] Na `rc` Waszym kontem koszyk jest pusty, a w „Moje adresy” jest tylko „Adres główny”.

## Dla szybszych

> **Skończyłeś wcześniej**
> Weźcie błąd, za który macie punkt, i napiszcie drugi test tego samego błędu inną drogą: jeśli pierwszy szedł przez przeglądarkę, drugi przez API, albo odwrotnie. Porównajcie, który szybciej powie Mirkowi, gdzie szukać. Niespodzianki Klaudiusza czasem nie widać na liście ani w menu: zajrzyjcie tam, gdzie klient zwykle nie patrzy.

## Artefakt do zabrania

Folder `tests/polowanie/` z testami, z których każdy łapie jeden błąd wersji `rc`, i lista błędów do części „co znaleźliśmy” na spotkaniu „wydajemy czy nie”.

## Rozwiązanie wzorcowe

Brak gałęzi z rozwiązaniem: lista błędów jest tylko u trenera. Omówienie na spotkaniu „wydajemy czy nie”.
