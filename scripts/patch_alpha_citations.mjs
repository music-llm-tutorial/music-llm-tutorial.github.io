#!/usr/bin/env node
/**
 * Patch MyST build output to use BibTeX-style alpha citation labels (e.g. [CLZ+23]).
 *
 * MyST book-theme SSR embeds page mdast in HTML (__remixContext). Patching only
 * the companion .json files is not enough — this script updates:
 *   - _build/html/*.json
 *   - _build/site/content/*.json
 *   - _build/html page index.html files (embedded loaderData)
 *
 * In-text cites are forced to bracket form: [BDD+19]
 * Bibliography enumerators become the same alpha labels.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BOOK = path.join(ROOT, 'book');
const BIB = path.join(BOOK, 'references.bib');
const BUILD_HTML = path.join(ROOT, '_build', 'html');
const BUILD_SITE = path.join(ROOT, '_build', 'site', 'content');

function parseAuthors(authorField) {
  if (!authorField) return [];
  return authorField
    .split(/\s+and\s+/i)
    .map((name) => name.trim().split(',')[0]?.trim())
    .filter(Boolean);
}

function parseBibEntries(content) {
  const entries = [];
  const entryRe = /@\w+\s*\{\s*([^,\s]+)\s*,([\s\S]*?)\n\}/g;
  let match;
  while ((match = entryRe.exec(content)) !== null) {
    const key = match[1];
    const body = match[2];
    const author = body.match(/author\s*=\s*\{([^}]*)\}/i)?.[1];
    const year = body.match(/year\s*=\s*\{?(\d{4})\}?/i)?.[1];
    entries.push({ key, authors: parseAuthors(author), year });
  }
  return entries;
}

function baseAlphaLabel(authors, year) {
  let label = '';
  for (let i = 0; i < Math.min(3, authors.length); i += 1) {
    label += authors[i].charAt(0).toUpperCase();
  }
  if (authors.length > 3) label += '+';
  if (year) label += String(year).slice(-2);
  return label;
}

function buildAlphaLabelMap(entries) {
  const used = new Map();
  const labels = new Map();

  for (const entry of entries) {
    const base = baseAlphaLabel(entry.authors, entry.year);
    let label = base;
    let suffix = 0;
    while (used.has(label)) {
      suffix += 1;
      label = `${base}${String.fromCharCode('a'.charCodeAt(0) + suffix - 1)}`;
    }
    used.set(label, entry.key);
    labels.set(entry.key, label);
  }

  return labels;
}

function walk(node, visit) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((child) => walk(child, visit));
    return;
  }
  if (typeof node === 'object') {
    visit(node);
    Object.values(node).forEach((value) => walk(value, visit));
  }
}

function patchCiteTree(page, labelMap) {
  let changed = false;

  walk(page.mdast, (node) => {
    if (node.type !== 'cite' || !node.label || node.error) return;
    const alpha = labelMap.get(node.label);
    if (!alpha) return;

    // book-theme with numbered_references renders parenthetical cites as
    // bare `enumerator` (ignores children), so brackets must live here.
    node.enumerator = `[${alpha}]`;
    node.kind = 'parenthetical';
    node.children = [{ type: 'text', value: `[${alpha}]` }];
    changed = true;
  });

  const citeData = page.references?.cite?.data;
  if (citeData) {
    for (const [key, entry] of Object.entries(citeData)) {
      const alpha = labelMap.get(key);
      if (!alpha) continue;

      if (entry.enumerator !== alpha) {
        entry.enumerator = alpha;
        changed = true;
      }
      const prefix = `[${alpha}] `;
      if (typeof entry.html === 'string' && !entry.html.startsWith(`[${alpha}]`)) {
        // Strip a previous alpha prefix if present, then add the current one.
        entry.html = `${prefix}${entry.html.replace(/^\[[^\]]+\]\s*/, '')}`;
        changed = true;
      }
    }
  }

  return changed;
}

function collectJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json') && !name.startsWith('myst.') && name !== 'config.json')
    .map((name) => path.join(dir, name));
}

function patchJsonFile(jsonPath, labelMap) {
  const page = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!page.mdast && !page.references) return false;
  const changed = patchCiteTree(page, labelMap);
  if (changed) {
    fs.writeFileSync(jsonPath, `${JSON.stringify(page)}\n`);
  }
  return changed;
}

function collectHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'build' || entry.name === 'assets') continue;
      out.push(...collectHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

/**
 * Patch cite nodes embedded in Remix SSR payload inside index.html.
 * Prefer rewriting the JSON blob; also fix visible SSR <cite> text as a fallback.
 */
function patchHtmlFile(htmlPath, labelMap) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const marker = 'window.__remixContext = ';
  const start = html.indexOf(marker);
  if (start === -1) return false;

  const jsonStart = start + marker.length;
  // Object ends at `;</script>` that closes the remix context assignment.
  const endMarker = ';</script>';
  const jsonEnd = html.indexOf(endMarker, jsonStart);
  if (jsonEnd === -1) return false;

  let context;
  try {
    context = JSON.parse(html.slice(jsonStart, jsonEnd));
  } catch {
    return false;
  }

  let changed = false;
  const page = context?.state?.loaderData?.['routes/$']?.page;
  if (page && patchCiteTree(page, labelMap)) {
    changed = true;
  }

  if (!changed) return false;

  let next = `${html.slice(0, jsonStart)}${JSON.stringify(context)}${html.slice(jsonEnd)}`;

  // Keep pre-hydration SSR markup in sync: Author (Year) -> [ALPHA]
  // Match <cite ...><span class="hover-link">...</span></cite>
  next = next.replace(
    /<cite([^>]*)><span class="hover-link">([\s\S]*?)<\/span><\/cite>/g,
    (full, attrs, inner) => {
      // Try to recover label from nearby id in bibliography is hard; instead
      // leave SSR text if we cannot map. Better: rewrite using alpha from
      // patched mdast by sequential cite order — handled below.
      return full;
    },
  );

  // Rewrite SSR cite spans in document order using patched mdast cite list.
  const cites = [];
  walk(page.mdast, (node) => {
    if (node.type === 'cite' && node.label && !node.error) cites.push(node);
  });
  let citeIdx = 0;
  next = next.replace(
    /<cite([^>]*)><span class="hover-link">([\s\S]*?)<\/span><\/cite>/g,
    (full, attrs) => {
      const cite = cites[citeIdx];
      citeIdx += 1;
      if (!cite) return full;
      const alpha = labelMap.get(cite.label) || cite.enumerator;
      if (!alpha) return full;
      return `<cite${attrs}><span class="hover-link">[${alpha}]</span></cite>`;
    },
  );

  // Bibliography list: numbered <ol><li> -> label prefix from cite data order
  const order = page.references?.cite?.order || [];
  const data = page.references?.cite?.data || {};
  if (order.length) {
    let liIdx = 0;
    next = next.replace(
      /(<li class="myst-bibliography-item break-words"[^>]*>)([\s\S]*?)(<\/li>)/g,
      (full, open, body, close) => {
        const key = order[liIdx];
        liIdx += 1;
        if (!key || !data[key]) return full;
        const alpha = labelMap.get(key) || data[key].enumerator;
        const stripped = body.replace(/^\[[^\]]+\]\s*/, '');
        return `${open}[${alpha}] ${stripped}${close}`;
      },
    );
  }

  fs.writeFileSync(htmlPath, next);
  return true;
}

function main() {
  if (!fs.existsSync(BIB)) {
    console.error(`Bibliography not found: ${BIB}`);
    process.exit(1);
  }
  if (!fs.existsSync(BUILD_HTML)) {
    console.error(`Build output not found: ${BUILD_HTML}. Run "myst build" first.`);
    process.exit(1);
  }

  const labelMap = buildAlphaLabelMap(parseBibEntries(fs.readFileSync(BIB, 'utf8')));

  let patchedJson = 0;
  for (const jsonPath of [...collectJsonFiles(BUILD_HTML), ...collectJsonFiles(BUILD_SITE)]) {
    if (patchJsonFile(jsonPath, labelMap)) patchedJson += 1;
  }

  let patchedHtml = 0;
  for (const htmlPath of collectHtmlFiles(BUILD_HTML)) {
    if (patchHtmlFile(htmlPath, labelMap)) patchedHtml += 1;
  }

  console.log(
    `Patched alpha citation labels in ${patchedJson} JSON page(s) and ${patchedHtml} HTML page(s).`,
  );
}

main();
