// Wspólny wygląd stron: układ, menu, style i drobne funkcje formatujące.
// Fikcyjna marka „Namssor”. Styl tylko w CSS, bez bibliotek.

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export const cena = (grosze) => (grosze / 100).toFixed(2).replace('.', ',') + ' zł';
export const statusZamowienia = (status) => (status === 'new' ? 'Nowe' : 'Anulowane');

const LOGO = `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="var(--accent)"/>
<path d="M9.5 21V9h3.2l4.6 7V9h3.2v12h-3.2l-4.6-7v7z" fill="#fff"/></svg>`;

export const CSS = `:root{--brand:#0e7c7b;--brand-dark:#0a5e5d;--brand-soft:#e3f2f1;--accent:#ff6b57;--bg:#f4f7f6;--surface:#fff;
--text:#1d2b2a;--muted:#5f6f6d;--line:#dde5e3;--danger:#b42318}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif}
header{background:#fff;border-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,.04)}
.bar{max-width:1100px;margin:0 auto;padding:.7rem 1.25rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:.55rem;text-decoration:none;color:inherit;font-weight:700;font-size:1.25rem;letter-spacing:-.02em}
nav{display:flex;gap:.25rem;flex:1;flex-wrap:wrap}
nav a{color:var(--muted);text-decoration:none;font-weight:500;padding:.4rem .6rem;border-radius:999px}
nav a:hover{color:var(--text);background:rgba(127,127,127,.12)}
nav a[aria-current="page"]{color:var(--brand-dark);background:var(--brand-soft)}
.who{display:flex;align-items:center;gap:.75rem;font-size:.85rem;color:var(--muted)}
.who a{color:var(--brand);font-weight:600}
.who button{background:transparent;color:inherit;border:1px solid currentColor;padding:.3rem .8rem;font-size:.85rem}
main{max-width:1100px;margin:1.75rem auto;padding:0 1.25rem}
h1{font-size:1.6rem;letter-spacing:-.02em;margin:0 0 1rem}
h2{font-size:1.15rem;margin:1.5rem 0 .75rem}
a{color:var(--brand)}
form p{margin:.6rem 0}
label{font-weight:500}
.pole{display:flex;flex-direction:column;gap:.3rem;max-width:24rem}
.podpowiedz{color:var(--muted);font-size:.85rem;font-weight:400}
.blad-pola{color:var(--danger);font-size:.85rem;font-weight:500}
input[aria-invalid="true"]{border-color:var(--danger);background:#fff7f6}
input:not([type=checkbox]):not([type=file]),select{font:inherit;padding:.45rem .65rem;border:1px solid var(--line);border-radius:8px;background:#fff;min-width:12rem}
input:focus,select:focus{outline:2px solid var(--brand);outline-offset:1px;border-color:var(--brand)}
input[type=checkbox]{accent-color:var(--brand);width:1.05rem;height:1.05rem;vertical-align:-2px;margin-right:.35rem}
button,.przycisk{font:inherit;font-weight:600;background:var(--brand);color:#fff;border:0;border-radius:8px;padding:.45rem 1rem;cursor:pointer;text-decoration:none;display:inline-block}
button:hover,.przycisk:hover{background:var(--brand-dark)}
button:disabled{background:#c5cfcd;color:#fff;cursor:not-allowed}
button.drugorzedny{background:transparent;color:var(--text);border:1px solid var(--line)}
.filtry{display:flex;align-items:end;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem}
.filtry label{display:flex;flex-direction:column;gap:.3rem}
table{border-collapse:separate;border-spacing:0;width:100%;background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:1rem 0}
th{background:var(--bg);color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
td,th{padding:.6rem .85rem;text-align:left;border-bottom:1px solid var(--line)}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover td{background:#fafcfb}
td form{margin:0}
td button{padding:.35rem .8rem;font-size:.85rem}
[data-testid="product-name"],[data-testid="cart-item-name"]{font-weight:600}
.niedostepny{color:var(--danger);font-weight:600}
.anuluj{background:transparent;color:var(--danger);border:1px solid #f1a9a0}
.anuluj:hover{background:#fdecea}
.flash,.error,.sukces{padding:.65rem 1rem;margin-bottom:1rem;border-radius:8px;border:1px solid}
.flash,.sukces{background:#e6f4ea;border-color:#9fd3b0;color:#14532d}
.error{background:#fdecea;border-color:#f1a9a0;color:#7f1d1d}
.error ul{margin:.3rem 0 0;padding-left:1.2rem}
.karta{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:1rem 1.25rem;margin:1rem 0}
.kafelki{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem}
.kafelki .karta{margin:0}
.ladowanie{display:flex;align-items:center;gap:.6rem;color:var(--muted)}
.spinner{width:1.1rem;height:1.1rem;border:3px solid var(--line);border-top-color:var(--brand);border-radius:50%;animation:obrot .8s linear infinite}
@keyframes obrot{to{transform:rotate(360deg)}}
dialog{border:1px solid var(--line);border-radius:12px;padding:1.25rem 1.5rem;max-width:26rem}
dialog::backdrop{background:rgba(29,43,42,.45)}
dialog .przyciski{display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem}
iframe{width:100%;max-width:30rem;height:22rem;border:1px solid var(--line);border-radius:12px;background:#fff}
footer{max-width:1100px;margin:2.5rem auto 1.5rem;padding:0 1.25rem;color:var(--muted);font-size:.8rem;display:flex;gap:1rem;flex-wrap:wrap}`;

// Menu zależy od roli: „Panel admina” widzi tylko administrator.
function menu(user) {
  const pozycje = [['/', 'Produkty'], ['/koszyk', 'Koszyk'], ['/zamowienia', 'Moje zamówienia']];
  if (user) pozycje.push(['/konto/adres', 'Adres dostawy']);
  if (user?.role === 'admin') pozycje.push(['/admin', 'Panel admina']);
  return pozycje;
}

export function layout({ title, user, body, active }) {
  const navHtml = menu(user)
    .map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`)
    .join('');
  const who = user
    ? `<span data-testid="current-user">Zalogowano jako ${escapeHtml(user.login)} (${escapeHtml(user.role)})</span>
       <form method="post" action="/wyloguj" style="display:inline"><button type="submit">Wyloguj</button></form>`
    : `<a href="/logowanie">Zaloguj</a>`;
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} · Namssor</title>
<style>${CSS}</style></head>
<body><header><div class="bar"><a class="brand" href="/">${LOGO}namssor</a>
<nav aria-label="Menu główne">${navHtml}</nav><div class="who">${who}</div></div></header>
<main>${body}</main>
<footer><span>Namssor to fikcyjna drogeria do ćwiczeń z automatyzacji testów. Dane są przykładowe.</span>
<a href="/regulamin" target="_blank" rel="noopener">Regulamin</a> <a href="/api/docs">API</a></footer>
<script>
// Komunikat po akcji (flash) znika po 3–5 s. Test, który sprawdzi go za późno, nie znajdzie go.
const flash = document.querySelector('[data-testid="flash"]');
if (flash) setTimeout(() => flash.remove(), 3000 + Math.random() * 2000);
</script></body></html>`;
}

export function flash(tekst) {
  return tekst ? `<p class="flash" data-testid="flash">${escapeHtml(tekst)}</p>` : '';
}
