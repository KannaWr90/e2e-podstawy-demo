// REST API (JSON). Opis wszystkich endpointów: app/openapi.json, w przeglądarce /api/docs.
// Kody błędów są spójne:
//   400 { error, errors: [{ field, message }] }  błędne dane
//   401 { error }  brak logowania       403 { error }  zła rola
//   404 { error }  nie ma zasobu        409 { error }  brak towaru
import fs from 'node:fs';
import path from 'node:path';
import { layout, escapeHtml } from './widoki.mjs';
import {
  zamowieniaKlienta, wszystkieZamowienia, zamowienie, zlozZamowienie, anulujZamowienie,
  walidujAdres, walidujZamowienie, trybKonserwacji, ustawTrybKonserwacji,
  katalog, produktKatalogu, produktApi, koszyk, zamowKoszyk, walidujFakture, zmienStatus,
  zamowienieSzczegoly, daneFaktury, adresy, dodajAdres, ustawDomyslny, usunAdres, pokazArchiwalne,
} from './logika.mjs';
import { ocenKod, banerTekst, START_PROMOCJI } from './promocje.mjs';
import { resetujBaze } from './db.mjs';
import { wersja, ustawWersje, czytajDate, dataWPolsce, dzisiaj, dniDo } from './wersja.mjs';
import { MAKS_ILOSC } from './sklep.mjs';
import { wlasneZamowienie } from './zamowienie.mjs';

const OPENAPI_FILE = path.join(import.meta.dirname, 'openapi.json');
const czekaj = (ms) => new Promise((r) => setTimeout(r, ms));

// Zwraca true, gdy wolno iść dalej; inaczej wysyła 401 albo 403.
function wymagaj(ctx, h, rola) {
  if (!ctx.user) return h.json({ error: 'Wymagane logowanie' }, 401), false;
  if (rola && ctx.user.role !== rola) return h.json({ error: 'Brak uprawnień' }, 403), false;
  return true;
}

const bladWalidacji = (h, errors) => h.json({ error: 'Błędne dane', errors }, 400);

export function trasyApi(app) {
  app.get('/health', (_c, h) => h.json({ ok: true }));

  app.post('/api/login', (ctx, h) => {
    const errors = [];
    if (!ctx.body.login) errors.push({ field: 'login', message: 'Pole jest wymagane' });
    if (!ctx.body.password) errors.push({ field: 'password', message: 'Pole jest wymagane' });
    if (errors.length) return bladWalidacji(h, errors);
    const s = h.login(ctx.body.login, ctx.body.password);
    return s ? h.json({ token: s.token, user: s.user }) : h.json({ error: 'Nieprawidłowy login lub hasło' }, 401);
  });

  app.get('/api/me', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.json(ctx.user);
  });

  // ---------- Produkty (publiczne) ----------
  app.get('/api/products', (ctx, h) => {
    const szukaj = ctx.query.q ?? '';
    const kategoria = ctx.query.category ?? '';
    // Produkty archiwalne pojawiają się tylko przy wyszukiwaniu pasującej frazy (q).
    h.json(h.all(
      `SELECT id, name, category, price_cents, stock FROM products
       WHERE name LIKE ? AND (? = '' OR category = ?) AND (archived = 0 OR ? = 1) ORDER BY category, name`,
      [`%${szukaj}%`, kategoria, kategoria, pokazArchiwalne(szukaj) ? 1 : 0],
    ));
  });

  app.get('/api/products/:id', (ctx, h) => {
    const p = h.get('SELECT id, name, category, price_cents, stock FROM products WHERE id = ?', [Number(ctx.params.id)]);
    return p ? h.json(p) : h.json({ error: 'Nie ma takiego produktu' }, 404);
  });

  // ---------- Zamówienia zalogowanego klienta ----------
  app.get('/api/orders', async (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    // ?opoznienie=1 udaje wolny serwer (0,5–2 s). Używa go strona „Moje zamówienia”.
    if (ctx.query.opoznienie) await czekaj(500 + Math.random() * 1500);
    h.json(zamowieniaKlienta(h, ctx.user.id));
  });

  app.post('/api/orders', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const { errors, productId, qty } = walidujZamowienie(ctx.body);
    if (errors.length) return bladWalidacji(h, errors);
    const produkt = h.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!produkt) return h.json({ error: 'Nie ma takiego produktu' }, 404);
    const z = zlozZamowienie(h, ctx.user.id, productId, qty);
    return z ? h.json(z, 201) : h.json({ error: 'Brak towaru na stanie' }, 409);
  });

  app.get('/api/orders/:number', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const z = zamowienie(h, ctx.params.number);
    // Cudze zamówienie wygląda jak nieistniejące: nie zdradzamy, że istnieje.
    if (!z || (ctx.user.role !== 'admin' && z.customer !== ctx.user.login)) return h.json({ error: 'Nie ma takiego zamówienia' }, 404);
    h.json(z);
  });

  // Faktura do zamówienia na firmę (dane jak w pliku z „Pobierz fakturę”).
  app.get('/api/orders/:number/invoice', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const z = wlasneZamowienie(ctx, h, ctx.params.number);
    if (!z) return h.json({ error: 'Nie ma takiego zamówienia' }, 404);
    if (!z.invoice || z.status === 'cancelled') return h.json({ error: 'To zamówienie nie ma faktury' }, 404);
    h.json(daneFaktury(h, z));
  });

  // ---------- Katalog: ceny promocyjne, kafelki i karta produktu ----------
  app.get('/api/catalog', (ctx, h) => {
    const sort = ctx.query.sort ?? '';
    if (!['', 'cena', 'cena-malejaco', 'nazwa'].includes(sort)) {
      return bladWalidacji(h, [{ field: 'sort', message: 'Dozwolone: cena, cena-malejaco, nazwa' }]);
    }
    h.json(katalog(h, { q: ctx.query.q ?? '', kategoria: ctx.query.category ?? '', sort }).map((p) => produktApi(p)));
  });

  app.get('/api/catalog/:id', (ctx, h) => {
    const p = produktKatalogu(h, Number(ctx.params.id));
    return p ? h.json(produktApi(p, true)) : h.json({ error: 'Nie ma takiego produktu' }, 404);
  });

  // ---------- Koszyk i kod rabatowy ----------
  const koszykApi = (h, userId) => {
    const k = koszyk(h, userId);
    return {
      items: k.pozycje.map((i) => ({
        id: i.id, product_id: i.product_id, name: i.name, qty: i.qty,
        unit_price_cents: i.cena_cents, total_cents: i.cena_cents * i.qty,
      })),
      subtotal_cents: k.sumaPrzedRabatem,
      discount: k.kod ? { code: k.kod.kod ?? null, valid: k.kod.ok, message: k.kod.komunikat, amount_cents: k.rabat } : null,
      total_cents: k.suma,
    };
  };

  app.get('/api/cart', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.json(koszykApi(h, ctx.user.id));
  });

  app.post('/api/cart/items', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    // Ilość 1–1000, jak na karcie produktu (inaczej niż POST /api/orders: 1–10).
    const { errors: bledy, productId } = walidujZamowienie({ ...ctx.body, qty: 1 });
    const qty = ctx.body.qty ?? 1;
    const errors = [...bledy];
    if (!Number.isInteger(qty) || qty < 1 || qty > MAKS_ILOSC) errors.push({ field: 'qty', message: `Ilość musi być liczbą całkowitą od 1 do ${MAKS_ILOSC}` });
    if (errors.length) return bladWalidacji(h, errors);
    const p = h.get('SELECT id, stock FROM products WHERE id = ?', [productId]);
    if (!p) return h.json({ error: 'Nie ma takiego produktu' }, 404);
    if (p.stock === 0) return h.json({ error: 'Brak towaru na stanie' }, 409);
    h.run(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET qty = MIN(qty + excluded.qty, ${MAKS_ILOSC})`,
      [ctx.user.id, p.id, qty],
    );
    h.json(koszykApi(h, ctx.user.id), 201);
  });

  app.delete('/api/cart', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.run('DELETE FROM cart_items WHERE user_id = ?', [ctx.user.id]);
    h.run('DELETE FROM cart_codes WHERE user_id = ?', [ctx.user.id]);
    h.json(koszykApi(h, ctx.user.id));
  });

  app.post('/api/cart/discount', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const wynik = ocenKod(ctx.body.code, koszyk(h, ctx.user.id).pozycje);
    if (!wynik.ok) return bladWalidacji(h, [{ field: 'code', message: wynik.komunikat }]);
    h.run('INSERT INTO cart_codes (user_id, code) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET code = excluded.code', [ctx.user.id, wynik.kod]);
    h.json(koszykApi(h, ctx.user.id));
  });

  app.delete('/api/cart/discount', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.run('DELETE FROM cart_codes WHERE user_id = ?', [ctx.user.id]);
    h.json(koszykApi(h, ctx.user.id));
  });

  // Zamówienie z koszyka; z polem invoice: { nip, company } to zamówienie na firmę.
  app.post('/api/cart/checkout', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    let faktura = null;
    if (ctx.body.invoice !== undefined && ctx.body.invoice !== null) {
      const wynik = walidujFakture(typeof ctx.body.invoice === 'object' ? ctx.body.invoice : {});
      if (wynik.errors.length) return bladWalidacji(h, wynik.errors);
      faktura = wynik.faktura;
    }
    if (koszyk(h, ctx.user.id).pozycje.length === 0) return h.json({ error: 'Koszyk jest pusty' }, 409);
    const numery = zamowKoszyk(h, ctx.user.id, faktura);
    h.json({ orders: numery.map((n) => zamowienieApi(h, n)) }, 201);
  });

  // Zamówienie firmowe na jeden produkt, bez koszyka (np. do przygotowania danych w teście).
  app.post('/api/business-orders', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const errors = [];
    const productId = ctx.body.product_id;
    const qty = ctx.body.qty ?? 1;
    if (!Number.isInteger(productId) || productId < 1) errors.push({ field: 'product_id', message: 'Musi być dodatnią liczbą całkowitą' });
    if (!Number.isInteger(qty) || qty < 1 || qty > 1000) errors.push({ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 1000' });
    const { errors: bledyFaktury, faktura } = walidujFakture(ctx.body);
    errors.push(...bledyFaktury);
    if (errors.length) return bladWalidacji(h, errors);
    if (!h.get('SELECT id FROM products WHERE id = ?', [productId])) return h.json({ error: 'Nie ma takiego produktu' }, 404);
    const z = zlozZamowienie(h, ctx.user.id, productId, qty, { faktura });
    return z ? h.json(zamowienieApi(h, z.number), 201) : h.json({ error: 'Brak towaru na stanie' }, 409);
  });

  // ---------- Adresy w profilu ----------
  app.get('/api/account/addresses', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.json(adresy(h, ctx.user.id));
  });

  app.post('/api/account/addresses', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const { errors, adres } = dodajAdres(h, ctx.user.id, ctx.body);
    if (errors) return bladWalidacji(h, errors);
    h.json(adres, 201);
  });

  app.delete('/api/account/addresses/:id', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const wynik = usunAdres(h, ctx.user.id, Number(ctx.params.id));
    if (wynik === 'glowny') return h.json({ error: 'Adresu głównego nie można usunąć' }, 409);
    if (!wynik) return h.json({ error: 'Nie ma takiego adresu' }, 404);
    h.json(adresy(h, ctx.user.id));
  });

  app.put('/api/account/addresses/:id/default', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || !ustawDomyslny(h, ctx.user.id, id)) return h.json({ error: 'Nie ma takiego adresu' }, 404);
    h.json(adresy(h, ctx.user.id));
  });

  // ---------- Adres dostawy ----------
  app.get('/api/account/address', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    h.json(h.get('SELECT street, postal_code, city, phone FROM users WHERE id = ?', [ctx.user.id]));
  });

  app.post('/api/account/address', (ctx, h) => {
    if (!wymagaj(ctx, h)) return;
    const { errors, adres } = walidujAdres(ctx.body);
    if (errors.length) return bladWalidacji(h, errors);
    h.run('UPDATE users SET street = ?, postal_code = ?, city = ?, phone = ? WHERE id = ?', [
      adres.street, adres.postal_code, adres.city, adres.phone, ctx.user.id,
    ]);
    h.json(adres);
  });

  // ---------- Admin ----------
  app.get('/api/admin/orders', (ctx, h) => {
    if (!wymagaj(ctx, h, 'admin')) return;
    h.json(wszystkieZamowienia(h, ctx.query.q ?? ''));
  });

  app.post('/api/admin/orders/:number/cancel', (ctx, h) => {
    if (!wymagaj(ctx, h, 'admin')) return;
    if (!zamowienie(h, ctx.params.number)) return h.json({ error: 'Nie ma takiego zamówienia' }, 404);
    const z = anulujZamowienie(h, ctx.params.number);
    return z ? h.json(z) : h.json({ error: 'Zamówienie jest już anulowane' }, 409);
  });

  app.put('/api/admin/orders/:number/status', (ctx, h) => {
    if (!wymagaj(ctx, h, 'admin')) return;
    const wynik = zmienStatus(h, ctx.params.number, ctx.body.status);
    if (wynik.kod === 400) return bladWalidacji(h, [{ field: 'status', message: wynik.blad }]);
    if (wynik.blad) return h.json({ error: wynik.blad }, wynik.kod);
    h.json(wynik.z);
  });

  // Reset bazy dla trenera (np. na serwerze w chmurze). Działa tylko, gdy ustawiono NAMSSOR_RESET_TOKEN;
  // token w nagłówku X-Reset-Token. Bez zmiennej endpointu nie ma (404).
  app.post('/api/admin/reset', (ctx, h) => {
    const token = process.env.NAMSSOR_RESET_TOKEN;
    if (!token) return h.json({ error: 'Nie znaleziono' }, 404);
    if (ctx.req.headers['x-reset-token'] !== token) return h.json({ error: 'Zły token resetu' }, 403);
    resetujBaze(ctx.db);
    h.json({ ok: true, message: 'Baza odtworzona z danymi startowymi' });
  });

  // Przełącznik wersji w działającej aplikacji (trener): { "version": "hotfix" } albo { "version": "main" }.
  // Ten sam token co reset. Bez NAMSSOR_RESET_TOKEN endpointu nie ma (404).
  app.post('/api/admin/wersja', (ctx, h) => {
    const token = process.env.NAMSSOR_RESET_TOKEN;
    if (!token) return h.json({ error: 'Nie znaleziono' }, 404);
    if (ctx.req.headers['x-reset-token'] !== token) return h.json({ error: 'Zły token resetu' }, 403);
    if (wersja() !== '' && wersja() !== 'hotfix') return h.json({ error: `Wersji ${wersja()} nie można przełączać w działającej aplikacji` }, 409);
    const nowa = ctx.body.version === 'main' ? '' : ctx.body.version;
    if (nowa !== '' && nowa !== 'hotfix') return bladWalidacji(h, [{ field: 'version', message: 'Dozwolone: main, hotfix' }]);
    ustawWersje(nowa);
    h.json({ version: wersja() || 'main' });
  });

  app.get('/api/version', (_c, h) => h.json({ version: wersja() || 'main' }));

  // Promocja: start i odliczanie. Nagłówek X-Namssor-Teraz (RRRR-MM-DD) ustawia „dzisiaj” dla tego żądania.
  app.get('/api/promocja', (ctx, h) => {
    const naglowek = ctx.req.headers['x-namssor-teraz'];
    let dzis = dzisiaj();
    if (naglowek !== undefined) {
      const d = czytajDate(naglowek);
      if (!d) return bladWalidacji(h, [{ field: 'X-Namssor-Teraz', message: 'Data w formacie RRRR-MM-DD' }]);
      dzis = dataWPolsce(d);
    }
    h.json({ start: START_PROMOCJI, today: dzis, days_left: Math.max(0, dniDo(START_PROMOCJI, dzis)), message: banerTekst(dzis) });
  });

  app.get('/api/bozena/wymagania', (ctx, h) => {
    const n = /^\d+$/.test(ctx.query.seed ?? '') ? Number(ctx.query.seed) : Math.floor(Math.random() * 1e9);
    h.json({ wymaganie: WYMAGANIA[n % WYMAGANIA.length], status: 'ostatnia zmiana, obiecuję', autor: 'Bożena' });
  });

  app.get('/api/settings/maintenance', (_c, h) => h.json({ enabled: trybKonserwacji(h) }));

  app.put('/api/settings/maintenance', (ctx, h) => {
    if (!wymagaj(ctx, h, 'admin')) return;
    if (typeof ctx.body.enabled !== 'boolean') return bladWalidacji(h, [{ field: 'enabled', message: 'Musi być true albo false' }]);
    ustawTrybKonserwacji(h, ctx.body.enabled);
    h.json({ enabled: ctx.body.enabled });
  });

  // ---------- Dokumentacja ----------
  app.get('/api/openapi.json', (_c, h) => {
    h.json(JSON.parse(fs.readFileSync(OPENAPI_FILE, 'utf8')));
  });

  // Prosta lista endpointów z openapi.json (bez Swagger UI i bez internetu).
  app.get('/api/docs', (ctx, h) => {
    const spec = JSON.parse(fs.readFileSync(OPENAPI_FILE, 'utf8'));
    const wiersze = [];
    for (const [sciezka, metody] of Object.entries(spec.paths)) {
      for (const [metoda, op] of Object.entries(metody)) {
        const kody = Object.keys(op.responses ?? {}).join(', ');
        const dostep = op.security?.length === 0 || !op.security ? 'publiczny' : op['x-role'] === 'admin' ? 'admin' : 'zalogowany';
        wiersze.push(`<tr><td><code>${metoda.toUpperCase()}</code></td><td><code>${escapeHtml(sciezka)}</code></td>
          <td>${escapeHtml(op.summary ?? '')}</td><td>${dostep}</td><td>${kody}</td></tr>`);
      }
    }
    h.html(layout({ title: 'API', user: ctx.user, body: `<h1>${escapeHtml(spec.info.title)}</h1>
      <p>${escapeHtml(spec.info.description ?? '')}</p>
      <p>Pełny opis w formacie OpenAPI: <a href="/api/openapi.json">/api/openapi.json</a></p>
      <table><thead><tr><th>Metoda</th><th>Ścieżka</th><th>Opis</th><th>Dostęp</th><th>Kody odpowiedzi</th></tr></thead>
      <tbody>${wiersze.join('')}</tbody></table>` }));
  });
}

const zamowienieApi = (h, numer) => {
  const z = zamowienieSzczegoly(h, numer);
  return {
    number: z.number, status: z.status, created_at: z.created_at, product_id: z.product_id, product: z.product, qty: z.qty,
    unit_price_cents: z.unit_price_cents, total_cents: z.total_cents, discount_code: z.discount_code,
    invoice: z.invoice ? { nip: z.nip, company: z.company } : null,
  };
};

const WYMAGANIA = [
  'Przycisk „Kup teraz” ma być bardziej zielony, ale nie za bardzo.',
  'Kod rabatowy ma działać także wczoraj.',
  'Koszyk ma pamiętać produkty, których klient jeszcze nie dodał.',
  'Faktura ma być w PDF, ale tak, żeby dało się ją edytować w Wordzie.',
  'Licznik do Czarnego Piątku ma liczyć szybciej.',
  'Cena promocyjna ma być niższa od regularnej o 20%, chyba że wyższa.',
  'Testy mają przechodzić także wtedy, gdy aplikacja nie działa.',
  'Strona ma się ładować w 0 sekund, a „Ładowanie…” ma być widoczne dłużej.',
  'Klient firmowy zamawia 1000 kalendarzy, ale płaci za 999.',
  'To samo co wczoraj, tylko na odwrót.',
];
