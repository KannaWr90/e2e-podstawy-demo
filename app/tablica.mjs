// Tablica wyników gry „polowanie na błędy” (dzień 3).
//   /tablica           ranking na rzutnik (odświeża się co 5 s)
//   /tablica/zglos     zgłoszenie testu albo flagi niespodzianki (zalogowane konto tester01–tester12)
//   /tablica/trener    panel trenera (konto trener/admin albo token z NAMSSOR_RESET_TOKEN)
// Punkty: 1 za błąd wersji rc (raz na konto i błąd), 1 za niespodziankę (raz na konto i niespodziankę),
// +1 dla konta, które znalazło dany błąd albo niespodziankę jako pierwsze. Trener może dodać punkty ręcznie.
// Testy ocenia Klaudiusz-sędzia (app/sedzia.mjs); trener ma ostatnie słowo.
//
// Zmienne: NAMSSOR_DRUZYNY („tester01=Para Promocja,tester02=…”), NAMSSOR_TABLICA_URL (przekierowanie
// /tablica na inny serwer, np. z usługi zwykłej na usługę rc), NAMSSOR_RESET_TOKEN (panel trenera).
import crypto from 'node:crypto';
import { layout, escapeHtml } from './widoki.mjs';
import { TESTERZY } from './db.mjs';
import { parseCookies } from './http.mjs';
import { rozpoznajFlage, NIESPODZIANKI } from './flagi.mjs';
import { BLEDY, OBSZARY, PROG_PEWNOSCI, ocenTest, stanSedziego, stanKosztu, liczbaOpisow, wygladaNaManipulacje } from './sedzia.mjs';

export const MAKS_DLUGOSC_TESTU = 20_000;
const LIMIT_CIALA = 256 * 1024;
const ODSTEP_S = 30;
const LIMIT_DZIENNY = 40;
const FLAGI_OKNO_MS = 5 * 60_000;
const FLAGI_LIMIT = 10;
const STREFA = 'Europe/Warsaw';

// ---------- Baza ----------
export function przygotujTablice(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tablica_zgloszenia (
      id INTEGER PRIMARY KEY,
      login TEXT NOT NULL,
      obszar TEXT NOT NULL,
      kod TEXT NOT NULL,
      utworzone TEXT NOT NULL,
      dzien TEXT NOT NULL,
      stan TEXT NOT NULL,
      werdykt TEXT,
      pewnosc REAL,
      uzasadnienie TEXT,
      proba_manipulacji INTEGER NOT NULL DEFAULT 0,
      sedzia TEXT,
      blad TEXT
    );
    CREATE TABLE IF NOT EXISTS tablica_punkty (
      id INTEGER PRIMARY KEY,
      login TEXT NOT NULL,
      rodzaj TEXT NOT NULL CHECK (rodzaj IN ('blad', 'niespodzianka', 'bonus')),
      cel TEXT,
      punkty INTEGER NOT NULL DEFAULT 1,
      utworzone TEXT NOT NULL,
      zgloszenie_id INTEGER,
      opis TEXT,
      UNIQUE (login, rodzaj, cel)
    );
    CREATE TABLE IF NOT EXISTS tablica_stan (
      klucz TEXT PRIMARY KEY,
      wartosc TEXT NOT NULL
    );
  `);
}

const otwarta = (h) => h.get("SELECT wartosc FROM tablica_stan WHERE klucz = 'zamknieta'")?.wartosc !== '1';
const ustawOtwarta = (h, tak) =>
  h.run("INSERT INTO tablica_stan (klucz, wartosc) VALUES ('zamknieta', ?) ON CONFLICT(klucz) DO UPDATE SET wartosc = excluded.wartosc", [tak ? '0' : '1']);

// ---------- Pomocnicze ----------
const teraz = () => new Date().toISOString();
const czesci = (iso, opcje) =>
  Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: STREFA, hourCycle: 'h23', ...opcje }).formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
const godzina = (iso) => {
  if (!iso) return '–';
  const c = czesci(iso, { hour: '2-digit', minute: '2-digit' });
  return `${c.hour}:${c.minute}`;
};
const dzienPl = (iso = teraz()) => {
  const c = czesci(iso, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${c.year}-${c.month}-${c.day}`;
};
const nrBledu = (id) => Number(String(id).slice(1));

function druzyny() {
  const wynik = {};
  for (const para of String(process.env.NAMSSOR_DRUZYNY ?? '').split(/[,;\n]/)) {
    const [login, ...nazwa] = para.split('=');
    if (login?.trim() && nazwa.join('=').trim()) wynik[login.trim()] = nazwa.join('=').trim().slice(0, 40);
  }
  return wynik;
}

// ---------- Punktacja ----------
export function wyniki(h) {
  const nazwy = druzyny();
  const konta = new Map(TESTERZY.map((login) => [login, { login, druzyna: nazwy[login] ?? '', punkty: 0, bledy: 0, niespodzianki: 0, ostatni: null }]));
  const pierwsi = {};
  for (const p of h.all('SELECT * FROM tablica_punkty ORDER BY utworzone, id')) {
    if (!konta.has(p.login)) konta.set(p.login, { login: p.login, druzyna: nazwy[p.login] ?? '', punkty: 0, bledy: 0, niespodzianki: 0, ostatni: null });
    const k = konta.get(p.login);
    k.punkty += p.punkty;
    if (p.rodzaj === 'blad') k.bledy++;
    if (p.rodzaj === 'niespodzianka') k.niespodzianki++;
    if (p.rodzaj !== 'bonus' && p.cel && !pierwsi[`${p.rodzaj}:${p.cel}`]) {
      pierwsi[`${p.rodzaj}:${p.cel}`] = p.login;
      k.punkty += 1;
    }
    k.ostatni = p.utworzone;
  }
  const ranking = [...konta.values()].sort(
    (a, b) => b.punkty - a.punkty || (a.ostatni ?? '9').localeCompare(b.ostatni ?? '9') || a.login.localeCompare(b.login),
  );
  let miejsce = 0;
  ranking.forEach((k, i) => {
    const poprzedni = ranking[i - 1];
    if (!poprzedni || poprzedni.punkty !== k.punkty || poprzedni.ostatni !== k.ostatni) miejsce = i + 1;
    k.miejsce = miejsce;
  });
  return {
    ranking,
    bledy: BLEDY.map((id) => ({ nr: nrBledu(id), pierwszy: pierwsi[`blad:${id}`] ?? null })),
    niespodzianki: NIESPODZIANKI.map((nr) => ({ nr, pierwszy: pierwsi[`niespodzianka:N${nr}`] ?? null })),
  };
}

// Dodaje punkt; false, gdy konto już ma punkt za ten cel.
function dodajPunkt(h, { login, rodzaj, cel = null, punkty = 1, zgloszenieId = null, opis = null }) {
  const wynik = h.run(
    'INSERT INTO tablica_punkty (login, rodzaj, cel, punkty, utworzone, zgloszenie_id, opis) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING',
    [login, rodzaj, cel, punkty, teraz(), zgloszenieId, opis],
  );
  return wynik.changes > 0;
}

const czyPierwszy = (h, rodzaj, cel, login) =>
  h.get('SELECT login FROM tablica_punkty WHERE rodzaj = ? AND cel = ? ORDER BY utworzone, id LIMIT 1', [rodzaj, cel])?.login === login;

// ---------- Uprawnienia trenera ----------
const skrotTokenu = (t) => crypto.createHash('sha256').update(`tablica:${t}`).digest('hex');
function rowne(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function czyTrener(ctx) {
  if (ctx.user && (ctx.user.login === 'trener' || ctx.user.role === 'admin')) return true;
  const token = process.env.NAMSSOR_RESET_TOKEN;
  if (!token) return false;
  return rowne(ctx.req.headers['x-reset-token'], token) || rowne(parseCookies(ctx.req).tablica_trener, skrotTokenu(token));
}
const https = (ctx) => ctx.req.socket.encrypted || String(ctx.req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim() === 'https';

// ---------- Limity zgłoszeń ----------
function limitZgloszen(h, login) {
  const ostatnie = h.get('SELECT utworzone FROM tablica_zgloszenia WHERE login = ? ORDER BY id DESC LIMIT 1', [login]);
  if (ostatnie) {
    const minelo = (Date.now() - Date.parse(ostatnie.utworzone)) / 1000;
    if (minelo < ODSTEP_S) return `Następne zgłoszenie testu za ${Math.ceil(ODSTEP_S - minelo)} s. Klaudiusz potrzebuje chwili.`;
  }
  const dzis = h.get('SELECT COUNT(*) AS n FROM tablica_zgloszenia WHERE login = ? AND dzien = ?', [login, dzienPl()]).n;
  if (dzis >= LIMIT_DZIENNY) return `Wykorzystaliście limit ${LIMIT_DZIENNY} zgłoszeń na dziś. Zgłoście się do trenera.`;
  return null;
}

const probyFlag = new Map();
function limitFlag(login) {
  const t = Date.now();
  const proby = (probyFlag.get(login) ?? []).filter((x) => t - x < FLAGI_OKNO_MS);
  if (proby.length >= FLAGI_LIMIT) return 'Za dużo prób zgłoszenia flagi. Odczekajcie kilka minut.';
  proby.push(t);
  probyFlag.set(login, proby);
  return null;
}

// ---------- Widoki ----------
const CSS_TABLICY = `:root{--bg:#050505;--panel:#121212;--linia:#2a2a2a;--zolty:#ffd400;--czerwony:#ff2d2d;--tekst:#f5f5f5;--szary:#a0a0a0}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tekst);font:clamp(16px,1.4vw,34px)/1.35 "Segoe UI",system-ui,-apple-system,sans-serif}
header{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:.8vw 2vw;border-bottom:.35vw solid var(--zolty);background:#000}
h1{margin:0;font-size:2.1em;font-weight:900;letter-spacing:-.02em;text-transform:uppercase}
h1 span{color:var(--zolty)}
.metka{display:inline-block;background:var(--czerwony);color:#fff;font-weight:900;padding:.15em .6em;border-radius:.3em;transform:rotate(-3deg);font-size:1.1em}
main{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(0,1fr);gap:2vw;padding:1vw 2vw}
@media (max-width:900px){main{grid-template-columns:1fr}}
@media (max-width:600px){th{font-size:.5em;letter-spacing:0}td{padding:.1em .2em}.metka{display:none}}
h2{margin:.2em 0 .5em;font-size:1.15em;text-transform:uppercase;letter-spacing:.08em;color:var(--zolty)}
table{width:100%;border-collapse:collapse}
th{font-size:.7em;text-transform:uppercase;letter-spacing:.08em;color:var(--szary);text-align:left;padding:.2em .5em;font-weight:600}
td{padding:.12em .5em;border-top:1px solid var(--linia);vertical-align:middle}
td.liczba,th.liczba{text-align:right;font-variant-numeric:tabular-nums}
td.pkt{font-size:1.35em;font-weight:900;color:var(--zolty)}
.miejsce{display:inline-grid;place-items:center;width:1.5em;height:1.5em;border-radius:50%;background:var(--panel);border:2px solid var(--linia);font-weight:800}
tr.podium .miejsce{background:var(--zolty);color:#000;border-color:var(--zolty)}
.konto{font-weight:700}
.druzyna{display:block;color:var(--szary);font-size:.7em}
.licznik{background:var(--panel);border:2px dashed var(--zolty);border-radius:.6em;padding:.6em .9em;margin-bottom:1em}
.licznik p{margin:.15em 0;font-size:1.25em;font-weight:800}
.licznik strong{color:var(--czerwony);font-size:1.4em}
ul.pierwsi{list-style:none;margin:0 0 1em;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.3em .8em;font-size:.8em}
ul.pierwsi li{background:var(--panel);border-left:.3em solid var(--linia);padding:.2em .5em;border-radius:.2em}
ul.pierwsi li.znaleziony{border-left-color:var(--czerwony)}
.zamknieta{background:var(--czerwony);color:#fff;font-weight:900;text-align:center;padding:.4em;font-size:1.3em;text-transform:uppercase}
footer{color:var(--szary);font-size:.7em;padding:0 2vw 1vw}`;

function fragmentTablicy(h) {
  const { ranking, bledy, niespodzianki } = wyniki(h);
  const wiersze = ranking
    .map(
      (k) => `<tr data-testid="ranking-row"${k.miejsce <= 3 && k.punkty > 0 ? ' class="podium"' : ''}>
      <td><span class="miejsce">${k.miejsce}</span></td>
      <td><span class="konto">${escapeHtml(k.login)}</span>${k.druzyna ? `<span class="druzyna">${escapeHtml(k.druzyna)}</span>` : ''}</td>
      <td class="liczba pkt" data-testid="ranking-points">${k.punkty}</td>
      <td class="liczba">${k.bledy}</td><td class="liczba">${k.niespodzianki}</td>
      <td class="liczba">${godzina(k.ostatni)}</td></tr>`,
    )
    .join('');
  const nieodkryteB = bledy.filter((b) => !b.pierwszy).length;
  const nieodkryteN = niespodzianki.filter((n) => !n.pierwszy).length;
  const lista = (elementy, nazwa) =>
    elementy
      .map((e) => `<li${e.pierwszy ? ' class="znaleziony"' : ''}>${nazwa} #${e.nr}: ${e.pierwszy ? escapeHtml(e.pierwszy) : '???'}</li>`)
      .join('');
  return `${otwarta(h) ? '' : '<p class="zamknieta" data-testid="board-closed">Tablica zamknięta</p>'}
  <main>
    <section aria-labelledby="ranking"><h2 id="ranking">Ranking</h2>
      <table><thead><tr><th>#</th><th>Konto</th><th class="liczba">Punkty</th><th class="liczba">Błędy</th><th class="liczba">Niespodzianki</th><th class="liczba">Ostatni punkt</th></tr></thead>
      <tbody>${wiersze}</tbody></table></section>
    <section aria-labelledby="licznik"><h2 id="licznik">Zostało do znalezienia</h2>
      <div class="licznik" data-testid="undiscovered">
        <p>Nieodkryte: <strong>${nieodkryteB}</strong> z ${bledy.length} błędów,</p>
        <p><strong>${nieodkryteN}</strong> z ${niespodzianki.length} niespodzianek</p></div>
      <h2>Kto pierwszy</h2>
      <ul class="pierwsi" data-testid="first-finders">${lista(bledy, 'Błąd')}</ul>
      <ul class="pierwsi">${lista(niespodzianki, 'Niespodzianka')}</ul>
    </section>
  </main>
  <footer>Zaktualizowano ${godzina(teraz())}:${String(new Date().getSeconds()).padStart(2, '0')}. Zgłoszenia: /tablica/zglos. Klaudiusz-sędzia ocenia, trener ma ostatnie słowo.</footer>`;
}

function stronaTablicy(h) {
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tablica wyników · Namssor</title><style>${CSS_TABLICY}</style></head>
<body><header><h1>Czarny Piątek: <span>polowanie na błędy</span></h1><span class="metka">-100% błędów</span></header>
<div id="tablica">${fragmentTablicy(h)}</div>
<script>
setInterval(async () => {
  try {
    const r = await fetch('/tablica/fragment', { cache: 'no-store' });
    if (r.ok) document.getElementById('tablica').innerHTML = await r.text();
  } catch {}
}, 5000);
</script></body></html>`;
}

const STANY = {
  ocenianie: 'oceniane',
  przyznane: 'zaliczone',
  powtorka: 'już zaliczone wcześniej',
  oczekuje: 'czeka na trenera',
  odrzucone: 'nie zaliczone',
  manipulacja: 'próba manipulacji',
  cofniete: 'punkt cofnięty',
};

function wynikZgloszenia(z) {
  if (!z) return '';
  const uz = z.uzasadnienie ? `<p data-testid="verdict-reason">Uzasadnienie: ${escapeHtml(z.uzasadnienie)}</p>` : '';
  if (z.stan === 'przyznane') {
    return `<div class="sukces" role="status" data-testid="verdict"><p><strong>Zaliczony błąd #${nrBledu(z.blad)}.</strong> +1 punkt${z.pierwszy ? ', a za pierwsze znalezisko +1 bonus' : ''}.</p>${uz}</div>`;
  }
  if (z.stan === 'powtorka') return `<div class="sukces" role="status" data-testid="verdict"><p>Błąd #${nrBledu(z.blad)} macie już zaliczony. Punkty bez zmian.</p>${uz}</div>`;
  if (z.stan === 'manipulacja') {
    return `<div class="error" role="alert" data-testid="verdict"><p><strong>Klaudiusz: „Jestem pewien, że to nie zadziała”.</strong> Test próbuje wpłynąć na sędziego: 0 punktów, zgłoszenie trafia do trenera.</p></div>`;
  }
  if (z.stan === 'oczekuje') {
    const pewnosc = z.werdykt ? ` Klaudiusz nie jest pewien (${Math.round((z.pewnosc ?? 0) * 100)}%).` : '';
    return `<div class="klaudiusz" role="status" data-testid="verdict"><p>Zgłoszenie czeka na trenera.${pewnosc}${z.powod ? ` Sędzia: ${escapeHtml(z.powod)}.` : ''}</p>${uz}</div>`;
  }
  return `<div class="error" role="alert" data-testid="verdict"><p>Klaudiusz-sędzia: ten test nie łapie błędu wersji rc. 0 punktów. Trener może jeszcze zmienić decyzję.</p>${uz}</div>`;
}

function stronaZgloszen(ctx, h, { wynik = '', obszar = '', kod = '' } = {}) {
  const tester = ctx.user && TESTERZY.includes(ctx.user.login);
  let tresc;
  if (!ctx.user) {
    tresc = `<p>Zgłoszenia przyjmujemy z kont <code>tester01</code>–<code>tester12</code>. <a href="/logowanie?next=%2Ftablica%2Fzglos">Zaloguj się</a>.</p>`;
  } else if (!tester) {
    tresc = '<p class="error" role="alert">Zgłoszenia przyjmujemy tylko z kont tester01–tester12.</p>';
  } else {
    const opcje = OBSZARY.map((o) => `<option${o === obszar ? ' selected' : ''}>${o}</option>`).join('');
    const moje = h.all('SELECT * FROM tablica_zgloszenia WHERE login = ? ORDER BY id DESC LIMIT 20', [ctx.user.login]);
    const wiersze = moje
      .map(
        (z) => `<tr><td>${godzina(z.utworzone)}</td><td>${escapeHtml(z.obszar)}</td><td>${STANY[z.stan] ?? escapeHtml(z.stan)}</td>
        <td>${z.blad && ['przyznane', 'powtorka'].includes(z.stan) ? `Błąd #${nrBledu(z.blad)}` : '–'}</td><td>${escapeHtml(z.uzasadnienie ?? '')}</td></tr>`,
      )
      .join('');
    tresc = `${otwarta(h) ? '' : '<p class="error" role="alert">Tablica jest zamknięta. Zgłoszenia nie są przyjmowane.</p>'}
      ${wynik}
      <h2>Zgłoś błąd</h2>
      <p>Wklejcie cały plik testu. Klaudiusz-sędzia sprawdzi, czy test przechodzi na wersji zwykłej i pada na <code>rc</code>. Trener ma ostatnie słowo.</p>
      <form method="post" action="/tablica/zglos" novalidate>
        <p class="pole"><label for="obszar">Obszar</label><select id="obszar" name="obszar">${opcje}</select></p>
        <p class="pole" style="max-width:none"><label for="kod">Cały plik testu</label>
          <span class="podpowiedz" id="kod-podpowiedz">Do ${MAKS_DLUGOSC_TESTU.toLocaleString('pl-PL')} znaków. Jedno zgłoszenie na ${ODSTEP_S} s.</span>
          <textarea id="kod" name="kod" rows="16" maxlength="${MAKS_DLUGOSC_TESTU}" aria-describedby="kod-podpowiedz"
            style="font:13px/1.4 ui-monospace,Consolas,monospace;width:100%">${escapeHtml(kod)}</textarea></p>
        <button type="submit">Wyślij do Klaudiusza-sędziego</button></form>
      <h2>Zgłoś flagę niespodzianki</h2>
      <form method="post" action="/tablica/flaga" class="filtry" novalidate>
        <label>Flaga <input name="flaga" autocomplete="off" placeholder="FLAGA-…"></label>
        <button type="submit">Zgłoś flagę</button></form>
      <h2>Wasze zgłoszenia</h2>
      <table><thead><tr><th>Godzina</th><th>Obszar</th><th>Stan</th><th>Wynik</th><th>Uzasadnienie</th></tr></thead><tbody>${wiersze}</tbody></table>`;
  }
  return layout({
    title: 'Zgłoszenie na tablicę',
    user: ctx.user,
    body: `<h1>Zgłoszenie na tablicę wyników</h1>${tresc}<p><a href="/tablica">Tablica wyników</a></p>`,
  });
}

function panelTrenera(ctx, h, komunikat = '') {
  const sedzia = stanSedziego();
  const koszt = stanKosztu();
  const opcjeBledow = BLEDY.map((b) => `<option value="${b}">Błąd #${nrBledu(b)} (${b})</option>`).join('');
  const kolejnosc = "CASE stan WHEN 'oczekuje' THEN 0 WHEN 'manipulacja' THEN 1 WHEN 'ocenianie' THEN 2 ELSE 3 END";
  const zgloszenia = h.all(`SELECT * FROM tablica_zgloszenia ORDER BY ${kolejnosc}, id DESC LIMIT 100`);
  const akcja = (nazwa, pola, etykieta, klasa = '') =>
    `<form method="post" action="/tablica/trener/akcja" style="display:inline"><input type="hidden" name="akcja" value="${nazwa}">${pola}<button type="submit"${klasa ? ` class="${klasa}"` : ''}>${etykieta}</button></form>`;
  const wiersze = zgloszenia
    .map(
      (z) => `<tr data-testid="queue-row"><td>${z.id}</td><td>${godzina(z.utworzone)}</td><td>${escapeHtml(z.login)}</td><td>${escapeHtml(z.obszar)}</td>
      <td>${STANY[z.stan] ?? escapeHtml(z.stan)}${z.proba_manipulacji ? ' <strong class="niedostepny">MANIPULACJA</strong>' : ''}</td>
      <td>${z.werdykt ? `${escapeHtml(z.werdykt)} (${Math.round((z.pewnosc ?? 0) * 100)}%)` : '–'}${z.blad ? `<br>zaliczony: ${escapeHtml(z.blad)}` : ''}<br><span class="podpowiedz">${escapeHtml(z.sedzia ?? '')}</span></td>
      <td>${escapeHtml(z.uzasadnienie ?? '')}
        <details><summary>Kod testu (${z.kod.length} znaków)</summary><pre data-testid="queue-code" style="white-space:pre-wrap;max-height:30rem;overflow:auto;font-size:12px">${escapeHtml(z.kod)}</pre></details></td>
      <td>${akcja('zatwierdz', `<input type="hidden" name="id" value="${z.id}"><select name="blad" aria-label="Błąd dla zgłoszenia ${z.id}">${opcjeBledow}</select>`, 'Zatwierdź')}
        ${akcja('odrzuc', `<input type="hidden" name="id" value="${z.id}">`, 'Odrzuć', 'anuluj')}</td></tr>`,
    )
    .join('');
  const punkty = h.all('SELECT * FROM tablica_punkty ORDER BY id DESC')
    .map(
      (p) => `<tr data-testid="points-row"><td>${godzina(p.utworzone)}</td><td>${escapeHtml(p.login)}</td><td>${escapeHtml(p.rodzaj)}</td><td>${escapeHtml(p.cel ?? '')}</td>
      <td>${p.punkty}</td><td>${p.zgloszenie_id ?? ''}</td><td>${escapeHtml(p.opis ?? '')}</td>
      <td>${akcja('cofnij', `<input type="hidden" name="punkt" value="${p.id}">`, 'Cofnij punkt', 'anuluj')}</td></tr>`,
    )
    .join('');
  const konta = TESTERZY.map((l) => `<option>${l}</option>`).join('');
  const cele = BLEDY.map((b) => `<option value="${b}">Błąd #${nrBledu(b)} (${b})</option>`)
    .concat(NIESPODZIANKI.map((n) => `<option value="N${n}">Niespodzianka #${n}</option>`), ['<option value="bonus">Bonus (punkty niżej)</option>'])
    .join('');
  return layout({
    title: 'Panel trenera: tablica',
    user: ctx.user,
    body: `<h1>Panel trenera: tablica wyników</h1>
    ${komunikat ? `<p class="flash" role="status">${escapeHtml(komunikat)}</p>` : ''}
    <p>Tablica: <strong data-testid="board-state">${otwarta(h) ? 'otwarta' : 'zamknięta'}</strong>.
      ${otwarta(h) ? akcja('zamknij', '', 'Zamknij tablicę', 'anuluj') : akcja('otworz', '', 'Otwórz tablicę')}</p>
    <p>Sędzia: ${sedzia.ok ? 'działa' : 'wyłączony'} (${escapeHtml(sedzia.powod)}); opisy błędów: ${liczbaOpisow()} z ${BLEDY.length};
      koszt: $${koszt.suma.toFixed(4)} z $${koszt.limit} (${koszt.wywolania} wywołań).</p>
    <h2>Zgłoszenia</h2>
    <table><thead><tr><th>Nr</th><th>Godz.</th><th>Konto</th><th>Obszar</th><th>Stan</th><th>Werdykt</th><th>Uzasadnienie i test</th><th>Decyzja</th></tr></thead>
    <tbody>${wiersze}</tbody></table>
    <h2>Dodaj punkt ręcznie</h2>
    <form method="post" action="/tablica/trener/akcja" class="filtry"><input type="hidden" name="akcja" value="dodaj">
      <label>Konto <select name="login">${konta}</select></label>
      <label>Za co <select name="cel">${cele}</select></label>
      <label>Punkty (bonus) <input name="punkty" type="number" value="1" min="-10" max="10"></label>
      <label>Opis <input name="opis" maxlength="100"></label>
      <button type="submit">Dodaj punkt</button></form>
    <h2>Punkty</h2>
    <table><thead><tr><th>Godz.</th><th>Konto</th><th>Rodzaj</th><th>Cel</th><th>Pkt</th><th>Zgłoszenie</th><th>Opis</th><th></th></tr></thead><tbody>${punkty}</tbody></table>
    <h2>Reset tablicy</h2>
    <form method="post" action="/tablica/trener/akcja"><input type="hidden" name="akcja" value="reset">
      <p><label><input type="checkbox" name="potwierdzam" value="1"> Kasuję wszystkie punkty i zgłoszenia</label></p>
      <button type="submit" class="anuluj">Resetuj tablicę</button></form>
    <p><a href="/tablica">Tablica wyników</a></p>`,
  });
}

function stronaWejscia(ctx, blad = '') {
  return layout({
    title: 'Panel trenera',
    user: ctx.user,
    body: `<h1>Panel trenera: tablica wyników</h1>
    ${blad ? `<p class="error" role="alert">${escapeHtml(blad)}</p>` : ''}
    <p>Zaloguj się kontem <code>trener</code> albo podaj token trenera.</p>
    <form method="post" action="/tablica/trener/wejscie" class="filtry" novalidate>
      <label>Token trenera <input name="token" type="password" autocomplete="off"></label>
      <button type="submit">Wejdź</button></form>`,
  });
}

// ---------- Zgłoszenie testu ----------
async function zglosTest(ctx, h) {
  const login = ctx.user.login;
  const obszar = OBSZARY.includes(ctx.body.obszar) ? ctx.body.obszar : 'inne';
  const kod = String(ctx.body.kod ?? '').replace(/\r\n/g, '\n');
  const blad = (tekst, status) =>
    h.html(stronaZgloszen(ctx, h, { wynik: `<p class="error" role="alert" data-testid="verdict">${escapeHtml(tekst)}</p>`, obszar, kod }), status);

  if (!otwarta(h)) return blad('Tablica jest zamknięta. Zgłoszenia nie są przyjmowane.', 403);
  if (!kod.trim()) return blad('Wklejcie cały plik testu.', 400);
  if (kod.length > MAKS_DLUGOSC_TESTU) return blad(`Test ma ${kod.length} znaków. Limit: ${MAKS_DLUGOSC_TESTU}.`, 400);
  const limit = limitZgloszen(h, login);
  if (limit) return blad(limit, 429);

  const utworzone = teraz();
  const { lastInsertRowid: id } = h.run(
    "INSERT INTO tablica_zgloszenia (login, obszar, kod, utworzone, dzien, stan) VALUES (?, ?, ?, ?, ?, 'ocenianie')",
    [login, obszar, kod, utworzone, dzienPl(utworzone)],
  );

  const sedzia = stanSedziego();
  let z = { stan: 'oczekuje', werdykt: null, pewnosc: null, uzasadnienie: null, proba: wygladaNaManipulacje(kod), sedzia: `brak: ${sedzia.powod}`, blad: null };
  if (sedzia.ok) {
    try {
      const w = await ocenTest(kod, obszar);
      z = { ...z, werdykt: w.blad, pewnosc: w.pewnosc, uzasadnienie: w.uzasadnienie, proba: w.proba_manipulacji, sedzia: w.sedzia };
      if (w.proba_manipulacji) z.stan = 'manipulacja';
      else if (w.blad && w.pewnosc >= PROG_PEWNOSCI) z.stan = 'przyznane';
      else if (w.blad) z.stan = 'oczekuje';
      else z.stan = 'odrzucone';
    } catch (e) {
      console.error(`[sędzia] zgłoszenie ${id}: ${e.message}`);
      z.sedzia = 'błąd sędziego';
      z.powod = 'nie odpowiedział, decyzję podejmie trener';
    }
  } else {
    z.powod = sedzia.powod;
  }
  if (z.proba && z.stan !== 'manipulacja') Object.assign(z, { stan: 'manipulacja', werdykt: null, pewnosc: 0 });
  if (z.stan === 'przyznane') {
    z.blad = z.werdykt;
    if (dodajPunkt(h, { login, rodzaj: 'blad', cel: z.blad, zgloszenieId: id })) z.pierwszy = czyPierwszy(h, 'blad', z.blad, login);
    else z.stan = 'powtorka';
  }
  h.run('UPDATE tablica_zgloszenia SET stan = ?, werdykt = ?, pewnosc = ?, uzasadnienie = ?, proba_manipulacji = ?, sedzia = ?, blad = ? WHERE id = ?', [
    z.stan, z.werdykt, z.pewnosc, z.uzasadnienie, z.proba ? 1 : 0, z.sedzia, z.blad, id,
  ]);
  h.html(stronaZgloszen(ctx, h, { wynik: wynikZgloszenia(z), obszar }));
}

// ---------- Zgłoszenie flagi ----------
function zglosFlage(ctx, h) {
  const login = ctx.user.login;
  const odp = (klasa, tekst, status = 200) =>
    h.html(stronaZgloszen(ctx, h, { wynik: `<p class="${klasa}" role="${klasa === 'sukces' ? 'status' : 'alert'}" data-testid="flag-result">${escapeHtml(tekst)}</p>` }), status);
  if (!otwarta(h)) return odp('error', 'Tablica jest zamknięta. Zgłoszenia nie są przyjmowane.', 403);
  const limit = limitFlag(login);
  if (limit) return odp('error', limit, 429);
  const nr = rozpoznajFlage(ctx.body.flaga);
  if (!nr) return odp('error', 'To nie jest flaga żadnej niespodzianki na tym serwerze.', 400);
  if (!dodajPunkt(h, { login, rodzaj: 'niespodzianka', cel: `N${nr}` })) return odp('sukces', `Niespodziankę #${nr} macie już zaliczoną.`);
  const pierwszy = czyPierwszy(h, 'niespodzianka', `N${nr}`, login);
  odp('sukces', `Zaliczona niespodzianka #${nr}: +1 punkt${pierwszy ? ', a za pierwsze znalezisko +1 bonus' : ''}.`);
}

// ---------- Akcje trenera ----------
function akcjaTrenera(ctx, h) {
  const b = ctx.body;
  const id = Number(b.id);
  const zgloszenie = Number.isInteger(id) ? h.get('SELECT * FROM tablica_zgloszenia WHERE id = ?', [id]) : null;
  let komunikat;
  switch (b.akcja) {
    case 'zatwierdz': {
      if (!zgloszenie || !BLEDY.includes(b.blad)) return h.html(panelTrenera(ctx, h, 'Nie ma takiego zgłoszenia albo błędu.'), 400);
      const nowy = dodajPunkt(h, { login: zgloszenie.login, rodzaj: 'blad', cel: b.blad, zgloszenieId: id, opis: 'trener' });
      h.run('UPDATE tablica_zgloszenia SET stan = ?, blad = ? WHERE id = ?', [nowy ? 'przyznane' : 'powtorka', b.blad, id]);
      komunikat = nowy ? `Zgłoszenie ${id}: zaliczony ${b.blad} dla ${zgloszenie.login}.` : `${zgloszenie.login} ma już punkt za ${b.blad}.`;
      break;
    }
    case 'odrzuc':
      if (!zgloszenie) return h.html(panelTrenera(ctx, h, 'Nie ma takiego zgłoszenia.'), 400);
      h.run('DELETE FROM tablica_punkty WHERE zgloszenie_id = ?', [id]);
      h.run("UPDATE tablica_zgloszenia SET stan = 'odrzucone', blad = NULL WHERE id = ?", [id]);
      komunikat = `Zgłoszenie ${id} odrzucone.`;
      break;
    case 'cofnij': {
      const p = h.get('SELECT * FROM tablica_punkty WHERE id = ?', [Number(b.punkt)]);
      if (!p) return h.html(panelTrenera(ctx, h, 'Nie ma takiego punktu.'), 400);
      h.run('DELETE FROM tablica_punkty WHERE id = ?', [p.id]);
      if (p.zgloszenie_id) h.run("UPDATE tablica_zgloszenia SET stan = 'cofniete' WHERE id = ?", [p.zgloszenie_id]);
      komunikat = `Cofnięto punkt ${p.login} (${p.cel ?? p.rodzaj}).`;
      break;
    }
    case 'dodaj': {
      const login = String(b.login ?? '');
      const cel = String(b.cel ?? '');
      if (!TESTERZY.includes(login)) return h.html(panelTrenera(ctx, h, 'Nieznane konto.'), 400);
      let ok;
      if (BLEDY.includes(cel)) ok = dodajPunkt(h, { login, rodzaj: 'blad', cel, opis: b.opis || 'ręcznie' });
      else if (/^N[1-6]$/.test(cel)) ok = dodajPunkt(h, { login, rodzaj: 'niespodzianka', cel, opis: b.opis || 'ręcznie' });
      else {
        const punkty = Number(b.punkty);
        if (!Number.isInteger(punkty) || punkty === 0 || Math.abs(punkty) > 10) return h.html(panelTrenera(ctx, h, 'Punkty: liczba od -10 do 10, różna od 0.'), 400);
        ok = dodajPunkt(h, { login, rodzaj: 'bonus', cel: `R${Date.now()}`, punkty, opis: String(b.opis ?? '').slice(0, 100) || 'bonus' });
      }
      komunikat = ok ? `Dodano punkt dla ${login}.` : `${login} ma już punkt za ${cel}.`;
      break;
    }
    case 'zamknij':
      ustawOtwarta(h, false);
      komunikat = 'Tablica zamknięta.';
      break;
    case 'otworz':
      ustawOtwarta(h, true);
      komunikat = 'Tablica otwarta.';
      break;
    case 'reset':
      if (b.potwierdzam !== '1') return h.html(panelTrenera(ctx, h, 'Zaznacz potwierdzenie resetu.'), 400);
      h.run('DELETE FROM tablica_punkty');
      h.run('DELETE FROM tablica_zgloszenia');
      probyFlag.clear();
      komunikat = 'Tablica wyczyszczona.';
      break;
    default:
      return h.html(panelTrenera(ctx, h, 'Nieznana akcja.'), 400);
  }
  console.log(`[tablica] trener: ${komunikat}`);
  h.html(panelTrenera(ctx, h, komunikat));
}

// ---------- Trasy ----------
export function trasyTablicy(app) {
  const gdzieIndziej = (process.env.NAMSSOR_TABLICA_URL ?? '').trim().replace(/\/+$/, '');
  if (gdzieIndziej) {
    // Tablica działa na innym serwerze (usługa rc): tutaj tylko przekierowanie.
    const cel = gdzieIndziej.replace(/\/tablica$/, '');
    for (const sciezka of ['/tablica', '/tablica/zglos', '/tablica/trener']) app.get(sciezka, (_c, h) => h.redirect(cel + sciezka));
    return;
  }
  const opcje = { limit: LIMIT_CIALA };

  app.get('/tablica', (_c, h) => h.html(stronaTablicy(h)));
  app.get('/tablica/fragment', (_c, h) => h.html(fragmentTablicy(h)));

  app.get('/tablica/zglos', (ctx, h) => h.html(stronaZgloszen(ctx, h)));
  app.post('/tablica/zglos', async (ctx, h) => {
    if (!ctx.user || !TESTERZY.includes(ctx.user.login)) return h.html(stronaZgloszen(ctx, h), 401);
    return zglosTest(ctx, h);
  }, opcje);
  app.post('/tablica/flaga', (ctx, h) => {
    if (!ctx.user || !TESTERZY.includes(ctx.user.login)) return h.html(stronaZgloszen(ctx, h), 401);
    return zglosFlage(ctx, h);
  }, opcje);

  app.get('/tablica/trener', (ctx, h) => (czyTrener(ctx) ? h.html(panelTrenera(ctx, h)) : h.html(stronaWejscia(ctx), 401)));
  app.post('/tablica/trener/wejscie', (ctx, h) => {
    const token = process.env.NAMSSOR_RESET_TOKEN;
    if (!token || !rowne(ctx.body.token, token)) return h.html(stronaWejscia(ctx, 'Zły token.'), 403);
    ctx.res.setHeader('set-cookie', `tablica_trener=${skrotTokenu(token)}; Path=/tablica; HttpOnly; SameSite=Strict${https(ctx) ? '; Secure' : ''}`);
    h.redirect('/tablica/trener');
  }, opcje);
  app.post('/tablica/trener/akcja', (ctx, h) => (czyTrener(ctx) ? akcjaTrenera(ctx, h) : h.html(stronaWejscia(ctx), 401)), opcje);
}
