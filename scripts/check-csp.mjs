#!/usr/bin/env node
// Verifies that index.html's Content-Security-Policy matches its inline <script>/<style> blocks.
// Zero dependencies, so CI can run it before every deploy:  node scripts/check-csp.mjs
// If you edit any inline script or style, run `npm run build` to refresh the hashes.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const INDEX_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');

const sha256 = text => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

// Text content of every inline <script> (no src) and <style> element, exactly as the browser hashes it
export function inlineBlocks(html) {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  return { scripts, styles };
}

export function buildPolicy(html) {
  const { scripts, styles } = inlineBlocks(html);
  return [
    "default-src 'none'",
    `script-src ${scripts.map(sha256).join(' ')}`,
    `style-src ${[...styles.map(sha256), 'https://fonts.googleapis.com'].join(' ')}`,
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data:",
    "base-uri 'none'",
    "form-action 'none'"
  ].join('; ');
}

export const CSP_META_RE = /<meta http-equiv="Content-Security-Policy" content="([^"]*)" \/>/;

function main() {
  const html = readFileSync(INDEX_PATH, 'utf8');
  const meta = html.match(CSP_META_RE);
  if (!meta) {
    console.error('✗ No Content-Security-Policy <meta> tag found in index.html');
    process.exit(1);
  }
  if (/<script[^>]*\bsrc=/i.test(html)) {
    console.error('✗ index.html loads an external <script>. Keep the app self-contained (no runtime CDNs).');
    process.exit(1);
  }
  const expected = buildPolicy(html);
  if (meta[1] !== expected) {
    console.error('✗ CSP hashes are stale. Run `npm run build` to refresh them.');
    console.error(`  in file:  ${meta[1]}`);
    console.error(`  expected: ${expected}`);
    process.exit(1);
  }
  console.log('✓ CSP matches every inline script and style block');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
