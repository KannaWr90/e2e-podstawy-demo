// Strony sklepu dla klienta: produkty, logowanie, koszyk, moje zamówienia, adres dostawy.
import { layout, escapeHtml, cena, flash, statusZamowienia } from './widoki.mjs';
import { koszyk, zamowKoszyk, walidujAdres, walidujFakture, katalog, produktKatalogu } from './logika.mjs';
import { cenaHtml, banerHtml, ocenKod } from './promocje.mjs';
import { tekstWersji } from './wersja.mjs';
import { flagaHtml } from './flagi.mjs';

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

// Najwięcej sztuk jednego produktu w koszyku (karta produktu i API koszyka).
export const MAKS_ILOSC = 1000;

// Zeszłoroczny kalendarz adwentowy (produkt archiwalny z db.mjs).
const ID_KALENDARZA_2025 = 22;

export function wymagajLogowania(ctx, h) {
  if (ctx.user) return true;
  h.redirect('/logowanie?next=' + encodeURIComponent(ctx.url.pathname + ctx.url.search));
  return false;
}

export function trasySklepu(app) {
  app.get('/', (ctx, h) => {
    const szukaj = ctx.query.q ?? '';
    const kategoria = ctx.query.kategoria ?? '';
    const sort = ctx.query.sort ?? '';
    const kategorie = h.all('SELECT DISTINCT category FROM products WHERE archived = 0 ORDER BY category').map((r) => r.category);
    const produkty = katalog(h, { q: szukaj, kategoria, sort });
    const wiersze = produkty
      .map(
        (p) => `<tr data-testid="product-row" data-product-id="${p.id}">
        <td data-testid="product-name">${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>${p.promo_percent ? `<s class="cena-stara">${cena(p.price_cents)}</s> ` : ''}${cena(p.cena_cents)}</td>
        <td data-testid="product-stock">${p.stock}</td>
        <td>${p.stock > 0 ? 'Dostępny' : '<span class="niedostepny">Niedostępny</span>'}</td>
        <td><form method="post" action="/koszyk/dodaj"><input type="hidden" name="product_id" value="${p.id}">
        <button type="submit" aria-label="Dodaj do koszyka: ${escapeHtml(p.name)}" ${p.stock === 0 ? 'disabled' : ''}>Dodaj do koszyka</button></form></td></tr>`,
      )
      .join('');
    // Kafelki: te same produkty co w tabeli, z ceną promocyjną i linkiem do karty produktu.
    const kafelki = produkty
      .map(
        (p) => `<article class="karta kafelek" data-testid="product-tile" aria-labelledby="kafelek-${p.id}">
        <h3 id="kafelek-${p.id}"><a href="/produkt/${p.id}">${escapeHtml(p.name)}</a></h3>
        <p class="podpowiedz">${escapeHtml(p.category)}</p>
        <p>${cenaHtml(p, 'tile')}</p>
        <p data-testid="tile-availability">${p.stock > 0 ? 'Dostępny' : '<span class="niedostepny">Niedostępny</span>'}</p>${p.id === ID_KALENDARZA_2025 ? flagaHtml(3) : ''}</article>`,
      )
      .join('');
    const opcje = ['<option value="">Wszystkie</option>']
      .concat(kategorie.map((k) => `<option${k === kategoria ? ' selected' : ''}>${escapeHtml(k)}</option>`))
      .join('');
    const sortowanie = [['', 'Domyślnie'], ['cena', 'Cena: od najniższej'], ['cena-malejaco', 'Cena: od najwyższej'], ['nazwa', 'Nazwa: A–Z']]
      .map(([v, t]) => `<option value="${v}"${v === sort ? ' selected' : ''}>${t}</option>`)
      .join('');
    const brak = produkty.length === 0 ? '<p>Brak produktów spełniających kryteria.</p>' : '';
    const dodano = ctx.query.dodano ? tekstWersji(`Dodano do koszyka: ${ctx.query.dodano}`, `Produkt w koszyku: ${ctx.query.dodano}`) : '';
    h.html(layout({ title: 'Produkty', user: ctx.user, active: '/', body: `<h1>Produkty</h1>
      ${flash(dodano)}
      <form method="get" action="/" class="filtry" role="search">
        <label>Szukaj produktu <input name="q" type="search" value="${escapeHtml(szukaj)}"></label>
        <label>Kategoria <select name="kategoria">${opcje}</select></label>
        <label>Sortuj <select name="sort">${sortowanie}</select></label>
        <button type="submit">Filtruj</button></form>
      <p>Liczba produktów: <span data-testid="product-count">${produkty.length}</span></p>${brak}
      <table><thead><tr><th>Nazwa</th><th>Kategoria</th><th>Cena</th><th>Stan</th><th>Dostępność</th><th></th></tr></thead>
      <tbody>${wiersze}</tbody></table>
      <section aria-labelledby="oferta">
      <h2 id="oferta">Oferta na Czarny Piątek</h2>
      ${banerHtml()}
      <div class="kafelki" data-testid="product-tiles">${kafelki}</div></section>` }));
  });

  // ---------- Karta produktu ----------
  app.get('/produkt/:id', (ctx, h) => {
    const p = /^\d+$/.test(ctx.params.id) ? produktKatalogu(h, Number(ctx.params.id)) : null;
    if (!p) return h.notFound();
    const brakTowaru = p.stock === 0;
    const dostepnosc = brakTowaru
      ? `<span class="niedostepny">${tekstWersji('Niedostępny', 'Chwilowo brak')}</span>`
      : tekstWersji(`Dostępny (${p.stock} szt.)`, `Na stanie: ${p.stock} szt.`);
    const bladIlosci = ctx.query.blad === 'ilosc' ? `<p class="error" role="alert">Ilość musi być liczbą całkowitą od 1 do ${MAKS_ILOSC}.</p>` : '';
    h.html(layout({ title: p.name, user: ctx.user, active: '/', body: `<p><a href="/">← Wszystkie produkty</a></p>
      ${flash(ctx.query.dodano ? tekstWersji(`Dodano do koszyka: ${ctx.query.dodano}`, `Produkt w koszyku: ${ctx.query.dodano}`) : '')}
      ${banerHtml()}
      <article class="karta karta-produktu" data-testid="product-card">
        <h1>${escapeHtml(p.name)}</h1>
        <p class="podpowiedz">Kategoria: ${escapeHtml(p.category)}</p>
        <p data-testid="product-description">${escapeHtml(p.description || 'Brak opisu.')}</p>
        <p class="cena">${cenaHtml(p, 'product')}</p>
        <p data-testid="product-availability">${dostepnosc}</p>
        ${p.id === ID_KALENDARZA_2025 ? flagaHtml(3) : ''}
        ${bladIlosci}
        <form method="post" action="/koszyk/dodaj" class="filtry" novalidate><input type="hidden" name="product_id" value="${p.id}">
          <input type="hidden" name="wroc" value="/produkt/${p.id}">
          <label>Ilość <input name="qty" type="number" inputmode="numeric" min="1" max="${MAKS_ILOSC}" value="1"${brakTowaru ? ' disabled' : ''}></label>
          <button type="submit"${brakTowaru ? ' disabled' : ''}>Dodaj do koszyka</button></form>
      </article>` }));
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
    // Z karty produktu wracamy na kartę; z listy produktów na listę.
    const wroc = /^\/produkt\/\d+$/.test(ctx.body.wroc ?? '') ? ctx.body.wroc : '/';
    if (!ctx.user) return h.redirect('/logowanie?next=' + encodeURIComponent(wroc));
    const produkt = h.get('SELECT * FROM products WHERE id = ?', [Number(ctx.body.product_id)]);
    if (!produkt || produkt.stock === 0) return h.redirect(wroc);
    // Ilość podaje karta produktu (1–1000); lista produktów dodaje 1 sztukę.
    const ilosc = ctx.body.qty === undefined ? 1 : Number(ctx.body.qty);
    if (!Number.isInteger(ilosc) || ilosc < 1 || ilosc > MAKS_ILOSC) return h.redirect(wroc === '/' ? '/' : wroc + '?blad=ilosc');
    h.run(
      `INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET qty = MIN(qty + excluded.qty, ${MAKS_ILOSC})`,
      [ctx.user.id, produkt.id, ilosc],
    );
    h.redirect(wroc + '?dodano=' + encodeURIComponent(produkt.name));
  });

  app.get('/koszyk', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    h.html(stronaKoszyka(ctx, h));
  });

  app.post('/koszyk/usun', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie');
    h.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [Number(ctx.body.item_id), ctx.user.id]);
    h.redirect('/koszyk?usunieto=1');
  });

  // Kod rabatowy: poprawny zapisujemy przy koszyku, błędny pokazujemy przy polu.
  app.post('/koszyk/kod', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/koszyk');
    if (ctx.body.usun) {
      h.run('DELETE FROM cart_codes WHERE user_id = ?', [ctx.user.id]);
      return h.redirect('/koszyk');
    }
    const { pozycje } = koszyk(h, ctx.user.id);
    const wynik = ocenKod(ctx.body.kod, pozycje);
    if (!wynik.ok) return h.html(stronaKoszyka(ctx, h, { bladKodu: wynik.komunikat, kod: ctx.body.kod }), 400);
    h.run('INSERT INTO cart_codes (user_id, code) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET code = excluded.code', [ctx.user.id, wynik.kod]);
    h.redirect('/koszyk?kod=' + encodeURIComponent(wynik.kod));
  });

  app.post('/koszyk/zamow', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie');
    let faktura = null;
    if (ctx.body.faktura === '1') {
      const wynik = walidujFakture({ nip: ctx.body.nip, company: ctx.body.firma });
      if (wynik.errors.length) return h.html(stronaKoszyka(ctx, h, { bledyFaktury: wynik.errors, dane: ctx.body }), 400);
      faktura = wynik.faktura;
    }
    const numery = zamowKoszyk(h, ctx.user.id, faktura);
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
      const STATUS = { new: 'Nowe', paid: '${statusZamowienia('paid')}', shipped: 'Wysłane', cancelled: 'Anulowane' };
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
              if (tekst === z.number) {
                // Numer prowadzi do strony zamówienia (szczegóły, faktura).
                const a = document.createElement('a');
                a.href = '/zamowienia/' + encodeURIComponent(z.number);
                a.textContent = z.number;
                td.append(a);
              } else td.textContent = tekst;
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
      <button type="submit">${tekstWersji('Zapisz adres', 'Zapisz')}</button></form>` });
}

// Strona koszyka. opcje: { bladKodu, kod, bledyFaktury, dane } przy ponownym wyświetleniu po błędzie.
function stronaKoszyka(ctx, h, opcje = {}) {
  const { pozycje, suma, sumaPrzedRabatem, rabat, kod } = koszyk(h, ctx.user.id);
  const wiersze = pozycje
    .map(
      (i) => `<tr data-testid="cart-item"><td data-testid="cart-item-name">${escapeHtml(i.name)}</td>
        <td data-testid="cart-item-price">${i.promo_percent ? `<s class="cena-stara">${cena(i.price_cents)}</s> ` : ''}${cena(i.cena_cents)}${
          i.promo_percent ? ` <span class="plakietka">-${i.promo_percent}%</span>` : ''}</td>
        <td data-testid="cart-item-qty">${i.qty}</td><td>${cena(i.cena_cents * i.qty)}</td>
        <td><form method="post" action="/koszyk/usun"><input type="hidden" name="item_id" value="${i.id}">
        <button type="submit" aria-label="Usuń: ${escapeHtml(i.name)}">Usuń</button></form></td></tr>`,
    )
    .join('');
  const pusty = pozycje.length === 0;
  const liczba = pozycje.length;

  // Kod rabatowy
  let komunikatKodu = '';
  if (opcje.bladKodu) komunikatKodu = `<p class="error" role="alert" data-testid="discount-message">${escapeHtml(opcje.bladKodu)}</p>`;
  else if (kod?.ok) komunikatKodu = `<p class="sukces" role="status" data-testid="discount-message">${escapeHtml(kod.komunikat)}</p>${kod.kod === 'KLAUDIUSZ' ? flagaHtml(1) : ''}`;
  else if (kod) komunikatKodu = `<p class="error" role="alert" data-testid="discount-message">${escapeHtml(kod.komunikat)}</p>`;
  const formularzKodu = pusty ? '' : `<form method="post" action="/koszyk/kod" class="filtry" novalidate>
      <label>Kod rabatowy <input name="kod" autocomplete="off" value="${escapeHtml(opcje.kod ?? (kod?.ok ? kod.kod : ''))}"></label>
      <button type="submit">${tekstWersji('Zastosuj kod', 'Użyj kodu')}</button>
      ${kod ? '<button type="submit" name="usun" value="1" class="drugorzedny">Usuń kod</button>' : ''}</form>${komunikatKodu}`;
  const podsumowanieRabatu = kod?.ok
    ? `<p>Przed rabatem: <span data-testid="cart-subtotal">${cena(sumaPrzedRabatem)}</span>, rabat (${escapeHtml(kod.kod)}):
       <span data-testid="cart-discount">-${cena(rabat)}</span></p>`
    : '';

  // Faktura na firmę
  const bledy = Object.fromEntries((opcje.bledyFaktury ?? []).map((e) => [e.field, e.message]));
  const dane = opcje.dane ?? {};
  const fakturaZaznaczona = dane.faktura === '1';
  const pole = (nazwa, pole, etykieta, podpowiedz) => {
    const opisy = [podpowiedz ? `podpowiedz-${pole}` : '', bledy[nazwa] ? `blad-${pole}` : ''].filter(Boolean).join(' ');
    return `<p class="pole"><label for="pole-${pole}">${etykieta}</label>
      ${podpowiedz ? `<span class="podpowiedz" id="podpowiedz-${pole}">${podpowiedz}</span>` : ''}
      <input id="pole-${pole}" name="${pole}" value="${escapeHtml(dane[pole] ?? '')}" ${bledy[nazwa] ? 'aria-invalid="true"' : ''} ${opisy ? `aria-describedby="${opisy}"` : ''}>
      ${bledy[nazwa] ? `<span class="blad-pola" id="blad-${pole}">${escapeHtml(bledy[nazwa])}</span>` : ''}</p>`;
  };
  const bledyFaktury = opcje.bledyFaktury?.length
    ? `<div class="error" role="alert">Popraw dane do faktury (${opcje.bledyFaktury.length}).</div>` : '';

  return layout({ title: 'Koszyk', user: ctx.user, active: '/koszyk', body: `<h1>Koszyk</h1>
      <p>Pozycji: <span data-testid="cart-count">${liczba}</span>, razem: <span data-testid="cart-total">${cena(suma)}</span></p>
      ${podsumowanieRabatu}
      ${pusty ? '<p>Koszyk jest pusty. <a href="/">Wybierz produkty</a></p>' : ''}
      <table><thead><tr><th>Produkt</th><th>Cena</th><th>Ilość</th><th>Wartość</th><th></th></tr></thead><tbody>${wiersze}</tbody></table>
      ${formularzKodu}
      ${bledyFaktury}
      <form method="post" action="/koszyk/zamow" novalidate>
        ${pusty ? '' : `<p><label><input type="checkbox" name="faktura" value="1" id="faktura"${fakturaZaznaczona ? ' checked' : ''}> Faktura na firmę</label></p>
        <fieldset id="dane-firmy"${fakturaZaznaczona ? '' : ' hidden'}><legend>Dane do faktury</legend>
          ${pole('nip', 'nip', 'NIP', '10 cyfr, np. 101-202-30-36')}
          ${pole('company', 'firma', 'Nazwa firmy', '')}
        </fieldset>`}
        <button type="submit" ${pusty ? 'disabled' : ''}>Złóż zamówienie (płatność przy odbiorze)</button>
        ${pusty ? '' : ' <a class="przycisk" href="/koszyk/platnosc">Zapłać kartą online</a>'}</form>
      <script>
      const pole = document.getElementById('faktura');
      if (pole) pole.addEventListener('change', () => { document.getElementById('dane-firmy').hidden = !pole.checked; });
      </script>` });
}
