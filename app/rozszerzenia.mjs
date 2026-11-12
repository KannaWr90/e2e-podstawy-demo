// Punkt rozszerzenia aplikacji. Moduł wydania (ładowany w server.mjs) może:
//   - opakować dowolną funkcję logiki zarejestrowaną przez usluga(),
//   - dodać warstwę HTTP wywoływaną przed każdą trasą.
// Bez modułu wydania wszystko działa bez zmian.

const opakowania = {};
const warstwy = [];

// usluga('nazwa', fn): funkcja logiki, którą moduł wydania może opakować.
export function usluga(nazwa, fn) {
  return (...argumenty) => (opakowania[nazwa] ? opakowania[nazwa](fn, ...argumenty) : fn(...argumenty));
}

// Interfejs dla modułu wydania.
export const rozszerzenia = {
  opakuj(nazwa, opakowanie) {
    opakowania[nazwa] = opakowanie;
  },
  warstwa(fn) {
    warstwy.push(fn);
  },
};

// Wywołuje warstwy HTTP; true = któraś już odpowiedziała.
export async function uruchomWarstwy(ctx, h) {
  for (const w of warstwy) if (await w(ctx, h)) return true;
  return false;
}
