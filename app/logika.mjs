// Logika sklepu wspólna dla stron HTML i API: zamówienia, walidacja, tryb konserwacji.

export function trybKonserwacji(h) {
  return h.get("SELECT value FROM settings WHERE key = 'maintenance'")?.value === '1';
}

export function ustawTrybKonserwacji(h, wlaczony) {
  h.run("INSERT INTO settings (key, value) VALUES ('maintenance', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [wlaczony ? '1' : '0']);
}

const ORDER_SQL = `SELECT o.id, o.number, o.qty, o.status, o.created_at, p.id AS product_id, p.name AS product,
  p.price_cents * o.qty AS total_cents, u.login AS customer
  FROM orders o JOIN products p ON p.id = o.product_id JOIN users u ON u.id = o.user_id`;

export function zamowieniaKlienta(h, userId) {
  return h.all(`${ORDER_SQL} WHERE o.user_id = ? ORDER BY o.id DESC`, [userId]);
}

export function wszystkieZamowienia(h, szukaj = '') {
  const q = `%${szukaj}%`;
  return h.all(`${ORDER_SQL} WHERE o.number LIKE ? OR p.name LIKE ? OR u.login LIKE ? ORDER BY o.id DESC`, [q, q, q]);
}

export function zamowienie(h, number) {
  return h.get(`${ORDER_SQL} WHERE o.number = ?`, [number]);
}

function nastepnyNumer(h) {
  const row = h.get('SELECT COALESCE(MAX(id), 0) + 1001 AS n FROM orders');
  return `ZAM-${row.n}`;
}

// Zwraca zamówienie albo null, gdy brakuje towaru.
export function zlozZamowienie(h, userId, productId, qty) {
  const r = h.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [qty, productId, qty]);
  if (r.changes === 0) return null;
  const number = nastepnyNumer(h);
  h.run('INSERT INTO orders (number, user_id, product_id, qty) VALUES (?, ?, ?, ?)', [number, userId, productId, qty]);
  return zamowienie(h, number);
}

// Zamienia koszyk na zamówienia (jedno zamówienie na pozycję). Zwraca numery.
export function zamowKoszyk(h, userId) {
  const items = h.all('SELECT product_id, qty FROM cart_items WHERE user_id = ?', [userId]);
  const numery = [];
  for (const item of items) {
    const z = zlozZamowienie(h, userId, item.product_id, item.qty);
    if (z) numery.push(z.number);
  }
  h.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return numery;
}

export function koszyk(h, userId) {
  const pozycje = h.all(
    'SELECT c.id, c.qty, p.id AS product_id, p.name, p.price_cents FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY p.name',
    [userId],
  );
  const suma = pozycje.reduce((s, i) => s + i.price_cents * i.qty, 0);
  return { pozycje, suma };
}

// Anuluje zamówienie (po id albo numerze) i zwraca towar na stan. null = brak albo już anulowane.
export function anulujZamowienie(h, idAlboNumer) {
  const z = h.get("SELECT * FROM orders WHERE (id = ? OR number = ?) AND status = 'new'", [idAlboNumer, idAlboNumer]);
  if (!z) return null;
  h.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [z.id]);
  h.run('UPDATE products SET stock = stock + ? WHERE id = ?', [z.qty, z.product_id]);
  return zamowienie(h, z.number);
}

// ---------- Walidacja (ta sama dla formularza i API) ----------
// Wynik: lista błędów [{ field, message }]. Pusta lista = dane poprawne.

export function walidujAdres(dane) {
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
}

export function walidujZamowienie(dane) {
  const errors = [];
  const productId = dane.product_id;
  const qty = dane.qty ?? 1;
  if (productId === undefined || productId === null || productId === '') errors.push({ field: 'product_id', message: 'Pole jest wymagane' });
  else if (!Number.isInteger(productId) || productId < 1) errors.push({ field: 'product_id', message: 'Musi być dodatnią liczbą całkowitą' });
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) errors.push({ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' });
  return { errors, productId, qty };
}
