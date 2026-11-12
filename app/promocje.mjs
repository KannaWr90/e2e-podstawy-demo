// Czarny Piątek: ceny promocyjne, kody rabatowe i baner z odliczaniem.
import { escapeHtml } from './widoki.mjs';
import { dzisiaj, dniDo, dataPl } from './wersja.mjs';
import { usluga } from './rozszerzenia.mjs';

export const START_PROMOCJI = '2026-11-27';

// Cena po rabacie promocyjnym (w groszach).
export const cenaPromocyjna = (grosze, procent) => (procent > 0 ? Math.round((grosze * (100 - procent)) / 100) : grosze);

// Cena do wyświetlenia na kafelku, karcie produktu i w tabeli: stara przekreślona, nowa, plakietka.
// `testid` to przedrostek data-testid, np. 'tile' daje tile-price, tile-old-price, tile-badge.
export function cenaHtml(p, testid) {
  const nowa = cenaPromocyjna(p.price_cents, p.promo_percent);
  const zl = (g) => (g / 100).toFixed(2).replace('.', ',') + ' zł';
  if (!p.promo_percent) return `<span class="cena-nowa" data-testid="${testid}-price">${zl(nowa)}</span>`;
  return `<s class="cena-stara" data-testid="${testid}-old-price">${zl(p.price_cents)}</s>
    <span class="cena-nowa promocja" data-testid="${testid}-price">${zl(nowa)}</span>
    <span class="plakietka" data-testid="${testid}-badge">-${p.promo_percent}%</span>`;
}

// ---------- Kody rabatowe ----------
// koniec: ostatni dzień ważności (włącznie); kategoria: kod działa tylko na produkty tej kategorii.
const KODY = {
  CZARNY20: { procent: 20, koniec: '2026-11-30', opis: '-20% na całe zamówienie' },
  JESIEN10: { procent: 10, koniec: '2026-10-31', opis: '-10% na całe zamówienie' },
  WLOSY15: { procent: 15, kategoria: 'Włosy', opis: '-15% na produkty z kategorii Włosy' },
  KLAUDIUSZ: { procent: 100, opis: 'rabat 100% pewności. Jestem pewien, że to działa' },
};

export const normalizujKod = (kod) => String(kod ?? '').trim().toUpperCase();

// Sprawdza kod dla pozycji koszyka. Wynik: { ok, komunikat, procent, kategoria }.
// dzis: data RRRR-MM-DD, domyślnie dzisiejsza.
export const ocenKod = usluga('ocenKod', function ocenKod(kod, pozycje, dzis = dzisiaj()) {
  const k = normalizujKod(kod);
  if (!k) return { ok: false, komunikat: 'Wpisz kod rabatowy.' };
  const def = KODY[k];
  if (!def) return { ok: false, komunikat: `Nie ma takiego kodu rabatowego: ${k}` };
  if (def.koniec && dzis > def.koniec) return { ok: false, komunikat: `Kod ${k} wygasł ${dataPl(def.koniec)}.` };
  if (def.kategoria && !pozycje.some((p) => p.category === def.kategoria)) {
    return { ok: false, komunikat: `Kod ${k} działa tylko na produkty z kategorii ${def.kategoria}. W koszyku nie ma takich produktów.` };
  }
  return { ok: true, kod: k, procent: def.procent, kategoria: def.kategoria ?? null, komunikat: `Kod ${k} przyjęty: ${def.opis}.` };
});

// ---------- Baner z odliczaniem ----------
// Odmiana: 1 dzień, 2–4 dni („zostały”), 5+ dni („zostało”); 12–14 jak 5+.
function ileDni(n) {
  if (n === 1) return 'został 1 dzień';
  const reszta10 = n % 10;
  const reszta100 = n % 100;
  if (reszta10 >= 2 && reszta10 <= 4 && !(reszta100 >= 12 && reszta100 <= 14)) return `zostały ${n} dni`;
  return `zostało ${n} dni`;
}

// Tekst banera dla daty RRRR-MM-DD (domyślnie dzisiaj).
export function banerTekst(dzis = dzisiaj()) {
  const dni = dniDo(START_PROMOCJI, dzis);
  if (dni > 0) return `Czarny Piątek w Namssorze startuje ${dataPl(START_PROMOCJI)}. Do startu promocji ${ileDni(dni)}.`;
  if (dni === 0) return 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.';
  return 'Bożena: przesuwamy na poniedziałek.';
}

export function banerHtml() {
  return `<p class="baner" data-testid="countdown">${escapeHtml(banerTekst())}</p>`;
}
