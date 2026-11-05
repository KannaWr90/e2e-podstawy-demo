// Baza aplikacji: SQLite przez wbudowany moduł node:sqlite (Node >= 22.13).
// Jeden plik, domyślnie data/app.db. Inną ścieżkę ustawisz zmienną APP_DB_PATH
// (np. gdy repo leży w folderze synchronizowanym przez OneDrive).
import * as sqlite from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Na Node 22/24 klasa nazywa się DatabaseSync, na nowszych także Database.
const Database = sqlite.DatabaseSync ?? sqlite.Database;

export const ROOT = path.resolve(import.meta.dirname, '..');

export function dbPath() {
  return process.env.APP_DB_PATH ? path.resolve(process.env.APP_DB_PATH) : path.join(ROOT, 'data', 'app.db');
}

export function openDb(file = dbPath()) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
      street TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE (user_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M', 'now', 'localtime'))
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
  if (get(db, 'SELECT COUNT(*) AS n FROM users').n === 0) seed(db);
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

function seed(db) {
  db.exec('BEGIN');
  try {
    // Konta demo są fikcyjne. Dane logowania opisuje README i .env.example.
    run(db, `INSERT INTO users (id, login, password, role, street, postal_code, city, phone)
             VALUES (1, 'user', 'user123', 'user', 'ul. Przykładowa 12/3', '00-001', 'Warszawa', '500 100 200')`);
    run(db, `INSERT INTO users (id, login, password, role) VALUES (2, 'admin', 'admin123', 'admin')`);
    SEED_PRODUCTS.forEach(([name, category, price, stock], i) =>
      run(db, 'INSERT INTO products (id, name, category, price_cents, stock) VALUES (?, ?, ?, ?, ?)', [i + 1, name, category, price, stock]),
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
