// Zarvan Calendar - build (node, for whoever already has it)
//
//   node build/build.mjs
//
// Equivalent to build.ps1 / build.sh. Node is a convenience here, never a requirement.
//
// Two stages:
//   1. Concatenate the parts listed in build/manifest-{css,js}.txt into src/css/zarvan.css and
//      src/js/zarvan.js. These are the "assembled sources".
//   2. Assemble dist/ - the folder a consumer actually copies. See build/banner-dist.txt.
//
// The version in package.json is substituted for __ZARVAN_VERSION__ wherever it appears, so
// Zarvan.version reports the build it came from.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const write = (p, text) => writeFileSync(join(root, p), text);

const VERSION = JSON.parse(read('package.json')).version;
const stamp = (text) => text.split('__ZARVAN_VERSION__').join(VERSION);

const parts = (manifest) =>
  read(manifest)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

let failed = false;

// ---------------------------------------------------------------- 1. assembled sources
const TARGETS = [
  { manifest: 'build/manifest-css.txt', banner: 'build/banner.txt',    srcDir: 'src/css', out: 'src/css/zarvan.css' },
  { manifest: 'build/manifest-js.txt',  banner: 'build/banner-js.txt', srcDir: 'src/js',  out: 'src/js/zarvan.js'   },
];

for (const t of TARGETS) {
  const list = parts(t.manifest);

  const missing = list.filter((p) => !existsSync(join(root, t.srcDir, p)));
  if (missing.length) {
    console.error(`${t.manifest} lists missing file(s):\n  ` + missing.join('\n  '));
    failed = true;
    continue;
  }

  const out =
    [read(t.banner).trimEnd()].concat(list.map((p) => read(join(t.srcDir, p)).trimEnd())).join('\n\n') + '\n';

  write(t.out, stamp(out));
  console.log(`built ${t.out}  (${list.length} parts, ${out.split('\n').length} lines)`);
}

if (failed) process.exit(1);

// ---------------------------------------------------------------- 2. dist
/* jalaali.js goes first and inside the same file. It is the library's one hard dependency, it is 1.5 KB
   gzipped, and keeping it separate bought nothing except a second script tag that had to come first. */
mkdirSync(join(root, 'dist/fonts'), { recursive: true });

write(
  'dist/zarvan.js',
  stamp([read('build/banner-dist.txt').trimEnd(), read('src/libs/jalaali.js').trimEnd(), read('src/js/zarvan.js').trimEnd()].join('\n\n')) + '\n'
);

write('dist/zarvan.css', read('src/css/zarvan.css'));
write('dist/zarvan.d.ts', stamp(read('src/zarvan.d.ts')));

// The theme's font URL is relative to the stylesheet, and in dist/ the fonts sit one level down.
write('dist/zarvan-theme-fa.css', read('src/css/zarvan-theme-fa.css').split('../../fonts/').join('./fonts/'));
copyFileSync(join(root, 'fonts/Vazir-FD-WOL.ttf'), join(root, 'dist/fonts/Vazir-FD-WOL.ttf'));

const kb = (p) => (readFileSync(join(root, p)).length / 1024).toFixed(1) + ' KB';
console.log(`built dist/  v${VERSION}`);
for (const f of ['dist/zarvan.js', 'dist/zarvan.css', 'dist/zarvan.d.ts', 'dist/zarvan-theme-fa.css']) {
  console.log(`  ${f.padEnd(26)} ${kb(f)}`);
}
