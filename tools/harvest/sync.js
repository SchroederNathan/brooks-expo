/**
 * Copies the catalog snapshot and the shared data layer from packages/catalog
 * into each app.
 *
 * @ref LLP 0002#sharing-boundary — Copying rather than symlinking or workspace-
 * linking is deliberate. Metro (Expo) and Vite (Exact) both resolve outside the
 * project root only with extra configuration, and a demo that fails to bundle on
 * a strange machine is worth far less than a duplicated file.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'packages', 'catalog');

const TARGETS = [
  {
    name: 'expo',
    dir: path.join(ROOT, 'apps', 'expo'),
    data: path.join(ROOT, 'apps', 'expo', 'assets'),
    lib: path.join(ROOT, 'apps', 'expo', 'src', 'data'),
    libFiles: ['types.ts', 'query.ts', 'images.ts', 'constructor.ts'],
  },
  {
    // The Exact app bundles the snapshot as a typed import (LLP 0004: the
    // most-proven data path in the Exact repo) rather than fetching it.
    name: 'exact',
    dir: path.join(ROOT, 'apps', 'exact'),
    data: path.join(ROOT, 'apps', 'exact', 'src', 'data'),
    lib: null,
    libFiles: [],
  },
];

const catalog = path.join(SRC, 'catalog.json');
if (!fs.existsSync(catalog)) {
  console.error('No catalog.json. Run `npm run harvest` first.');
  process.exit(1);
}

for (const t of TARGETS) {
  if (!fs.existsSync(t.dir)) {
    console.log(`- ${t.name}: not scaffolded yet, skipping`);
    continue;
  }
  fs.mkdirSync(t.data, { recursive: true });
  fs.copyFileSync(catalog, path.join(t.data, 'catalog.json'));
  console.log(`✓ ${t.name}: catalog.json -> ${path.relative(ROOT, t.data)}`);

  if (t.lib) {
    fs.mkdirSync(t.lib, { recursive: true });
    for (const f of t.libFiles) {
      fs.copyFileSync(path.join(SRC, f), path.join(t.lib, f));
    }
    console.log(`✓ ${t.name}: ${t.libFiles.join(', ')} -> ${path.relative(ROOT, t.lib)}`);
  }
}
