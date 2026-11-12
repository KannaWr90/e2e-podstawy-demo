// Przywraca bazę do stanu startowego: usuwa plik bazy i tworzy go od nowa z danymi demo.
// Działa tylko przy zatrzymanej aplikacji (działająca aplikacja trzyma otwarty stary plik).
import fs from 'node:fs';
import { dbPath, openDb, ensureSchema } from '../app/db.mjs';

const PORT = Number(process.env.PORT || process.env.APP_PORT || 4100);

async function aplikacjaDziala() {
  try {
    const r = await fetch(`http://localhost:${PORT}/health`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch {
    return false;
  }
}

if (await aplikacjaDziala()) {
  console.error(`\nAplikacja działa na http://localhost:${PORT}. Najpierw ją zatrzymaj:`);
  console.error('  w oknie terminala z `npm start` naciśnij Ctrl+C,');
  console.error('  potem uruchom ponownie: npm run db:reset\n');
  process.exit(1);
}

const plik = dbPath();
try {
  for (const koncowka of ['', '-journal', '-wal', '-shm']) fs.rmSync(plik + koncowka, { force: true });
} catch (e) {
  if (e.code === 'EBUSY' || e.code === 'EPERM') {
    console.error(`\nNie mogę usunąć ${plik}: plik jest używany przez inny program.`);
    console.error('Zamknij aplikację (Ctrl+C w jej oknie) i testy, potem spróbuj ponownie.\n');
    process.exit(1);
  }
  throw e;
}
const db = openDb(plik);
ensureSchema(db);
db.close();
console.log(`Baza odtworzona z danymi startowymi: ${plik}`);
