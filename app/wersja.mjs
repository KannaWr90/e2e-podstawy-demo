// Wersja aplikacji i „dzisiejsza” data.
//   APP_VERSION     pusta (domyślnie) albo nazwa wydania, np. hotfix
//   NAMSSOR_TERAZ   data, którą aplikacja uznaje za dzisiejszą, np. 2026-11-28.
//                   Bez niej liczy się prawdziwa data z zegara komputera.
// Daty i godziny liczymy w strefie Europe/Warsaw, niezależnie od ustawień serwera.

const STREFA = 'Europe/Warsaw';
let biezaca = (process.env.APP_VERSION ?? '').trim().toLowerCase();

export const wersja = () => biezaca;
export const hotfix = () => biezaca === 'hotfix';

// Zmiana wersji w działającej aplikacji (endpoint trenera).
export function ustawWersje(nowa) {
  biezaca = nowa;
}

// Etykiety, które zmienia wydanie „hotfix”.
export const tekstWersji = (zwykly, poHotfixie) => (hotfix() ? poHotfixie : zwykly);

// Tekst daty (RRRR-MM-DD albo pełny czas ISO) → Date. Sama data = południe w Polsce. null = błędna data.
export function czytajDate(tekst) {
  const t = String(tekst ?? '').trim();
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(t) ? `${t}T11:00:00Z` : t);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function teraz() {
  const ustawione = (process.env.NAMSSOR_TERAZ ?? '').trim();
  if (!ustawione) return new Date();
  const d = czytajDate(ustawione);
  if (!d) {
    console.error(`NAMSSOR_TERAZ="${ustawione}" nie jest datą (oczekiwany format: 2026-11-28). Używam dzisiejszej daty.`);
    return new Date();
  }
  return d;
}

// Data i czas w Polsce: { data: 'RRRR-MM-DD', czas: 'GG:MM' }.
function wPolsce(d) {
  const czesci = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: STREFA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  return { data: `${czesci.year}-${czesci.month}-${czesci.day}`, czas: `${czesci.hour}:${czesci.minute}` };
}

// Dzisiejsza data jako tekst RRRR-MM-DD (w Polsce).
export const dzisiaj = () => wPolsce(teraz()).data;

// Data i godzina do zapisu zamówienia: RRRR-MM-DD GG:MM (w Polsce).
export function czasTeraz() {
  const { data, czas } = wPolsce(teraz());
  return `${data} ${czas}`;
}

// Data dowolnego Date jako RRRR-MM-DD w Polsce.
export const dataWPolsce = (d) => wPolsce(d).data;

// Liczba dni kalendarzowych od dnia `od` (domyślnie dziś) do daty RRRR-MM-DD (ujemna, gdy data minęła).
export function dniDo(dataIso, od = dzisiaj()) {
  const doDnia = (s) => {
    const [r, m, d] = s.split('-').map(Number);
    return Date.UTC(r, m - 1, d);
  };
  return Math.round((doDnia(dataIso) - doDnia(od)) / 86_400_000);
}

// Data RRRR-MM-DD w zapisie polskim: 27.11.2026
export const dataPl = (dataIso) => dataIso.split('-').reverse().join('.');
