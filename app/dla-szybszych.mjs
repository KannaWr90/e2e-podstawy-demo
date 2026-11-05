// Ekrany do zadań „Dla szybszych”: płatność w ramce <iframe> i regulamin w nowej karcie.
// (Okno potwierdzenia <dialog>, eksport i import CSV są w panelu admina: app/admin.mjs.)
import { layout, escapeHtml, cena, CSS } from './widoki.mjs';
import { koszyk, zamowKoszyk } from './logika.mjs';
import { wymagajLogowania } from './sklep.mjs';

const KARTA_ODRZUCANA = '4000000000000002';

export function trasyDlaSzybszych(app) {
  app.get('/koszyk/platnosc', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const { pozycje, suma } = koszyk(h, ctx.user.id);
    h.html(layout({ title: 'Płatność kartą', user: ctx.user, active: '/koszyk', body: `<h1>Płatność kartą</h1>
      <p>Pozycji w koszyku: ${pozycje.length}. Do zapłaty: <strong data-testid="payment-total">${cena(suma)}</strong></p>
      <p>Płatność obsługuje zewnętrzna bramka, osadzona poniżej w ramce.
         Zamawiając, akceptujesz <a href="/regulamin" target="_blank" rel="noopener">regulamin sklepu</a>.</p>
      <iframe src="/widget/platnosc" title="Bramka płatnicza" name="bramka"></iframe>
      <p class="podpowiedz">Karta testowa: 4111 1111 1111 1111 (płatność przyjęta), 4000 0000 0000 0002 (odrzucona).</p>
      <p><a href="/koszyk">Wróć do koszyka</a></p>` }));
  });

  // Strona wyświetlana WEWNĄTRZ ramki: własny, uproszczony wygląd, bez menu sklepu.
  app.get('/widget/platnosc', (ctx, h) => {
    if (!ctx.user) return h.html(widget('<p role="alert">Zaloguj się w sklepie, aby zapłacić.</p>'), 401);
    const { suma } = koszyk(h, ctx.user.id);
    h.html(widget(formularzKarty(suma)));
  });

  app.post('/widget/platnosc', (ctx, h) => {
    if (!ctx.user) return h.html(widget('<p role="alert">Zaloguj się w sklepie, aby zapłacić.</p>'), 401);
    const { pozycje, suma } = koszyk(h, ctx.user.id);
    const numer = String(ctx.body.karta ?? '').replace(/\s/g, '');
    if (pozycje.length === 0) return h.html(widget('<p role="alert">Koszyk jest pusty. Nie ma czego opłacić.</p>'), 400);
    if (!/^\d{16}$/.test(numer)) return h.html(widget(formularzKarty(suma, ctx.body.karta, 'Numer karty musi mieć 16 cyfr')), 400);
    if (numer === KARTA_ODRZUCANA) {
      return h.html(widget(`<p class="error" role="alert">Płatność odrzucona przez bank. Użyj innej karty.</p>${formularzKarty(suma)}`), 402);
    }
    const numery = zamowKoszyk(h, ctx.user.id);
    h.html(widget(`<h2>Płatność przyjęta</h2>
      <p>Zapłacono ${cena(suma)}. Numer zamówienia: <strong data-testid="payment-order">${escapeHtml(numery.join(', '))}</strong></p>
      <p><a href="/zamowienia" target="_top">Przejdź do moich zamówień</a></p>`));
  });

  app.get('/regulamin', (ctx, h) => {
    h.html(layout({ title: 'Regulamin', user: ctx.user, body: `<h1>Regulamin sklepu Namssor</h1>
      <p>To fikcyjny regulamin aplikacji szkoleniowej. Nie dotyczy żadnego prawdziwego sklepu.</p>
      <h2>§ 1. Zamówienia</h2><p>Zamówienie można anulować, dopóki ma status „Nowe”.</p>
      <h2>§ 2. Płatności</h2><p>Płatność kartą obsługuje zewnętrzna bramka. Sklep nie przechowuje numerów kart.</p>
      <h2>§ 3. Dostawa</h2><p>Zamówienie wysyłamy na adres dostawy zapisany w koncie klienta.</p>` }));
  });
}

function formularzKarty(suma, wartosc = '', blad = '') {
  return `<p>Do zapłaty: <strong>${cena(suma)}</strong></p>
    <form method="post" action="/widget/platnosc" novalidate>
      <p class="pole"><label for="karta">Numer karty</label>
        <input id="karta" name="karta" inputmode="numeric" autocomplete="cc-number" value="${escapeHtml(wartosc)}"
          ${blad ? 'aria-invalid="true" aria-describedby="blad-karta"' : ''}>
        ${blad ? `<span class="blad-pola" id="blad-karta">${escapeHtml(blad)}</span>` : ''}</p>
      <button type="submit">Zapłać</button></form>`;
}

function widget(tresc) {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Bramka płatnicza</title>
<style>${CSS} body{background:#fff;padding:1rem 1.25rem} h1{font-size:1.1rem}</style></head>
<body><h1>Bezpieczna płatność · PayDemo</h1>${tresc}</body></html>`;
}
