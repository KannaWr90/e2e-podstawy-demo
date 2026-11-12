// Profil klienta: lista adresów, dodawanie adresu, wybór adresu domyślnego.
import { layout, escapeHtml, flash } from './widoki.mjs';
import { adresy, dodajAdres, ustawDomyslny, usunAdres } from './logika.mjs';
import { wymagajLogowania } from './sklep.mjs';

const POLA = [
  ['name', 'Nazwa adresu', 'np. Praca, Rodzice'],
  ['street', 'Ulica i numer', 'np. ul. Kwiatowa 5/2'],
  ['postal_code', 'Kod pocztowy', 'Format: 00-000'],
  ['city', 'Miasto', ''],
  ['phone', 'Telefon', '9 cyfr, np. 500 100 200'],
];

export function trasyProfilu(app) {
  app.get('/konto/adresy', (ctx, h) => {
    if (!wymagajLogowania(ctx, h)) return;
    const komunikat = ctx.query.dodano ? `Dodano adres: ${ctx.query.dodano}`
      : ctx.query.domyslny ? `Adres domyślny: ${ctx.query.domyslny}`
        : ctx.query.usunieto ? `Usunięto adres: ${ctx.query.usunieto}` : '';
    h.html(strona(ctx, h, flash(komunikat)));
  });

  app.post('/konto/adresy', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/konto/adresy');
    const { errors, adres } = dodajAdres(h, ctx.user.id, ctx.body);
    if (errors) return h.html(strona(ctx, h, '', errors, ctx.body), 400);
    h.redirect('/konto/adresy?dodano=' + encodeURIComponent(adres.name));
  });

  app.post('/konto/adresy/:id/usun', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/konto/adresy');
    const id = Number(ctx.params.id);
    const a = adresy(h, ctx.user.id).find((x) => x.id === id);
    if (!a || usunAdres(h, ctx.user.id, id) !== true) return h.notFound();
    h.redirect('/konto/adresy?usunieto=' + encodeURIComponent(a.name));
  });

  app.post('/konto/adresy/:id/domyslny', (ctx, h) => {
    if (!ctx.user) return h.redirect('/logowanie?next=/konto/adresy');
    const id = Number(ctx.params.id);
    if (!Number.isInteger(id) || !ustawDomyslny(h, ctx.user.id, id)) return h.notFound();
    const a = adresy(h, ctx.user.id).find((x) => x.id === id);
    h.redirect('/konto/adresy?domyslny=' + encodeURIComponent(a.name));
  });
}

function strona(ctx, h, komunikat, errors = [], dane = {}) {
  const lista = adresy(h, ctx.user.id)
    .map((a) => `<article class="karta" data-testid="address" aria-labelledby="adres-${a.id}">
      <h2 id="adres-${a.id}">${escapeHtml(a.name)}${a.default ? ' <span class="plakietka spokojna" data-testid="default-address">Domyślny</span>' : ''}</h2>
      <p>${escapeHtml(a.street || 'nie podano')}<br>${escapeHtml(a.postal_code)} ${escapeHtml(a.city)}<br>tel. ${escapeHtml(a.phone)}</p>
      ${a.id === 0 ? '<p><a href="/konto/adres">Zmień adres główny</a></p>' : ''}
      ${a.default ? '' : `<form method="post" action="/konto/adresy/${a.id}/domyslny" style="display:inline">
        <button type="submit" class="drugorzedny" aria-label="Ustaw jako domyślny: ${escapeHtml(a.name)}">Ustaw jako domyślny</button></form>`}
      ${a.id === 0 ? '' : `<form method="post" action="/konto/adresy/${a.id}/usun" style="display:inline">
        <button type="submit" class="anuluj" aria-label="Usuń adres: ${escapeHtml(a.name)}">Usuń</button></form>`}
    </article>`)
    .join('');
  const bledy = Object.fromEntries(errors.map((e) => [e.field, e.message]));
  const pola = POLA.map(([pole, etykieta, podpowiedz]) => {
    const opisy = [podpowiedz ? `podpowiedz-a-${pole}` : '', bledy[pole] ? `blad-a-${pole}` : ''].filter(Boolean).join(' ');
    return `<p class="pole"><label for="a-${pole}">${etykieta}</label>
      ${podpowiedz ? `<span class="podpowiedz" id="podpowiedz-a-${pole}">${podpowiedz}</span>` : ''}
      <input id="a-${pole}" name="${pole}" value="${escapeHtml(dane[pole] ?? '')}" ${bledy[pole] ? 'aria-invalid="true"' : ''} ${opisy ? `aria-describedby="${opisy}"` : ''}>
      ${bledy[pole] ? `<span class="blad-pola" id="blad-a-${pole}">${escapeHtml(bledy[pole])}</span>` : ''}</p>`;
  }).join('');
  const podsumowanie = errors.length ? `<div class="error" role="alert">Popraw błędy w formularzu (${errors.length}).</div>` : '';
  return layout({ title: 'Moje adresy', user: ctx.user, active: '/konto/adresy', body: `<h1>Moje adresy</h1>
    ${komunikat}
    <p class="podpowiedz">Zamówienie wysyłamy na adres domyślny.</p>
    <div class="kafelki" data-testid="address-list">${lista}</div>
    <h2>Dodaj adres</h2>${podsumowanie}
    <form method="post" action="/konto/adresy" novalidate>${pola}
      <button type="submit">Dodaj adres</button></form>` });
}
