// Logika sklepu wspólna dla stron HTML i API: zamówienia, walidacja, tryb konserwacji.
import { cenaPromocyjna, ocenKod } from './promocje.mjs';
import { hotfix, czasTeraz } from './wersja.mjs';
import { usluga } from './rozszerzenia.mjs';

export const trybKonserwacji = usluga('trybKonserwacji', function trybKonserwacji(h) {
  return h.get("SELECT value FROM settings WHERE key = 'maintenance'")?.value === '1';
});

export const ustawTrybKonserwacji = usluga('ustawTrybKonserwacji', function ustawTrybKonserwacji(h, wlaczony) {
  h.run("INSERT INTO settings (key, value) VALUES ('maintenance', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [wlaczony ? '1' : '0']);
});

// Cena jednostkowa zapisana przy zamówieniu (z promocją i kodem); stare zamówienia: cena produktu.
const ORDER_SQL = `SELECT o.id, o.number, o.qty, o.status, o.created_at, p.id AS product_id, p.name AS product,
  COALESCE(o.unit_price_cents, p.price_cents) * o.qty AS total_cents, u.login AS customer
  FROM orders o JOIN products p ON p.id = o.product_id JOIN users u ON u.id = o.user_id`;

// Pełne dane zamówienia: do strony zamówienia, panelu admina i faktury.
export const zamowienieSzczegoly = usluga('zamowienieSzczegoly', function zamowienieSzczegoly(h, number) {
  const z = h.get(`SELECT o.id, o.number, o.qty, o.status, o.created_at, o.user_id, p.id AS product_id, p.name AS product,
    COALESCE(o.unit_price_cents, p.price_cents) AS unit_price_cents,
    COALESCE(o.unit_price_cents, p.price_cents) * o.qty AS total_cents, u.login AS customer,
    o.discount_code, o.invoice, o.nip, o.company, o.address
    FROM orders o JOIN products p ON p.id = o.product_id JOIN users u ON u.id = o.user_id WHERE o.number = ?`, [number]);
  if (!z) return null;
  return { ...z, invoice: z.invoice === 1 };
});

export const zamowieniaKlienta = usluga('zamowieniaKlienta', function zamowieniaKlienta(h, userId) {
  return h.all(`${ORDER_SQL} WHERE o.user_id = ? ORDER BY o.id DESC`, [userId]);
});

export const wszystkieZamowienia = usluga('wszystkieZamowienia', function wszystkieZamowienia(h, szukaj = '') {
  const q = `%${szukaj}%`;
  return h.all(`${ORDER_SQL} WHERE o.number LIKE ? OR p.name LIKE ? OR u.login LIKE ? ORDER BY o.id DESC`, [q, q, q]);
});

export const zamowienie = usluga('zamowienie', function zamowienie(h, number) {
  return h.get(`${ORDER_SQL} WHERE o.number = ?`, [number]);
});

function nastepnyNumer(h) {
  const row = h.get('SELECT COALESCE(MAX(id), 0) + 1001 AS n FROM orders');
  return `ZAM-${row.n}`;
}

// Zwraca zamówienie albo null, gdy brakuje towaru.
// opcje: { cena (grosze za sztukę), kod, faktura: { nip, firma } }. Bez ceny: cena promocyjna produktu.
export const zlozZamowienie = usluga('zlozZamowienie', function zlozZamowienie(h, userId, productId, qty, opcje = {}) {
  const produkt = h.get('SELECT price_cents, promo_percent FROM products WHERE id = ?', [productId]);
  if (!produkt) return null;
  const r = h.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [qty, productId, qty]);
  if (r.changes === 0) return null;
  const number = nastepnyNumer(h);
  const cena = opcje.cena ?? cenaPromocyjna(produkt.price_cents, produkt.promo_percent);
  h.run(
    `INSERT INTO orders (number, user_id, product_id, qty, unit_price_cents, discount_code, invoice, nip, company, address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [number, userId, productId, qty, cena, opcje.kod ?? null, opcje.faktura ? 1 : 0, opcje.faktura?.nip ?? null,
      opcje.faktura?.firma ?? null, adresDomyslnyTekst(h, userId), czasTeraz()],
  );
  return zamowienie(h, number);
});

// Zamienia koszyk na zamówienia (jedno zamówienie na pozycję). Zwraca numery.
// faktura: { nip, firma } albo null.
export const zamowKoszyk = usluga('zamowKoszyk', function zamowKoszyk(h, userId, faktura = null) {
  const { pozycje, kod } = koszyk(h, userId);
  const numery = [];
  for (const item of pozycje) {
    const z = zlozZamowienie(h, userId, item.product_id, item.qty, {
      cena: item.cena_po_rabacie_cents, kod: item.objety_kodem ? kod.kod : null, faktura,
    });
    if (z) numery.push(z.number);
  }
  h.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  h.run('DELETE FROM cart_codes WHERE user_id = ?', [userId]);
  return numery;
});

// Koszyk z cenami: cena_cents (cena za sztukę po promocji), cena_po_rabacie_cents (także po kodzie),
// wartosc_cents (pozycja razem), objety_kodem. suma = do zapłaty, sumaPrzedRabatem = bez kodu rabatowego.
// kod = wynik ocenKod() dla zapisanego kodu albo null.
export const koszyk = usluga('koszyk', function koszyk(h, userId) {
  const wiersze = h.all(
    `SELECT c.id, c.qty, p.id AS product_id, p.name, p.category, p.price_cents, p.promo_percent
     FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY p.name`,
    [userId],
  );
  const zapisany = h.get('SELECT code FROM cart_codes WHERE user_id = ?', [userId])?.code;
  const kod = zapisany ? ocenKod(zapisany, wiersze) : null;
  const pozycje = wiersze.map((w) => {
    const cena = cenaPromocyjna(w.price_cents, w.promo_percent);
    const objetyKodem = Boolean(kod?.ok && (!kod.kategoria || kod.kategoria === w.category));
    const poRabacie = objetyKodem ? cenaPromocyjna(cena, kod.procent) : cena;
    return { ...w, cena_cents: cena, cena_po_rabacie_cents: poRabacie, wartosc_cents: poRabacie * w.qty, objety_kodem: objetyKodem };
  });
  const sumaPrzedRabatem = pozycje.reduce((s, i) => s + i.cena_cents * i.qty, 0);
  // Suma koszyka po rabatach.
  const suma = pozycje.reduce((s, i) => s + (hotfix() ? i.cena_po_rabacie_cents : i.wartosc_cents), 0);
  return { pozycje, suma, sumaPrzedRabatem, rabat: sumaPrzedRabatem - suma, kod };
});

// ---------- Katalog: produkty z cenami promocyjnymi ----------
// Czy wyszukiwanie obejmuje produkty archiwalne.
export const pokazArchiwalne = (q) => /kalendarz|adwent|advent|2025/i.test(String(q ?? '').trim());

// sort: '' (kategoria, nazwa), 'cena' (rosnąco), 'cena-malejaco', 'nazwa'
export const katalog = usluga('katalog', function katalog(h, { q = '', kategoria = '', sort = '' } = {}) {
  const produkty = h.all(
    `SELECT id, name, category, price_cents, stock, promo_percent, description FROM products
     WHERE name LIKE ? AND (? = '' OR category = ?) AND (archived = 0 OR ? = 1) ORDER BY category, name`,
    [`%${q}%`, kategoria, kategoria, pokazArchiwalne(q) ? 1 : 0],
  ).map((p) => ({ ...p, cena_cents: cenaPromocyjna(p.price_cents, p.promo_percent) }));
  if (sort === 'nazwa') produkty.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  if (sort === 'cena' || sort === 'cena-malejaco') {
    produkty.sort((a, b) => a.cena_cents - b.cena_cents);
    if (sort === 'cena-malejaco') produkty.reverse();
  }
  return produkty;
});

export const produktKatalogu = usluga('produktKatalogu', function produktKatalogu(h, id) {
  const p = h.get('SELECT id, name, category, price_cents, stock, promo_percent, description FROM products WHERE id = ?', [id]);
  return p ? { ...p, cena_cents: cenaPromocyjna(p.price_cents, p.promo_percent) } : null;
});

// Produkt w formacie API katalogu.
export const produktApi = (p, zOpisem = false) => ({
  id: p.id, name: p.name, category: p.category, price_cents: p.price_cents,
  promo_percent: p.promo_percent, promo_price_cents: p.cena_cents, available: p.stock > 0,
  ...(zOpisem ? { stock: p.stock, description: p.description } : {}),
  url: `/produkt/${p.id}`,
});

// ---------- Statusy zamówienia ----------
// Nazwy statusów.
export const STATUSY = {
  new: 'Nowe',
  get paid() {
    return hotfix() ? 'Zapłacone' : 'Opłacone';
  },
  shipped: 'Wysłane',
  cancelled: 'Anulowane',
};
const KOLEJNOSC = ['new', 'paid', 'shipped'];

// Zmiana statusu przez admina: tylko o jeden krok do przodu (Nowe → Opłacone → Wysłane).
// Wynik: { z } albo { blad, kod } (kod: 400, 404, 409).
export const zmienStatus = usluga('zmienStatus', function zmienStatus(h, number, nowy) {
  if (!KOLEJNOSC.includes(nowy)) return { blad: 'Status musi być jednym z: new, paid, shipped', kod: 400 };
  const z = h.get('SELECT id, status FROM orders WHERE number = ?', [number]);
  if (!z) return { blad: 'Nie ma takiego zamówienia', kod: 404 };
  if (z.status === 'cancelled') return { blad: 'Zamówienie jest anulowane: nie można zmienić statusu', kod: 409 };
  if (z.status === nowy) return { blad: `Zamówienie ma już status „${STATUSY[nowy]}”`, kod: 409 };
  const dozwolona = KOLEJNOSC.indexOf(nowy) === KOLEJNOSC.indexOf(z.status) + 1;
  if (!dozwolona) return { blad: `Niedozwolona zmiana statusu: „${STATUSY[z.status]}” → „${STATUSY[nowy]}”`, kod: 409 };
  h.run('UPDATE orders SET status = ? WHERE id = ?', [nowy, z.id]);
  return { z: zamowienie(h, number) };
});

// ---------- Faktura ----------
export const SPRZEDAWCA = { nazwa: 'Namssor sp. z o.o. (firma fikcyjna)', adres: 'ul. Szkoleniowa 1, 00-001 Warszawa', nip: '1234563218' };

export const daneFaktury = usluga('daneFaktury', function daneFaktury(h, z) {
  return {
    invoice_number: `FV/${z.created_at.slice(0, 4)}/${z.number}`,
    order_number: z.number,
    issue_date: z.created_at.slice(0, 10),
    seller: { name: SPRZEDAWCA.nazwa, address: SPRZEDAWCA.adres, nip: SPRZEDAWCA.nip },
    buyer: { name: z.company, nip: z.nip },
    items: [{ name: z.product, qty: z.qty, unit_price_cents: z.unit_price_cents, total_cents: z.total_cents }],
    total_cents: z.total_cents,
  };
});

// ---------- Adresy w profilu ----------
// Adres główny (id 0) to adres z /konto/adres. Dodatkowe adresy są w tabeli addresses.
export const adresy = usluga('adresy', function adresy(h, userId) {
  const u = h.get('SELECT street, postal_code, city, phone, default_address_id FROM users WHERE id = ?', [userId]);
  const dodatkowe = h.all('SELECT id, name, street, postal_code, city, phone FROM addresses WHERE user_id = ? ORDER BY id', [userId]);
  const domyslnyId = dodatkowe.some((a) => a.id === u.default_address_id) ? u.default_address_id : 0;
  return [{ id: 0, name: 'Adres główny', street: u.street, postal_code: u.postal_code, city: u.city, phone: u.phone }]
    .concat(dodatkowe)
    .map((a) => ({ ...a, default: a.id === domyslnyId }));
});

export const adresDomyslnyTekst = usluga('adresDomyslnyTekst', function adresDomyslnyTekst(h, userId) {
  const a = adresy(h, userId).find((x) => x.default);
  return a && a.street ? `${a.street}, ${a.postal_code} ${a.city}` : '';
});

// Dodaje adres do profilu. Wynik: { errors } albo { adres }.
export const dodajAdres = usluga('dodajAdres', function dodajAdres(h, userId, dane) {
  const { errors: bledyAdresu, adres } = walidujAdres(dane);
  const nazwa = typeof dane.name === 'string' ? dane.name.trim() : '';
  const errors = [];
  if (!nazwa) errors.push({ field: 'name', message: 'Podaj nazwę adresu, np. Praca' });
  else if (nazwa.length > 40) errors.push({ field: 'name', message: 'Nazwa adresu może mieć najwyżej 40 znaków' });
  errors.push(...bledyAdresu);
  if (errors.length) return { errors };
  if (h.get('SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?', [userId]).n >= LIMIT_ADRESOW) {
    return { errors: [{ field: 'name', message: `Możesz mieć najwyżej ${LIMIT_ADRESOW} dodatkowych adresów. Usuń któryś, żeby dodać nowy.` }] };
  }
  const r = h.run('INSERT INTO addresses (user_id, name, street, postal_code, city, phone) VALUES (?, ?, ?, ?, ?, ?)', [
    userId, nazwa, adres.street, adres.postal_code, adres.city, adres.phone,
  ]);
  const id = Number(r.lastInsertRowid);
  return { adres: adresy(h, userId).find((a) => a.id === id) };
});

const LIMIT_ADRESOW = 20;

// Usuwa dodatkowy adres. Adresu głównego (id 0) nie da się usunąć. Usunięty domyślny → domyślny główny.
// Wynik: true, false (nie ma takiego adresu) albo 'glowny'.
export const usunAdres = usluga('usunAdres', function usunAdres(h, userId, id) {
  if (id === 0) return 'glowny';
  const r = h.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  if (r.changes === 0) return false;
  h.run('UPDATE users SET default_address_id = NULL WHERE id = ? AND default_address_id = ?', [userId, id]);
  return true;
});

// Ustawia adres domyślny. false = nie ma takiego adresu.
export const ustawDomyslny = usluga('ustawDomyslny', function ustawDomyslny(h, userId, id) {
  if (id !== 0 && !h.get('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId])) return false;
  h.run('UPDATE users SET default_address_id = ? WHERE id = ?', [id === 0 ? null : id, userId]);
  return true;
});

// Anuluje zamówienie (po id albo numerze) i zwraca towar na stan. null = brak albo już anulowane.
export const anulujZamowienie = usluga('anulujZamowienie', function anulujZamowienie(h, idAlboNumer) {
  const z = h.get("SELECT * FROM orders WHERE (id = ? OR number = ?) AND status = 'new'", [idAlboNumer, idAlboNumer]);
  if (!z) return null;
  h.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [z.id]);
  h.run('UPDATE products SET stock = stock + ? WHERE id = ?', [z.qty, z.product_id]);
  return zamowienie(h, z.number);
});

// ---------- Walidacja (ta sama dla formularza i API) ----------
// Wynik: lista błędów [{ field, message }]. Pusta lista = dane poprawne.

export const walidujAdres = usluga('walidujAdres', function walidujAdres(dane) {
  const errors = [];
  const tekst = (v) => (typeof v === 'string' ? v.trim() : '');
  const street = tekst(dane.street);
  const postal = tekst(dane.postal_code);
  const city = tekst(dane.city);
  const phone = tekst(dane.phone).replace(/[\s-]/g, '');

  if (!street) errors.push({ field: 'street', message: 'Podaj ulicę i numer domu' });
  else if (street.length > 100) errors.push({ field: 'street', message: 'Ulica może mieć najwyżej 100 znaków' });

  if (!postal) errors.push({ field: 'postal_code', message: 'Podaj kod pocztowy' });
  else if (!/^\d{2}-\d{3}$/.test(postal)) errors.push({ field: 'postal_code', message: 'Kod pocztowy musi mieć format 00-000' });

  if (!city) errors.push({ field: 'city', message: 'Podaj miasto' });
  else if (!/^[\p{L} .'-]{2,60}$/u.test(city)) errors.push({ field: 'city', message: 'Nazwa miasta może zawierać tylko litery' });

  if (!phone) errors.push({ field: 'phone', message: 'Podaj numer telefonu' });
  else if (!/^(\+48)?\d{9}$/.test(phone)) errors.push({ field: 'phone', message: 'Telefon musi mieć 9 cyfr (opcjonalnie z +48)' });

  return { errors, adres: { street, postal_code: postal, city, phone: tekst(dane.phone) } };
});

// NIP: 10 cyfr (myślniki i spacje dozwolone), ostatnia cyfra to suma kontrolna.
export const poprawnyNip = usluga('poprawnyNip', function poprawnyNip(nip) {
  const cyfry = String(nip ?? '').replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cyfry)) return false;
  const wagi = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const suma = wagi.reduce((s, w, i) => s + w * Number(cyfry[i]), 0) % 11;
  return suma !== 10 && suma === Number(cyfry[9]);
});

// Dane do faktury. Wynik: { errors, faktura: { nip (same cyfry), firma } }.
export const walidujFakture = usluga('walidujFakture', function walidujFakture(dane) {
  const errors = [];
  const nipTekst = typeof dane.nip === 'string' ? dane.nip.trim() : '';
  const firma = typeof dane.company === 'string' ? dane.company.trim() : '';
  const cyfry = nipTekst.replace(/[\s-]/g, '');
  if (!nipTekst) errors.push({ field: 'nip', message: 'Podaj NIP' });
  else if (!/^\d{10}$/.test(cyfry)) errors.push({ field: 'nip', message: 'NIP musi mieć 10 cyfr' });
  else if (!poprawnyNip(cyfry)) errors.push({ field: 'nip', message: 'Nieprawidłowy NIP: błędna suma kontrolna' });
  if (!firma) errors.push({ field: 'company', message: 'Podaj nazwę firmy' });
  else if (firma.length > 100) errors.push({ field: 'company', message: 'Nazwa firmy może mieć najwyżej 100 znaków' });
  return { errors, faktura: { nip: cyfry, firma } };
});

export const walidujZamowienie = usluga('walidujZamowienie', function walidujZamowienie(dane) {
  const errors = [];
  const productId = dane.product_id;
  const qty = dane.qty ?? 1;
  if (productId === undefined || productId === null || productId === '') errors.push({ field: 'product_id', message: 'Pole jest wymagane' });
  else if (!Number.isInteger(productId) || productId < 1) errors.push({ field: 'product_id', message: 'Musi być dodatnią liczbą całkowitą' });
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) errors.push({ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' });
  return { errors, productId, qty };
});
