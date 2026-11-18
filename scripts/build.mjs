#!/usr/bin/env node
// Rebuilds the inlined Tailwind CSS in index.html, then refreshes the CSP hashes.
//   npm install && npm run build
// Run it after changing any Tailwind class, inline script or inline style.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { INDEX_PATH, CSP_META_RE, buildPolicy } from './check-csp.mjs';

const START = '/*! tailwind:start */';
const END = '/*! tailwind:end */';

// Project theme: the colors and fonts the app's utility classes refer to
const THEME_CSS = `@import "tailwindcss";
@theme {
  --color-obsidian: #070A10;
  --color-slatepanel: #0F141F;
  --color-slatecard: #161F30;
  --color-slateborder: #1E293B;
  --color-cyanaccent: #00F0FF;
  --color-indigoaccent: #6366F1;
  --color-emeraldguard: #10B981;
  --color-amberwarn: #F59E0B;
  --color-crimsonbreach: #F43F5E;
  --font-display: "Space Grotesk", sans-serif;
  --font-sans: Inter, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --blur-sm: 4px; /* keep Tailwind v3's backdrop-blur-sm */
}`;

async function loadTailwind() {
  // TAILWIND_DIR lets you point at a global install; otherwise use ./node_modules
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const pkgDir = process.env.TAILWIND_DIR || path.dirname(require.resolve('tailwindcss/package.json'));
  const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  if (!pkg.version.startsWith('4.')) throw new Error(`Need tailwindcss v4, found ${pkg.version}`);
  const entry = pkg.exports?.['.']?.import ?? pkg.exports?.['.']?.default ?? 'dist/lib.mjs';
  const mod = await import(pathToFileURL(path.join(pkgDir, typeof entry === 'string' ? entry : entry.default)).href);
  return { compile: mod.compile, pkgDir, version: pkg.version };
}

const html = readFileSync(INDEX_PATH, 'utf8');
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a < 0 || b < a) throw new Error('Tailwind markers not found in index.html');

// Every token in the page (minus the generated CSS) is a candidate; Tailwind ignores non-classes
const source = html.slice(0, a) + html.slice(b);
const candidates = [...new Set(source.split(/[\s"'`<>=]+|\$\{|\}/).filter(Boolean))];

const { compile, pkgDir, version } = await loadTailwind();
const compiler = await compile(THEME_CSS, {
  base: pkgDir,
  async loadStylesheet(id, base) {
    const file = id === 'tailwindcss'
      ? path.join(pkgDir, 'index.css')
      : id.startsWith('tailwindcss/')
        ? path.join(pkgDir, id.slice('tailwindcss/'.length))
        : path.resolve(base, id);
    return { content: readFileSync(file, 'utf8'), base: path.dirname(file), path: file };
  }
});
const css = compiler.build(candidates).trim();

let out = `${html.slice(0, a)}${START}\n/* Tailwind CSS v${version} | MIT License | https://tailwindcss.com */\n${css}\n${html.slice(b)}`;
out = out.replace(CSP_META_RE, `<meta http-equiv="Content-Security-Policy" content="${buildPolicy(out)}" />`);
writeFileSync(INDEX_PATH, out);
console.log(`✓ Inlined ${(css.length / 1024).toFixed(1)} KB of Tailwind v${version} CSS and refreshed CSP hashes`);
