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
} from './logika.mjs';

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
    h.json(h.all(
      "SELECT * FROM products WHERE name LIKE ? AND (? = '' OR category = ?) ORDER BY category, name",
      [`%${szukaj}%`, kategoria, kategoria],
    ));
  });

  app.get('/api/products/:id', (ctx, h) => {
    const p = h.get('SELECT * FROM products WHERE id = ?', [Number(ctx.params.id)]);
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
