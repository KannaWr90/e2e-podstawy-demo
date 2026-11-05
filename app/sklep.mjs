// Strony sklepu dla klienta: produkty, logowanie, koszyk, moje zamówienia, adres dostawy.
import { layout, escapeHtml, cena, flash } from './widoki.mjs';
import { koszyk, zamowKoszyk, walidujAdres } from './logika.mjs';

// Po logowaniu wracamy tylko na stronę tej aplikacji. Wszystko inne (inna domena,
// `//evil.com`, `/\evil.com`, znaki sterujące) daje stronę główną.
function bezpiecznyCel(next) {
  if (typeof next !== 'string' || !next.startsWith('/') || /[\\\u0000-\u001f\u007f]/.test(next)) return '/';
  try {
    const url = new URL(next, 'http://localhost');
    if (url.origin !== 'http://localhost') return '/';
    // Sprawdzamy wartość, którą naprawdę zwracamy: `/.//evil.com` po normalizacji daje `//evil.com`.
    const cel = url.pathname + url.search;
    if (!cel.startsWith('/') || cel.startsWith('//') || cel.includes('\\')) return '/';
    return cel;
  } catch {
    return '/';
  }
}

export function wymagajLogowania(ctx, h) {
  if (ctx.user) return true;
  h.redirect('/logowanie?next=' + encodeURIComponent(ctx.url.pathname + ctx.url.search));
  return false;
}

export function trasySklepu(app) {
  app.get('/', (ctx, h) => {
    const szukaj = ctx.query.q ?? '';
    const kategoria = ctx.query.kategoria ?? '';
    const kategorie = h.all('SELECT DISTINCT category FROM products ORDER BY category').map((r) => r.category);
    const produkty = h.all(
      "SELECT * FROM products WHERE name LIKE ? AND (? = '' OR category = ?) ORDER BY category, name",
      [`%${szukaj}%`, kategoria, kategoria],
    );
    const wiersze = produkty
      .map(
        (p) => `<tr data-testid="product-row" data-product-id="${p.id}">
        <td data-testid="product-name">${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>${cena(p.price_cents)}</td>
        <td data-testid="product-stock">${p.stock}</td>
        <td>${p.stock > 0 ? 'Dostępny' : '<span class="niedostepny">Niedostępny</span>'}</td>
        <td><form method="post" action="/koszyk/dodaj"><input type="hidden" name="product_id" value="${p.id}">
        <button type="submit" aria-label="Dodaj do koszyka: ${escapeHtml(p.name)}" ${p.stock === 0 ? 'disabled' : ''}>Dodaj do koszyka</button></form></td></tr>`,
      )
      .join('');
    const opcje = ['<option value="">Wszystkie</option>']
      .concat(kategorie.map((k) => `<option${k === kategoria ? ' selected' : ''}>${escapeHtml(k)}</option>`))
      .join('');
    const brak = produkty.length === 0 ? '<p>Brak produktów spełniających kryteria.</p>' : '';
    h.html(layout({ title: 'Produkty', user: ctx.user, active: '/', body: `<h1>Produkty</h1>
      ${flash(ctx.query.dodano ? `Dodano do koszyka: ${ctx.query.dodano}` : '')}
      <form method="get" action="/" class="filtry" role="search">
        <label>Szukaj produktu <input name="q" type="search" value="${escapeHtml(szukaj)}"></label>
        <label>Kategoria <select name="kategoria">${opcje}</select></label>
        <button type="submit">Filtruj</button></form>
      <p>Liczba produktów: <span data-testid="product-count">${produkty.length}</span></p>${brak}
      <table><thead><tr><th>Nazwa</th><th>Kategoria</th><th>Cena</th><th>Stan</th><th>Dostępność</th><th></th></tr></thead>
      <tbody>${wiersze}</tbody></table>` }));
  });

  // ---------- Logowanie ----------
  app.get('/logowanie', (ctx, h) => {
    const blad = ctx.query.error ? '<p class="error" role="alert">Nieprawidłowy login lub hasło</p>' : '';
    const next = escapeHtml(bezpiecznyCel(ctx.query.next));
    h.html(layout({ title: 'Logowanie', user: ctx.user, body: `<h1>Logowanie</h1>${blad}
      <form method="post" action="/logowanie">
        <input type="hidden" name="next" value="${next}">
        <p class="pole"><label for="login">Login</label><input id="login" name="login" autocomplete="username"></p>
        <p class="pole"><label for="haslo">Hasło</label><input id="haslo" name="password" type="password" autocomplete="current-password"></p>
        <button type="submit">Zaloguj</button></form>` }));
  });
  app.post('/logowanie', (ctx, h) => {
    const cel = bezpiecznyCel(ctx.body.next);
    if (h.login(ctx.body.login, ctx.body.password)) return h.redirect(cel);
    h.redirect('/logowanie?error=1' + (cel !== '/' ? '&next=' + encodeURIComponent(cel) : ''));
  });
  app.post('/wyloguj', (_ctx, h) => {
    h.logout();
    h.redirect('/');
  });

  // ---------- Koszyk ----------
  app.post('/koszyk/dodaj', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/');
    const produkt = h.get('SELECT * FROM products WHERE id = ?', [Number(ctx.body.product_id)]);
    if (!produkt || produkt.stock === 0) return h.redirect('/');
    h.run(
      'INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, 1) ON CONFLICT(user_id, product_id) DO UPDATE SET qty = qty + 1',
      [ctx.user.id, produkt.id],
    );
    h.redirect('/?dodano=' + encodeURIComponent(produkt.name));
  });

  app.get('/koszyk', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const { pozycje, suma } = koszyk(h, ctx.user.id);
    const wiersze = pozycje
      .map(
        (i) => `<tr data-testid="cart-item"><td data-testid="cart-item-name">${escapeHtml(i.name)}</td>
        <td data-testid="cart-item-qty">${i.qty}</td><td>${cena(i.price_cents * i.qty)}</td>
        <td><form method="post" action="/koszyk/usun"><input type="hidden" name="item_id" value="${i.id}">
        <button type="submit" aria-label="Usuń: ${escapeHtml(i.name)}">Usuń</button></form></td></tr>`,
      )
      .join('');
    const pusty = pozycje.length === 0;
    h.html(layout({ title: 'Koszyk', user: ctx.user, active: '/koszyk', body: `<h1>Koszyk</h1>
      <p>Pozycji: <span data-testid="cart-count">${pozycje.length}</span>, razem: <span data-testid="cart-total">${cena(suma)}</span></p>
      ${pusty ? '<p>Koszyk jest pusty. <a href="/">Wybierz produkty</a></p>' : ''}
      <table><thead><tr><th>Produkt</th><th>Ilość</th><th>Wartość</th><th></th></tr></thead><tbody>${wiersze}</tbody></table>
      <form method="post" action="/koszyk/zamow" style="display:inline"><button type="submit" ${pusty ? 'disabled' : ''}>Złóż zamówienie (płatność przy odbiorze)</button></form>
      ${pusty ? '' : ' <a class="przycisk" href="/koszyk/platnosc">Zapłać kartą online</a>'}` }));
  });

  app.post('/koszyk/usun', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie');
    h.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [Number(ctx.body.item_id), ctx.user.id]);
    h.redirect('/koszyk');
  });

  app.post('/koszyk/zamow', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie');
    const numery = zamowKoszyk(h, ctx.user.id);
    h.redirect(numery.length ? '/zamowienia?zlozono=' + numery.join(',') : '/koszyk');
  });

  // ---------- Moje zamówienia: dane ładowane z opóźnieniem ----------
  // Strona przychodzi pusta, ze wskaźnikiem „Ładowanie…”. Skrypt pobiera listę z API,
  // które celowo odpowiada po 0,5–2 s. Dobry materiał do rozmowy o automatycznym czekaniu.
  app.get('/zamowienia', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    h.html(layout({ title: 'Moje zamówienia', user: ctx.user, active: '/zamowienia', body: `<h1>Moje zamówienia</h1>
      ${flash(ctx.query.zlozono ? `Złożono zamówienie: ${ctx.query.zlozono}` : '')}
      <p class="ladowanie" role="status" id="ladowanie"><span class="spinner" aria-hidden="true"></span>Ładowanie…</p>
      <div id="lista-zamowien"></div>
      <script>
      const STATUS = { new: 'Nowe', cancelled: 'Anulowane' };
      const zl = (gr) => (gr / 100).toFixed(2).replace('.', ',') + ' zł';
      fetch('/api/orders?opoznienie=1')
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((zamowienia) => {
          const miejsce = document.getElementById('lista-zamowien');
          if (zamowienia.length === 0) {
            miejsce.innerHTML = '<p>Nie masz jeszcze zamówień.</p>';
            return;
          }
          const tabela = document.createElement('table');
          tabela.innerHTML = '<thead><tr><th>Numer</th><th>Data</th><th>Produkt</th><th>Ilość</th><th>Wartość</th><th>Status</th></tr></thead><tbody></tbody>';
          for (const z of zamowienia) {
            const tr = document.createElement('tr');
            tr.dataset.testid = 'order-row';
            for (const [tekst, testid] of [[z.number], [z.created_at], [z.product], [z.qty], [zl(z.total_cents)], [STATUS[z.status], 'order-status']]) {
              const td = document.createElement('td');
              td.textContent = tekst;
              if (testid) td.dataset.testid = testid;
              tr.append(td);
            }
            tabela.tBodies[0].append(tr);
          }
          miejsce.append(tabela);
        })
        .catch(() => {
          document.getElementById('lista-zamowien').innerHTML = '<p class="error" role="alert">Nie udało się pobrać zamówień.</p>';
        })
        .finally(() => document.getElementById('ladowanie').remove());
      </script>` }));
  });

  // ---------- Adres dostawy: formularz z walidacją po stronie serwera ----------
  // `novalidate` wyłącza podpowiedzi przeglądarki, więc widać komunikaty serwera.
  app.get('/konto/adres', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const adres = h.get('SELECT street, postal_code, city, phone FROM users WHERE id = ?', [ctx.user.id]);
    h.html(formularzAdresu(ctx, adres, [], Boolean(ctx.query.zapisano)));
  });

  app.post('/konto/adres', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/konto/adres');
    const { errors, adres } = walidujAdres(ctx.body);
    if (errors.length) return h.html(formularzAdresu(ctx, ctx.body, errors, false), 400);
    h.run('UPDATE users SET street = ?, postal_code = ?, city = ?, phone = ? WHERE id = ?', [
      adres.street, adres.postal_code, adres.city, adres.phone, ctx.user.id,
    ]);
    h.redirect('/konto/adres?zapisano=1');
  });
}

const POLA_ADRESU = [
  ['street', 'Ulica i numer', 'np. ul. Kwiatowa 5/2', 'street-address'],
  ['postal_code', 'Kod pocztowy', 'Format: 00-000', 'postal-code'],
  ['city', 'Miasto', '', 'address-level2'],
  ['phone', 'Telefon', '9 cyfr, np. 500 100 200', 'tel'],
];

function formularzAdresu(ctx, dane, errors, zapisano) {
  const bledy = Object.fromEntries(errors.map((e) => [e.field, e.message]));
  const pola = POLA_ADRESU.map(([pole, etykieta, podpowiedz, autocomplete]) => {
    const opisy = [];
    if (podpowiedz) opisy.push(`podpowiedz-${pole}`);
    if (bledy[pole]) opisy.push(`blad-${pole}`);
    return `<p class="pole"><label for="pole-${pole}">${etykieta}</label>
      ${podpowiedz ? `<span class="podpowiedz" id="podpowiedz-${pole}">${podpowiedz}</span>` : ''}
      <input id="pole-${pole}" name="${pole}" autocomplete="${autocomplete}" value="${escapeHtml(dane?.[pole] ?? '')}"
        ${bledy[pole] ? 'aria-invalid="true"' : ''} ${opisy.length ? `aria-describedby="${opisy.join(' ')}"` : ''}>
      ${bledy[pole] ? `<span class="blad-pola" id="blad-${pole}">${escapeHtml(bledy[pole])}</span>` : ''}</p>`;
  }).join('');
  const podsumowanie = errors.length
    ? `<div class="error" role="alert">Popraw błędy w formularzu (${errors.length}).</div>`
    : '';
  const sukces = zapisano ? '<p class="sukces" role="status" data-testid="success">Zapisano adres dostawy.</p>' : '';
  return layout({ title: 'Adres dostawy', user: ctx.user, active: '/konto/adres', body: `<h1>Zmiana adresu dostawy</h1>
    ${sukces}${podsumowanie}
    <form method="post" action="/konto/adres" novalidate>${pola}
      <button type="submit">Zapisz adres</button></form>` });
}
