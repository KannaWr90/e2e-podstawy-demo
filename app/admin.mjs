// Panel admina: zamówienia (wyszukiwanie, anulowanie, eksport CSV), produkty (dodawanie,
// import CSV) i tryb konserwacji. Wymaga roli admin.
import crypto from 'node:crypto';
import { layout, escapeHtml, cena, statusZamowienia, flash } from './widoki.mjs';
import {
  wszystkieZamowienia, anulujZamowienie, trybKonserwacji, ustawTrybKonserwacji, zamowienieSzczegoly, zmienStatus, STATUSY,
} from './logika.mjs';
import { hotfix } from './wersja.mjs';
import { wymagajLogowania } from './sklep.mjs';

function wymagajAdmina(ctx, h) {
  if (!wymagajLogowania(ctx, h)) return false;
  if (ctx.user.role === 'admin') return true;
  h.html(layout({ title: 'Brak uprawnień', user: ctx.user, body: '<h1>Brak uprawnień</h1><p>Ta strona wymaga roli admin.</p>' }), 403);
  return false;
}

const strona = (ctx, title, body) => layout({ title, user: ctx.user, active: '/admin', body });

// Tabela zamówień. Każdy wiersz dostaje NOWE losowe id przy każdym wyświetleniu strony,
// a wiersze nie mają data-testid. Wiersz trzeba znaleźć po treści (numerze zamówienia).
// Numer zamówienia prowadzi do szczegółów ze zmianą statusu.
function tabelaZamowien(zamowienia, przyciskAnuluj) {
  // Kolumny: [nagłówek, komórka].
  const kolumny = [
    ['Numer', (z) => `<a href="/admin/zamowienia/${encodeURIComponent(z.number)}">${escapeHtml(z.number)}</a>`],
    ['Data', (z) => escapeHtml(z.created_at)],
    ['Klient', (z) => escapeHtml(z.customer)],
    ['Produkt', (z) => escapeHtml(z.product)],
    ['Ilość', (z) => z.qty],
    ['Wartość', (z) => cena(z.total_cents)],
    ['Status', (z) => statusZamowienia(z.status)],
  ];
  if (hotfix()) kolumny.splice(1, 0, kolumny.pop());
  const wiersze = zamowienia
    .map(
      (z) => `<tr id="row-${crypto.randomBytes(4).toString('hex')}">
      ${kolumny.map(([, komorka]) => `<td>${komorka(z)}</td>`).join('')}
      <td>${z.status === 'new' ? przyciskAnuluj(z) : ''}</td></tr>`,
    )
    .join('');
  return `<table><thead><tr>${kolumny.map(([n]) => `<th>${n}</th>`).join('')}<th></th></tr></thead>
    <tbody>${wiersze}</tbody></table>`;
}

function wyszukiwarka(akcja, szukaj, liczba) {
  return `<form method="get" action="${akcja}" class="filtry" role="search">
    <label>Szukaj zamówienia <input name="q" type="search" value="${escapeHtml(szukaj)}" placeholder="numer, klient albo produkt"></label>
    <button type="submit">Szukaj</button></form>
    <p>Znaleziono: ${liczba}</p>`;
}

const DOZWOLONE_POWROTY = ['/admin/zamowienia', '/admin/zamowienia/potwierdzenie'];

export function trasyAdmina(app) {
  app.get('/admin', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    h.html(strona(ctx, 'Panel admina', `<h1>Panel admina</h1>
      <div class="kafelki">
        <div class="karta"><h2><a href="/admin/zamowienia">Zamówienia</a></h2><p>Lista, wyszukiwanie, anulowanie, eksport do CSV.</p></div>
        <div class="karta"><h2><a href="/admin/produkty">Produkty</a></h2><p>Dodawanie produktu i import z pliku CSV.</p></div>
        <div class="karta"><h2><a href="/admin/ustawienia">Ustawienia</a></h2><p>Tryb konserwacji sklepu.</p></div>
        <div class="karta"><h2><a href="/admin/zamowienia/potwierdzenie">Anulowanie z potwierdzeniem</a></h2><p>Zamówienia z oknem „Czy na pewno?”.</p></div>
      </div>`));
  });

  // ---------- Zamówienia ----------
  app.get('/admin/zamowienia', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const szukaj = ctx.query.q ?? '';
    const zamowienia = wszystkieZamowienia(h, szukaj);
    const przycisk = (z) => `<form method="post" action="/admin/zamowienia/${z.id}/anuluj">
      <input type="hidden" name="wroc" value="/admin/zamowienia"><button type="submit" class="anuluj">Anuluj</button></form>`;
    h.html(strona(ctx, 'Zamówienia', `<h1>Zamówienia</h1>
      ${flash(ctx.query.anulowano ? `Anulowano zamówienie ${ctx.query.anulowano}` : '')}
      ${wyszukiwarka('/admin/zamowienia', szukaj, zamowienia.length)}
      <p><a href="/admin/zamowienia/eksport.csv" download>Eksportuj do CSV</a> ·
         <a href="/admin/zamowienia/potwierdzenie">Wersja z potwierdzeniem anulowania</a></p>
      ${tabelaZamowien(zamowienia, przycisk)}`));
  });

  // Wariant „Dla szybszych”: „Anuluj” otwiera natywne okno <dialog> z pytaniem.
  app.get('/admin/zamowienia/potwierdzenie', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const szukaj = ctx.query.q ?? '';
    const zamowienia = wszystkieZamowienia(h, szukaj);
    const przycisk = (z) =>
      `<button type="button" class="anuluj" data-numer="${escapeHtml(z.number)}" data-akcja="/admin/zamowienia/${z.id}/anuluj">Anuluj</button>`;
    h.html(strona(ctx, 'Zamówienia z potwierdzeniem', `<h1>Zamówienia z potwierdzeniem anulowania</h1>
      ${flash(ctx.query.anulowano ? `Anulowano zamówienie ${ctx.query.anulowano}` : '')}
      ${wyszukiwarka('/admin/zamowienia/potwierdzenie', szukaj, zamowienia.length)}
      <p><a href="/admin/zamowienia">Wróć do zwykłej listy</a></p>
      ${tabelaZamowien(zamowienia, przycisk)}
      <dialog id="potwierdzenie" aria-labelledby="potwierdzenie-tytul">
        <form method="post" id="potwierdzenie-form">
          <input type="hidden" name="wroc" value="/admin/zamowienia/potwierdzenie">
          <h2 id="potwierdzenie-tytul">Anulować zamówienie <span id="potwierdzenie-numer"></span>?</h2>
          <p>Towar wróci na stan magazynu. Tej operacji nie można cofnąć.</p>
          <div class="przyciski">
            <button type="button" class="drugorzedny" id="potwierdzenie-wroc">Wróć</button>
            <button type="submit">Tak, anuluj</button>
          </div>
        </form>
      </dialog>
      <script>
      const okno = document.getElementById('potwierdzenie');
      for (const przycisk of document.querySelectorAll('button[data-numer]')) {
        przycisk.addEventListener('click', () => {
          document.getElementById('potwierdzenie-numer').textContent = przycisk.dataset.numer;
          document.getElementById('potwierdzenie-form').action = przycisk.dataset.akcja;
          okno.showModal();
        });
      }
      document.getElementById('potwierdzenie-wroc').addEventListener('click', () => okno.close());
      </script>`));
  });

  app.post('/admin/zamowienia/:numer/status', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const wynik = zmienStatus(h, ctx.params.numer, String(ctx.body.status ?? ''));
    if (wynik.kod === 404) return h.notFound();
    if (wynik.blad) {
      const z = zamowienieSzczegoly(h, ctx.params.numer);
      return h.html(stronaZamowienia(ctx, z, `<p class="error" role="alert">${escapeHtml(wynik.blad)}</p>`), wynik.kod);
    }
    h.redirect(`/admin/zamowienia/${encodeURIComponent(ctx.params.numer)}?zapisano=1`);
  });

  app.post('/admin/zamowienia/:id/anuluj', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const wroc = DOZWOLONE_POWROTY.includes(ctx.body.wroc) ? ctx.body.wroc : '/admin/zamowienia';
    const z = anulujZamowienie(h, Number(ctx.params.id));
    h.redirect(z ? `${wroc}?anulowano=${encodeURIComponent(z.number)}` : wroc);
  });

  // Eksport do pliku CSV (pobieranie). Średnik i BOM, żeby Excel w polskiej wersji otworzył plik poprawnie.
  app.get('/admin/zamowienia/eksport.csv', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const pole = (v) => (/[;"\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const linie = [['numer', 'data', 'klient', 'produkt', 'ilosc', 'wartosc', 'status']].concat(
      wszystkieZamowienia(h).map((z) => [z.number, z.created_at, z.customer, z.product, z.qty, cena(z.total_cents), statusZamowienia(z.status)]),
    );
    h.download('﻿' + linie.map((l) => l.map(pole).join(';')).join('\r\n') + '\r\n', 'zamowienia.csv', 'text/csv; charset=utf-8');
  });

  // Szczegóły zamówienia (po trasach /potwierdzenie i /eksport.csv, żeby ich nie przesłonić) i zmiana statusu: Nowe → Opłacone → Wysłane.
  app.get('/admin/zamowienia/:numer', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const z = zamowienieSzczegoly(h, ctx.params.numer);
    if (!z) return h.notFound();
    h.html(stronaZamowienia(ctx, z, ctx.query.zapisano ? flash(`Zmieniono status zamówienia ${z.number} na „${STATUSY[z.status]}”`) : ''));
  });

  // ---------- Produkty ----------
  app.get('/admin/produkty', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const komunikat = ctx.query.dodano
      ? `Dodano produkt: ${ctx.query.dodano}`
      : ctx.query.zaimportowano
        ? `Zaimportowano produkty: ${ctx.query.zaimportowano}`
        : '';
    h.html(stronaProduktow(ctx, h, flash(komunikat)));
  });

  app.post('/admin/produkty', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const nazwa = String(ctx.body.name ?? '').trim();
    const kategoria = String(ctx.body.category ?? '').trim() || 'Inne';
    const grosze = Math.round(Number(String(ctx.body.price ?? '').replace(',', '.')) * 100);
    const stan = Number(ctx.body.stock);
    const bledy = [];
    if (!nazwa) bledy.push('Podaj nazwę produktu');
    if (!Number.isFinite(grosze) || grosze <= 0) bledy.push('Cena musi być liczbą większą od zera');
    if (!Number.isInteger(stan) || stan < 0) bledy.push('Stan musi być liczbą całkowitą, co najmniej 0');
    if (bledy.length) return h.html(stronaProduktow(ctx, h, listaBledow(bledy)), 400);
    zapiszProdukt(h, nazwa, kategoria, grosze, stan);
    h.redirect('/admin/produkty?dodano=' + encodeURIComponent(nazwa));
  });

  // Import z pliku CSV (upload). Format: nagłówek nazwa;kategoria;cena;stan
  app.post('/admin/produkty/import', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const plik = plikZFormularza(ctx.req.headers['content-type'], ctx.body, 'plik');
    if (!plik || !plik.tresc.trim()) return h.html(stronaProduktow(ctx, h, listaBledow(['Wybierz plik CSV do importu'])), 400);
    const { produkty, bledy } = czytajCsvProduktow(plik.tresc);
    if (bledy.length) return h.html(stronaProduktow(ctx, h, listaBledow(bledy, 'Nie zaimportowano pliku')), 400);
    for (const p of produkty) zapiszProdukt(h, p.nazwa, p.kategoria, p.grosze, p.stan);
    h.redirect('/admin/produkty?zaimportowano=' + produkty.length);
  });

  // ---------- Ustawienia ----------
  app.get('/admin/ustawienia', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    const wlaczony = trybKonserwacji(h);
    h.html(strona(ctx, 'Ustawienia', `<h1>Ustawienia</h1>${flash(ctx.query.zapisano ? 'Zapisano ustawienia' : '')}
      <form method="post" action="/admin/ustawienia">
        <p><label><input type="checkbox" name="maintenance" value="1" ${wlaczony ? 'checked' : ''}> Tryb konserwacji sklepu</label></p>
        <p data-testid="maintenance-state">Stan: ${wlaczony ? 'włączony' : 'wyłączony'}</p>
        <p class="podpowiedz">W trybie konserwacji klienci widzą komunikat zamiast sklepu. Administrator nadal ma dostęp.</p>
        <button type="submit">Zapisz</button></form>`));
  });

  app.post('/admin/ustawienia', (ctx, h) => {
    if (!wymagajAdmina(ctx, h)) return;
    ustawTrybKonserwacji(h, ctx.body.maintenance === '1');
    h.redirect('/admin/ustawienia?zapisano=1');
  });
}

function listaBledow(bledy, naglowek = 'Popraw błędy') {
  return `<div class="error" role="alert">${naglowek}:<ul>${bledy.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`;
}

function stronaProduktow(ctx, h, komunikat = '') {
  const produkty = h.all('SELECT * FROM products ORDER BY category, name');
  const wiersze = produkty
    .map((p) => `<tr data-testid="admin-product-row"><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>${cena(p.price_cents)}</td><td>${p.stock}</td></tr>`)
    .join('');
  return strona(ctx, 'Produkty (admin)', `<h1>Produkty</h1>${komunikat}
    <div class="kafelki">
    <form method="post" action="/admin/produkty" class="karta" novalidate>
      <h2>Dodaj produkt</h2>
      <p class="pole"><label for="produkt-nazwa">Nazwa</label><input id="produkt-nazwa" name="name"></p>
      <p class="pole"><label for="produkt-kategoria">Kategoria</label><input id="produkt-kategoria" name="category"></p>
      <p class="pole"><label for="produkt-cena">Cena (zł)</label><input id="produkt-cena" name="price" inputmode="decimal" value="9,99"></p>
      <p class="pole"><label for="produkt-stan">Stan</label><input id="produkt-stan" name="stock" inputmode="numeric" value="10"></p>
      <button type="submit">Dodaj produkt</button></form>
    <form method="post" action="/admin/produkty/import" enctype="multipart/form-data" class="karta">
      <h2>Import z pliku CSV</h2>
      <p class="pole"><label for="plik-csv">Plik CSV z produktami</label><input id="plik-csv" type="file" name="plik" accept=".csv,text/csv"></p>
      <p class="podpowiedz">Pierwszy wiersz: <code>nazwa;kategoria;cena;stan</code>. Separator: średnik. Cena z przecinkiem, np. 12,99.
      Produkt o istniejącej nazwie zostanie zaktualizowany.</p>
      <button type="submit">Importuj</button></form>
    </div>
    <p>Liczba produktów: ${produkty.length}</p>
    <table><thead><tr><th>Nazwa</th><th>Kategoria</th><th>Cena</th><th>Stan</th></tr></thead><tbody>${wiersze}</tbody></table>`);
}

function zapiszProdukt(h, nazwa, kategoria, grosze, stan) {
  h.run(
    `INSERT INTO products (name, category, price_cents, stock) VALUES (?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET category = excluded.category, price_cents = excluded.price_cents, stock = excluded.stock`,
    [nazwa, kategoria, grosze, stan],
  );
}

// Minimalny odczyt multipart/form-data: zwraca pierwszy plik z pola `nazwaPola`.
function plikZFormularza(contentType = '', body, nazwaPola) {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);
  if (!boundary || !Buffer.isBuffer(body)) return null;
  const separator = '--' + (boundary[1] ?? boundary[2]);
  const surowe = body.toString('latin1'); // latin1 zachowuje bajty 1:1
  for (const czesc of surowe.split(separator)) {
    const koniecNaglowka = czesc.indexOf('\r\n\r\n');
    if (koniecNaglowka === -1) continue;
    const naglowek = czesc.slice(0, koniecNaglowka);
    if (!naglowek.includes(`name="${nazwaPola}"`)) continue;
    const nazwaPliku = /filename="([^"]*)"/.exec(naglowek)?.[1] ?? '';
    const tresc = czesc.slice(koniecNaglowka + 4).replace(/\r\n$/, '');
    return { nazwaPliku, tresc: Buffer.from(tresc, 'latin1').toString('utf8') };
  }
  return null;
}

function czytajCsvProduktow(tekst) {
  const linie = tekst.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  const bledy = [];
  const produkty = [];
  const naglowek = (linie[0] ?? '').split(';').map((s) => s.trim().toLowerCase());
  if (naglowek.join(';') !== 'nazwa;kategoria;cena;stan') {
    return { produkty, bledy: ['Pierwszy wiersz musi mieć postać: nazwa;kategoria;cena;stan'] };
  }
  linie.slice(1).forEach((linia, i) => {
    const nr = i + 2;
    const kolumny = linia.split(';').map((s) => s.trim());
    if (kolumny.length !== 4) return bledy.push(`Wiersz ${nr}: oczekiwano 4 kolumn, jest ${kolumny.length}`);
    const [nazwa, kategoria, cenaTekst, stanTekst] = kolumny;
    const grosze = Math.round(Number(cenaTekst.replace(',', '.')) * 100);
    const stan = Number(stanTekst);
    if (!nazwa) bledy.push(`Wiersz ${nr}: brak nazwy`);
    if (!cenaTekst || !Number.isFinite(grosze) || grosze <= 0) bledy.push(`Wiersz ${nr}: cena musi być liczbą większą od zera`);
    if (!stanTekst || !Number.isInteger(stan) || stan < 0) bledy.push(`Wiersz ${nr}: stan musi być liczbą całkowitą, co najmniej 0`);
    produkty.push({ nazwa, kategoria: kategoria || 'Inne', grosze, stan });
  });
  if (!bledy.length && produkty.length === 0) bledy.push('Plik nie zawiera żadnego produktu');
  return { produkty, bledy };
}

function stronaZamowienia(ctx, z, komunikat) {
  const opcje = ['new', 'paid', 'shipped']
    .map((s) => `<option value="${s}"${s === z.status ? ' selected' : ''}>${STATUSY[s]}</option>`)
    .join('');
  const formularz = z.status === 'cancelled'
    ? '<p>Zamówienie anulowane: statusu nie można zmienić.</p>'
    : `<form method="post" action="/admin/zamowienia/${encodeURIComponent(z.number)}/status" class="filtry">
        <label>Status zamówienia <select name="status">${opcje}</select></label>
        <button type="submit">Zapisz status</button></form>
      <p class="podpowiedz">Kolejność: Nowe → Opłacone → Wysłane.</p>`;
  return strona(ctx, `Zamówienie ${z.number}`, `<p><a href="/admin/zamowienia">← Lista zamówień</a></p>
    <h1>Zamówienie ${escapeHtml(z.number)}</h1>${komunikat}
    <div class="karta">
      <p>Klient: ${escapeHtml(z.customer)} · Data: ${escapeHtml(z.created_at)}</p>
      <p>${escapeHtml(z.product)} × ${z.qty} = <strong>${cena(z.total_cents)}</strong></p>
      <p>Status: <strong data-testid="order-status">${statusZamowienia(z.status)}</strong></p>
      ${z.invoice ? `<p>Faktura na firmę: ${escapeHtml(z.company)}, NIP ${escapeHtml(z.nip)}</p>` : ''}
      ${formularz}
    </div>`);
}
