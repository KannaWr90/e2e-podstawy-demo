// Namssor: fikcyjna drogeria do ćwiczeń z testów automatycznych.
// Jedna aplikacja: sklep dla klienta, panel /admin i REST API pod /api.
// Uruchom: npm start   (zatrzymanie: Ctrl+C)
import { openDb, ensureSchema, dbPath } from './db.mjs';
import { createApp } from './http.mjs';
import { layout } from './widoki.mjs';
import { trybKonserwacji } from './logika.mjs';
import { trasySklepu } from './sklep.mjs';
import { trasyAdmina } from './admin.mjs';
import { trasyApi } from './api.mjs';
import { trasyDlaSzybszych } from './dla-szybszych.mjs';
import { trasyZamowienia } from './zamowienie.mjs';
import { trasyProfilu } from './profil.mjs';
import { rozszerzenia } from './rozszerzenia.mjs';
import { wersja } from './wersja.mjs';
import * as logika from './logika.mjs';
import * as promocje from './promocje.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Wydania inne niż zwykłe i „hotfix” potrzebują modułu wydania spoza repo:
// plik ze zmiennej NAMSSOR_RC_MODULE albo app/rozszerzenie.local.mjs (w .gitignore).
if (wersja() !== '' && wersja() !== 'hotfix') {
  const plik = path.resolve(process.env.NAMSSOR_RC_MODULE || path.join(import.meta.dirname, 'rozszerzenie.local.mjs'));
  if (!fs.existsSync(plik)) {
    console.error(`\nAPP_VERSION=${wersja()} wymaga modułu wydania, a pliku nie ma: ${plik}`);
    console.error('Ustaw zmienną NAMSSOR_RC_MODULE na ścieżkę modułu albo uruchom aplikację bez APP_VERSION.\n');
    process.exit(1);
  }
  const modul = await import(pathToFileURL(plik).href);
  modul.default(rozszerzenia, { logika, promocje });
}

// Port: PORT (ustawia np. Cloud Run) albo APP_PORT, domyślnie 4100.
// Gdy port albo HOST przychodzi z zewnątrz, nasłuchujemy na HOST (domyślnie 0.0.0.0, wszystkie interfejsy).
const PORT = Number(process.env.PORT || process.env.APP_PORT || 4100);
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : undefined);

// Tryb konserwacji (włączany w /admin/ustawienia) blokuje sklep dla wszystkich poza adminem.
// Logowanie, panel admina, regulamin i dokumentacja API działają zawsze.
const ZAWSZE_DOSTEPNE = [/^\/logowanie$/, /^\/wyloguj$/, /^\/admin/, /^\/regulamin$/, /^\/health$/,
  /^\/api\/(login|me|docs|openapi\.json|settings\/maintenance|version|admin\/reset|admin\/wersja)$/];

function blokadaKonserwacji(ctx, h) {
  if (ctx.user?.role === 'admin' || ZAWSZE_DOSTEPNE.some((re) => re.test(ctx.url.pathname))) return false;
  if (!trybKonserwacji(h)) return false;
  if (ctx.url.pathname.startsWith('/api/')) h.json({ error: 'Sklep w trybie konserwacji' }, 503);
  else h.html(layout({ title: 'Przerwa techniczna', user: ctx.user, body: '<h1>Przerwa techniczna</h1><p>Sklep jest chwilowo niedostępny. Zapraszamy wkrótce.</p>' }), 503);
  return true;
}

const db = openDb();
ensureSchema(db);
const app = createApp({ db, before: blokadaKonserwacji });
trasySklepu(app);
trasyAdmina(app);
trasyApi(app);
trasyDlaSzybszych(app);
trasyZamowienia(app);
trasyProfilu(app);

const server = app.server();
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} jest zajęty. Aplikacja prawdopodobnie już działa w innym oknie terminala.`);
    console.error(`Sprawdź w przeglądarce http://localhost:${PORT} albo zamknij tamto okno (Ctrl+C).\n`);
    process.exit(1);
  }
  throw e;
});
server.listen(PORT, HOST, () => {
  console.log(`Namssor działa: http://localhost:${PORT}  (baza: ${dbPath()})`);
  console.log('Zatrzymanie: Ctrl+C');
});

// Zamknij bazę przy Ctrl+C, żeby plik nie został zablokowany (ważne na Windows przed db:reset).
for (const sygnal of ['SIGINT', 'SIGTERM']) {
  process.on(sygnal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
