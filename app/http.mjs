// Mini-router na node:http. Bez zależności: aplikacja jest tłem dla testów,
// nie przedmiotem szkolenia.
import http from 'node:http';
import crypto from 'node:crypto';
import { all, get, run } from './db.mjs';
import { layout } from './widoki.mjs';
import { flagaHtml } from './flagi.mjs';
import { uruchomWarstwy } from './rozszerzenia.mjs';

export function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(v.join('='));
    } catch {
      // Zepsute ciasteczko (np. niepełne kodowanie %): pomijamy je, zamiast przerywać obsługę żądania.
    }
  }
  return out;
}

class BadRequest extends Error {}

const LIMIT_CIALA = 2 * 1024 * 1024;

async function readBody(req, limit = LIMIT_CIALA) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new BadRequest(`Za duże żądanie (limit ${limit >= 1024 * 1024 ? `${limit / 1024 / 1024} MB` : `${Math.round(limit / 1024)} kB`})`);
    chunks.push(c);
  }
  const buf = Buffer.concat(chunks);
  const type = req.headers['content-type'] ?? '';
  if (type.includes('multipart/form-data')) return buf; // parsuje trasa importu CSV
  const raw = buf.toString('utf8');
  if (type.includes('application/json')) {
    if (!raw) return {};
    try {
      const data = JSON.parse(raw);
      if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error();
      return data;
    } catch {
      throw new BadRequest('Nieprawidłowy JSON w treści żądania');
    }
  }
  if (type.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw));
  return {};
}

// before(ctx, h): wywoływane przed każdą trasą; zwraca true, jeśli już odpowiedziało.
export function createApp({ db, before }) {
  const routes = [];
  const app = {
    // opcje.limit: największy rozmiar treści żądania w bajtach (domyślnie 2 MB).
    route(method, pattern, handler, opcje = {}) {
      const keys = [];
      const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
      routes.push({ method, re, keys, handler, limit: opcje.limit });
    },
    get: (p, fn, o) => app.route('GET', p, fn, o),
    post: (p, fn, o) => app.route('POST', p, fn, o),
    put: (p, fn) => app.route('PUT', p, fn),
    delete: (p, fn) => app.route('DELETE', p, fn),
    server() {
      return http.createServer(async (req, res) => {
        const ctx = { req, res, url: null, db, query: {}, params: {}, body: {}, user: null };
        const h = helpers(ctx);
        const isApi = (req.url ?? '').startsWith('/api/');
        // Wszystko, co zależy od danych z żądania (adres, ciasteczka), jest w try:
        // błędne żądanie dostaje odpowiedź 400/500, a serwer działa dalej.
        try {
          let url;
          try {
            url = new URL(req.url ?? '/', 'http://localhost');
          } catch {
            throw new BadRequest('Nieprawidłowy adres żądania');
          }
          ctx.url = url;
          ctx.query = Object.fromEntries(url.searchParams);
          ctx.user = currentUser(ctx);
          if (await uruchomWarstwy(ctx, h)) return;
          for (const r of routes) {
            if (r.method !== req.method) continue;
            const m = url.pathname.match(r.re);
            if (!m) continue;
            try {
              r.keys.forEach((k, i) => (ctx.params[k] = decodeURIComponent(m[i + 1])));
            } catch {
              throw new BadRequest('Nieprawidłowy adres żądania');
            }
            if (before?.(ctx, h)) return;
            if (req.method !== 'GET') ctx.body = await readBody(req, r.limit);
            return await r.handler(ctx, h);
          }
          if (isApi) return h.json({ error: 'Nie znaleziono' }, 404);
          h.notFound();
        } catch (e) {
          if (e instanceof BadRequest) {
            if (isApi) return h.json({ error: e.message, errors: [] }, 400);
            return h.html(layout({ title: 'Błąd', user: ctx.user, body: `<h1>Błędne żądanie</h1><p>${e.message}</p>` }), 400);
          }
          console.error(e);
          if (!res.headersSent) h.json({ error: 'Błąd serwera' }, 500);
          else res.end();
        }
      });
    },
  };
  return app;
}

function currentUser(ctx) {
  const auth = ctx.req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : parseCookies(ctx.req).sid;
  if (!token) return null;
  return get(ctx.db, 'SELECT u.id, u.login, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?', [token]) ?? null;
}

function helpers(ctx) {
  const { res, db } = ctx;
  return {
    html(body, status = 200) {
      res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' }).end(body);
    },
    json(data, status = 200) {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }).end(JSON.stringify(data));
    },
    // Plik do pobrania (np. eksport CSV): przeglądarka zapisuje go zamiast wyświetlać.
    download(content, filename, type) {
      res.writeHead(200, { 'content-type': type, 'content-disposition': `attachment; filename="${filename}"` }).end(content);
    },
    // Strona 404 (HTML). Pod spodem podpis dewelopera.
    notFound() {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(layout({ title: 'Nie znaleziono', user: ctx.user, body:
        `<h1>Nie znaleziono strony</h1><p><a href="/">Wróć do sklepu</a></p><p class="mirek" data-testid="dev-note">Mirek: „U mnie działa”.</p>${flagaHtml(2)}` }));
    },
    redirect(to) {
      res.writeHead(303, { location: to }).end();
    },
    login(login, password) {
      const user = get(db, 'SELECT id, login, role FROM users WHERE login = ? AND password = ?', [String(login ?? ''), String(password ?? '')]);
      if (!user) return null;
      const token = crypto.randomBytes(16).toString('hex');
      run(db, 'INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, user.id]);
      // Secure, gdy żądanie przyszło przez HTTPS (także przez proxy, np. Cloud Run: X-Forwarded-Proto).
      const https = ctx.req.socket.encrypted || String(ctx.req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim() === 'https';
      res.setHeader('set-cookie', `sid=${token}; Path=/; HttpOnly; SameSite=Lax${https ? '; Secure' : ''}`);
      return { user, token };
    },
    logout() {
      const token = parseCookies(ctx.req).sid;
      if (token) run(db, 'DELETE FROM sessions WHERE token = ?', [token]);
      res.setHeader('set-cookie', 'sid=; Path=/; Max-Age=0');
    },
    all: (sql, params) => all(db, sql, params),
    get: (sql, params) => get(db, sql, params),
    run: (sql, params) => run(db, sql, params),
  };
}
