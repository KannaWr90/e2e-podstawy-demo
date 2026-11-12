// Strona jednego zamówienia klienta i faktura do pobrania (plik HTML).
import { layout, escapeHtml, cena, statusZamowienia } from './widoki.mjs';
import { zamowienieSzczegoly, daneFaktury } from './logika.mjs';
import { wymagajLogowania } from './sklep.mjs';
import { tekstWersji } from './wersja.mjs';

// Zamówienie widzi jego właściciel i admin. Dla innych wygląda jak nieistniejące.
export function wlasneZamowienie(ctx, h, numer) {
  const z = zamowienieSzczegoly(h, numer);
  if (!z || (ctx.user.role !== 'admin' && z.user_id !== ctx.user.id)) return null;
  return z;
}

export function trasyZamowienia(app) {
  app.get('/zamowienia/:numer', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const z = wlasneZamowienie(ctx, h, ctx.params.numer);
    if (!z) return h.notFound();
    const faktura = z.invoice
      ? z.status === 'cancelled'
        ? '<p>Zamówienie anulowane: faktura nie jest dostępna.</p>'
        : `<p>Faktura na firmę: <strong>${escapeHtml(z.company)}</strong>, NIP <span data-testid="order-nip">${escapeHtml(z.nip)}</span></p>
           <p><a class="przycisk" href="/zamowienia/${encodeURIComponent(z.number)}/faktura" download>${tekstWersji('Pobierz fakturę', 'Faktura (HTML)')}</a></p>`
      : '<p>Zamówienie bez faktury na firmę.</p>';
    h.html(layout({ title: `Zamówienie ${z.number}`, user: ctx.user, active: '/zamowienia', body: `<p><a href="/zamowienia">← Moje zamówienia</a></p>
      <h1>Zamówienie ${escapeHtml(z.number)}</h1>
      <div class="karta">
        <p>Status: <strong data-testid="order-status">${statusZamowienia(z.status)}</strong></p>
        <p>Data: ${escapeHtml(z.created_at)}</p>
        <table><thead><tr><th>Produkt</th><th>Cena</th><th>Ilość</th><th>Wartość</th></tr></thead>
          <tbody><tr><td>${escapeHtml(z.product)}</td><td>${cena(z.unit_price_cents)}</td><td>${z.qty}</td><td data-testid="order-total">${cena(z.total_cents)}</td></tr></tbody></table>
        ${z.discount_code ? `<p>Kod rabatowy: ${escapeHtml(z.discount_code)}</p>` : ''}
        <p>Adres dostawy: <span data-testid="order-address">${escapeHtml(z.address || 'nie podano')}</span></p>
        ${faktura}
      </div>` }));
  });

  app.get('/zamowienia/:numer/faktura', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const z = wlasneZamowienie(ctx, h, ctx.params.numer);
    if (!z || !z.invoice || z.status === 'cancelled') return h.notFound();
    h.download(fakturaHtml(daneFaktury(h, z)), `faktura-${z.number}.html`, 'text/html; charset=utf-8');
  });
}

// Faktura jako samodzielny plik HTML (otwiera się w przeglądarce, da się wydrukować do PDF).
export function fakturaHtml(f) {
  const pozycje = f.items
    .map((p, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(p.name)}</td><td>${p.qty}</td><td>${cena(p.unit_price_cents)}</td><td>${cena(p.total_cents)}</td></tr>`)
    .join('');
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>Faktura ${escapeHtml(f.invoice_number)}</title>
<style>body{font:14px/1.5 "Segoe UI",system-ui,sans-serif;margin:2rem;color:#1d2b2a}table{border-collapse:collapse;width:100%}
td,th{border:1px solid #ccc;padding:.4rem .6rem;text-align:left}.strony{display:flex;gap:3rem}</style></head>
<body>
<h1>Faktura ${escapeHtml(f.invoice_number)}</h1>
<p>Zamówienie: ${escapeHtml(f.order_number)}<br>Data wystawienia: ${escapeHtml(f.issue_date)}</p>
<div class="strony">
<div><h2>Sprzedawca</h2><p>${escapeHtml(f.seller.name)}<br>${escapeHtml(f.seller.address)}<br>NIP sprzedawcy: ${escapeHtml(f.seller.nip)}</p></div>
<div><h2>Nabywca</h2><p>${escapeHtml(f.buyer.name)}<br>NIP nabywcy: ${escapeHtml(f.buyer.nip)}</p></div>
</div>
<table><thead><tr><th>Lp.</th><th>Nazwa</th><th>Ilość</th><th>Cena</th><th>Wartość</th></tr></thead><tbody>${pozycje}</tbody></table>
<p><strong>Razem do zapłaty: ${cena(f.total_cents)}</strong> (kwoty brutto)</p>
<p>Dokument wygenerowany przez aplikację szkoleniową Namssor. Nie jest prawdziwą fakturą.</p>
</body></html>
`;
}
