// Baza aplikacji: SQLite przez wbudowany moduł node:sqlite (Node >= 22.13).
// Jeden plik, domyślnie data/app.db. Inną ścieżkę ustawisz zmienną NAMSSOR_DB
// albo APP_DB_PATH (np. gdy repo leży w folderze synchronizowanym przez OneDrive).
import * as sqlite from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Na Node 22/24 klasa nazywa się DatabaseSync, na nowszych także Database.
const Database = sqlite.DatabaseSync ?? sqlite.Database;

export const ROOT = path.resolve(import.meta.dirname, '..');

export function dbPath() {
  const zmienna = process.env.NAMSSOR_DB || process.env.APP_DB_PATH;
  return zmienna ? path.resolve(zmienna) : path.join(ROOT, 'data', 'app.db');
}

export function openDb(file = dbPath()) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

// Wersja schematu bazy. Baza ze starszej wersji aplikacji jest tworzona od nowa (dane startowe).
const WERSJA_SCHEMATU = 2;
const TABELE = ['sessions', 'cart_codes', 'cart_items', 'addresses', 'orders', 'products', 'users', 'settings'];

export function ensureSchema(db) {
  const wersja = get(db, 'PRAGMA user_version').user_version;
  const saTabele = get(db, "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'users'").n > 0;
  if (saTabele && wersja < WERSJA_SCHEMATU) {
    console.log('Baza pochodzi ze starszej wersji aplikacji: tworzę ją od nowa z danymi startowymi.');
    usunTabele(db);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
      street TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      default_address_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      promo_percent INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE (user_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS cart_codes (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M', 'now', 'localtime')),
      unit_price_cents INTEGER,
      discount_code TEXT,
      invoice INTEGER NOT NULL DEFAULT 0,
      nip TEXT,
      company TEXT,
      address TEXT
    );
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      street TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  db.exec(`PRAGMA user_version = ${WERSJA_SCHEMATU}`);
  if (get(db, 'SELECT COUNT(*) AS n FROM users').n === 0) seed(db);
  kontaZeZmiennych(db);
}

// Konta zależne od zmiennych (wspólny serwer szkoleniowy):
//   NAMSSOR_ADMIN_HASLO   nowe hasło konta admin (bez zmiennej: admin123),
//   NAMSSOR_TRENER_HASLO  konto „trener” z rolą admin; bez zmiennej konta nie ma.
function kontaZeZmiennych(db) {
  run(db, 'UPDATE users SET password = ? WHERE login = ?', [process.env.NAMSSOR_ADMIN_HASLO || 'admin123', 'admin']);
  const trener = process.env.NAMSSOR_TRENER_HASLO;
  if (trener) {
    run(db, `INSERT INTO users (login, password, role, street, postal_code, city, phone)
             VALUES ('trener', ?, 'admin', 'ul. Szkoleniowa 1', '00-001', 'Warszawa', '500 100 400')
             ON CONFLICT(login) DO UPDATE SET password = excluded.password, role = 'admin'`, [trener]);
  } else {
    run(db, "DELETE FROM users WHERE login = 'trener'");
  }
}

function usunTabele(db) {
  db.exec('PRAGMA foreign_keys = OFF');
  for (const t of TABELE) db.exec(`DROP TABLE IF EXISTS ${t}`);
  db.exec('PRAGMA foreign_keys = ON');
}

// Reset bazy w działającej aplikacji (endpoint trenera): wszystkie tabele od nowa, dane startowe.
export function resetujBaze(db) {
  usunTabele(db);
  ensureSchema(db);
}

// Dane startowe. Zawsze te same (bez losowości), żeby testy na każdym laptopie
// widziały identyczny stan po `npm run db:reset`.
export const SEED_PRODUCTS = [
  ['Szampon nawilżający', 'Włosy', 1299, 25],
  ['Odżywka do włosów', 'Włosy', 1499, 18],
  ['Maska do włosów z olejem arganowym', 'Włosy', 2499, 0],
  ['Lakier do włosów', 'Włosy', 1199, 12],
  ['Krem do twarzy na dzień', 'Twarz', 3299, 15],
  ['Płyn micelarny', 'Twarz', 1599, 30],
  ['Serum z witaminą C', 'Twarz', 4999, 0],
  ['Maseczka glinkowa', 'Twarz', 899, 22],
  ['Żel pod prysznic', 'Ciało', 999, 40],
  ['Balsam do ciała', 'Ciało', 1899, 20],
  ['Mydło w kostce', 'Ciało', 499, 50],
  ['Dezodorant w sprayu', 'Ciało', 1399, 0],
  ['Pasta do zębów', 'Higiena jamy ustnej', 899, 35],
  ['Szczoteczka do zębów', 'Higiena jamy ustnej', 799, 28],
  ['Płyn do płukania jamy ustnej', 'Higiena jamy ustnej', 1699, 14],
  ['Nić dentystyczna', 'Higiena jamy ustnej', 699, 9],
  ['Chusteczki nawilżane dla dzieci', 'Dziecko', 799, 60],
  ['Szampon dla dzieci', 'Dziecko', 1099, 16],
  ['Krem ochronny dla dzieci', 'Dziecko', 1499, 11],
  ['Płyn do mycia naczyń', 'Dom', 699, 45],
];

// Produkty dodane w wersji „Czarny Piątek”. Nowe id (21, 22), żeby nie przesunąć istniejących.
// [nazwa, kategoria, cena w groszach, stan, archiwalny]
export const SEED_PRODUCTS_SWIETA = [
  ['Kalendarz adwentowy 2026', 'Święta', 3999, 3000, 0],
  ['Kalendarz adwentowy 2025', 'Święta', 3999, 7, 1],
];

// Rabat promocyjny w procentach (id produktu → procent). Plakietka „-20%”.
export const PROMOCJE = { 2: 20, 5: 20, 7: 20, 22: 20 };

const OPISY = {
  1: 'Szampon do codziennego mycia włosów suchych i normalnych. Pojemność 400 ml.',
  2: 'Odżywka bez spłukiwania, ułatwia rozczesywanie. Pojemność 200 ml.',
  3: 'Maska regenerująca z olejem arganowym do włosów zniszczonych. Pojemność 250 ml.',
  4: 'Lakier mocno utrwalający, nie skleja włosów. Pojemność 250 ml.',
  5: 'Lekki krem nawilżający z filtrem SPF 15. Pojemność 50 ml.',
  6: 'Płyn do demakijażu twarzy i oczu. Pojemność 400 ml.',
  7: 'Serum rozświetlające z witaminą C. Pojemność 30 ml.',
  8: 'Maseczka oczyszczająca z zieloną glinką. Pojemność 75 ml.',
  9: 'Żel pod prysznic o zapachu cytrusów. Pojemność 500 ml.',
  10: 'Balsam nawilżający do całego ciała. Pojemność 400 ml.',
  11: 'Mydło glicerynowe w kostce. Waga 100 g.',
  12: 'Dezodorant w sprayu, ochrona do 48 godzin. Pojemność 150 ml.',
  13: 'Pasta wybielająca z fluorem. Pojemność 75 ml.',
  14: 'Szczoteczka manualna, włosie średnie.',
  15: 'Płyn odświeżający z miętą, bez alkoholu. Pojemność 500 ml.',
  16: 'Nić miętowa woskowana, 50 m.',
  17: 'Chusteczki dla niemowląt, bezzapachowe, 64 sztuki.',
  18: 'Delikatny szampon „bez łez”. Pojemność 300 ml.',
  19: 'Krem na odparzenia z tlenkiem cynku. Pojemność 75 ml.',
  20: 'Płyn do naczyń o zapachu limonki. Pojemność 900 ml.',
  21: 'Kalendarz z 24 okienkami i kosmetykami w miniaturze. Edycja 2026.',
  22: 'Kalendarz z 24 okienkami i kosmetykami w miniaturze. Edycja 2025, ostatnie sztuki z magazynu.',
};

// Konta uczestników szkolenia (fikcyjne): tester01 … tester12, wspólne hasło.
export const HASLO_TESTEROW = 'czarny-piatek-2026';
export const TESTERZY = Array.from({ length: 12 }, (_, i) => `tester${String(i + 1).padStart(2, '0')}`);

// Klient firmowy z zamówieniem na fakturę.
export const BIURO = { login: 'biuro', haslo: 'biuro123', firma: 'Biuro Mikołaja', nip: '2412241228' };

function seed(db) {
  db.exec('BEGIN');
  try {
    // Konta demo są fikcyjne. Dane logowania opisuje README i .env.example.
    run(db, `INSERT INTO users (id, login, password, role, street, postal_code, city, phone)
             VALUES (1, 'user', 'user123', 'user', 'ul. Przykładowa 12/3', '00-001', 'Warszawa', '500 100 200')`);
    run(db, `INSERT INTO users (id, login, password, role) VALUES (2, 'admin', 'admin123', 'admin')`);
    run(db, `INSERT INTO users (id, login, password, role, street, postal_code, city, phone)
             VALUES (3, ?, ?, 'user', 'ul. Reniferowa 24', '24-120', 'Gwiazdkowo', '500 240 120')`, [BIURO.login, BIURO.haslo]);
    TESTERZY.forEach((login, i) =>
      run(db, `INSERT INTO users (id, login, password, role, street, postal_code, city, phone)
               VALUES (?, ?, ?, 'user', 'ul. Testowa 1', '00-001', 'Warszawa', '500 100 200')`, [101 + i, login, HASLO_TESTEROW]),
    );
    // Stany z SEED_PRODUCTS razy 4 (między 50 a 200), żeby na wspólnym serwerze starczyło towaru; 0 zostaje 0.
    const stan = (n, i) => (i >= SEED_PRODUCTS.length || n === 0 ? n : Math.min(200, Math.max(50, n * 4)));
    SEED_PRODUCTS.concat(SEED_PRODUCTS_SWIETA).forEach(([name, category, price, stock0, archived = 0], i) =>
      run(db, 'INSERT INTO products (id, name, category, price_cents, stock, description, promo_percent, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        i + 1, name, category, price, stan(stock0, i), OPISY[i + 1] ?? '', PROMOCJE[i + 1] ?? 0, archived,
      ]),
    );
    // Zamówienia startowe: [numer, id klienta, id produktu, ilość, status, data]
    const orders = [
      ['ZAM-1001', 1, 1, 1, 'new', '2026-10-01 10:15'],
      ['ZAM-1002', 1, 13, 2, 'cancelled', '2026-10-03 18:40'],
      ['ZAM-1003', 1, 5, 1, 'new', '2026-10-07 09:05'],
      ['ZAM-1004', 1, 9, 3, 'new', '2026-10-12 14:30'],
      ['ZAM-1005', 2, 6, 1, 'new', '2026-10-15 11:00'],
      ['ZAM-1006', 1, 11, 4, 'new', '2026-10-20 16:20'],
    ];
    orders.forEach(([number, userId, productId, qty, status, createdAt], i) =>
      run(db, 'INSERT INTO orders (id, number, user_id, product_id, qty, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        i + 1, number, userId, productId, qty, status, createdAt,
      ]),
    );
    // Biuro Mikołaja: 1000 kalendarzy adwentowych na fakturę, już opłacone. Stan kalendarzy uwzględnia to zamówienie.
    run(db, `INSERT INTO orders (id, number, user_id, product_id, qty, status, created_at, unit_price_cents, invoice, nip, company, address)
             VALUES (7, 'ZAM-1007', 3, 21, 1000, 'paid', '2026-11-02 08:00', 3999, 1, ?, ?, 'ul. Reniferowa 24, 24-120 Gwiazdkowo')`, [BIURO.nip, BIURO.firma]);
    run(db, 'UPDATE products SET stock = stock - 1000 WHERE id = 21');
    run(db, "INSERT INTO settings (key, value) VALUES ('maintenance', '0')");
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function all(db, sql, params = []) {
  return db.prepare(sql).all(...params);
}
export function get(db, sql, params = []) {
  return db.prepare(sql).get(...params);
}
export function run(db, sql, params = []) {
  return db.prepare(sql).run(...params);
}
