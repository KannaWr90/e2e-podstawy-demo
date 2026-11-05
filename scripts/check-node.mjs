// Sprawdza wersję Node przed instalacją. Aplikacja używa wbudowanego modułu
// node:sqlite, który działa bez dodatkowych flag od Node 22.13.
const REQUIRED = [22, 13];
const [major, minor] = process.versions.node.split('.').map(Number);
const ok = major > REQUIRED[0] || (major === REQUIRED[0] && minor >= REQUIRED[1]);

if (!ok) {
  console.error(
    `\nZa stara wersja Node: ${process.versions.node}. Repo wymaga Node >= ${REQUIRED.join('.')}.\n` +
      'Zainstaluj Node LTS (https://nodejs.org) albo poproś dział IT o aktualizację.\n',
  );
  process.exit(1);
}
console.log(`Node ${process.versions.node}: OK (wymagane >= ${REQUIRED.join('.')}).`);
