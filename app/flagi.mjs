// Flagi niespodzianek (gra „polowanie na błędy”, tablica wyników: app/tablica.mjs).
// Każda z 6 niespodzianek po znalezieniu pokazuje kod flagi, np. FLAGA-7K2QM.
// Kod = HMAC-SHA256(NAMSSOR_FLAGA_SEKRET, identyfikator niespodzianki), skrócony do 5 znaków.
// Bez sekretu aplikacja pokazuje FLAGA-LOKALNA, a takiej flagi nie da się zgłosić.
// Wartości flag nie są zapisane nigdzie w repo: zależą tylko od sekretu na serwerze.
import crypto from 'node:crypto';

// Numery niespodzianek 1–6 (opis tylko w kluczu trenera).
export const NIESPODZIANKI = [1, 2, 3, 4, 5, 6];

const ZNAKI = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 znaki bez 0/O i 1/I
export const FLAGA_LOKALNA = 'FLAGA-LOKALNA';

const sekret = () => (process.env.NAMSSOR_FLAGA_SEKRET ?? '').trim();

export function flaga(nr) {
  const s = sekret();
  if (!s) return FLAGA_LOKALNA;
  const skrot = crypto.createHmac('sha256', s).update(`namssor-niespodzianka-${nr}`).digest();
  let kod = '';
  for (let i = 0; i < 5; i++) kod += ZNAKI[skrot[i] % 32];
  return `FLAGA-${kod}`;
}

// Tekst wpisany przez uczestnika → numer niespodzianki albo null.
// Wielkość liter, spacje i brak przedrostka „FLAGA-” nie mają znaczenia.
export function rozpoznajFlage(tekst) {
  if (!sekret()) return null;
  const t = String(tekst ?? '').toUpperCase().replace(/\s+/g, '');
  const kod = t.startsWith('FLAGA-') ? t : `FLAGA-${t}`;
  for (const nr of NIESPODZIANKI) {
    const wzor = Buffer.from(flaga(nr));
    const podany = Buffer.from(kod);
    if (wzor.length === podany.length && crypto.timingSafeEqual(wzor, podany)) return nr;
  }
  return null;
}

// Fragment HTML z flagą (osobny element, żeby nie zmieniać tekstów sprawdzanych w testach).
export const flagaHtml = (nr) => `<p class="flaga" data-testid="egg-flag">Flaga: <strong>${flaga(nr)}</strong></p>`;
