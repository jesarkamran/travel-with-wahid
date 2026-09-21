// Content sync: Google Sheet -> data/content.xlsx -> data/site.json
//
//   node scripts/content.mjs           pull the sheet if CONTENT_SHEET_URL is
//                                      set, then sync xlsx -> json
//   node scripts/content.mjs --local   skip the download, use the local file
//   node scripts/content.mjs --export  write the workbook from the json
//   node scripts/content.mjs --force   sync regardless of timestamps
//
// The app only ever reads data/site.json (see data/site.js). Two ways in:
//
//   · Edit the Google Sheet. Set CONTENT_SHEET_URL and every build downloads it
//     first, so a price or a date changed on Drive is live on the next deploy.
//     Nothing reaches the site until it is rebuilt — this is a static export,
//     so the HTML is written once and then served as files.
//   · Edit data/content.xlsx in Excel and commit it. Same result, no network.
//
// A failed download is never fatal: it warns and falls back to the committed
// workbook, because a build that dies when Drive is slow is worse than a build
// carrying yesterday's prices.
import fs from 'node:fs';
const { readFileSync, writeFileSync, statSync, existsSync } = fs;
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs); // the ESM build does not pull in node:fs itself

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const XLS = join(dir, 'content.xlsx');
const JSN = join(dir, 'site.json');

/* This runs as a plain node script, not through Next, so nothing has loaded
   .env for it. Read it here — without overwriting anything the environment
   already set, which is what lets Vercel's own variables win on a real build. */
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const file = join(dir, '..', name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      if (process.env[key] !== undefined) continue;
      process.env[key] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

/* Google hands any viewer an .xlsx of a sheet through this path, so the sheet
   needs to be shared "anyone with the link can view" and nothing more — no key,
   no service account, nothing that could leak in a build log. */
/* Only CONTENT_SHEET_URL turns this on, and deliberately not the link that
   happens to be lying around in .env. Pulling makes Drive the source of truth,
   and the first pull silently overwrites whatever is in the committed
   workbook — so switching it on has to be a decision, taken once the sheet on
   Drive is known to be the better copy. */
const SHEET = process.env.CONTENT_SHEET_URL || '';

async function pull() {
  const id = (String(SHEET).match(/spreadsheets[/]d[/]([A-Za-z0-9_-]+)/) || [])[1];
  if (!id) return false;
  try {
    const res = await fetch('https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx', { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    // an .xlsx is a zip; anything else is Google handing back a sign-in page
    if (buf.length < 1000 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
      throw new Error('that is not a workbook — is the sheet shared with "anyone with the link"?');
    }
    writeFileSync(XLS, buf);
    console.log('content: pulled the sheet (' + (buf.length / 1024).toFixed(0) + ' KB)');
    return true;
  } catch (err) {
    console.warn('content: could not pull the sheet (' + err.message + ') — using the committed workbook');
    return false;
  }
}

// Fields holding a list. One cell, entries separated by " | ".
const LIST = new Set(['includes', 'stops', 'excludes', 'does']);
const split = (v) => String(v ?? '').split('|').map((s) => s.trim()).filter(Boolean);

// Sheets that are a child table of `tours`, keyed by the tour's slug.
const CHILD = { profile: 'profile', itinerary: 'itinerary' };

const rows = (wb, name) =>
  wb.Sheets[name] ? XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' }) : [];

const clean = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, LIST.has(k) ? split(v) : v === '' ? null : v]),
  );

const flat = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, Array.isArray(v) ? v.join(' | ') : v ?? '']),
  );

function toJson(wb = XLSX.readFile(XLS)) {
  const kv = Object.fromEntries(rows(wb, 'site').map((r) => [r.key, r.value]));
  const pick = (p) =>
    Object.fromEntries(
      Object.entries(kv).filter(([k]) => k.startsWith(p)).map(([k, v]) => [k.slice(p.length), v]),
    );

  const children = Object.fromEntries(
    Object.keys(CHILD).map((s) => [s, rows(wb, s).map(clean)]),
  );

  const tours = rows(wb, 'tours').map(clean).map((t) => ({
    ...t,
    ...Object.fromEntries(
      Object.keys(CHILD).map((s) => [
        s,
        children[s].filter((r) => r.slug === t.slug).map(({ slug, ...rest }) => rest),
      ]),
    ),
  }));

  return {
    site: pick('site.'),
    nextDeparture: pick('nextDeparture.'),
    tours,
    steps: rows(wb, 'steps').map(clean),
    destinations: rows(wb, 'destinations').map(clean),
    gallery: rows(wb, 'gallery').map(clean),
    faqs: rows(wb, 'faqs').map(clean),
    reviews: rows(wb, 'reviews').map(clean),
    credits: rows(wb, 'credits').map(clean),
  };
}

function toXlsx(d = JSON.parse(readFileSync(JSN, 'utf8'))) {
  const wb = XLSX.utils.book_new();
  const add = (name, list) =>
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(list.map(flat)), name);

  add('site', [
    ...Object.entries(d.site).map(([key, value]) => ({ key: `site.${key}`, value })),
    ...Object.entries(d.nextDeparture).map(([key, value]) => ({ key: `nextDeparture.${key}`, value })),
  ]);
  add('tours', d.tours.map(({ profile, itinerary, ...rest }) => rest));
  for (const s of Object.keys(CHILD))
    add(s, d.tours.flatMap((t) => (t[s] ?? []).map((r) => ({ slug: t.slug, ...r }))));
  for (const s of ['steps', 'destinations', 'gallery', 'faqs', 'reviews', 'credits']) add(s, d[s]);

  return wb;
}

const mtime = (f) => { try { return statSync(f).mtimeMs; } catch { return 0; } };

if (process.argv.includes('--check')) {
  // json -> workbook -> json must come back unchanged, key order and blank
  // cells aside. The only thing standing between a bad edit here and silently
  // wrong content on the site.
  const { deepStrictEqual } = await import('node:assert/strict');
  const tidy = (o) =>
    Array.isArray(o) ? o.map(tidy)
    : o && typeof o === 'object'
      ? Object.fromEntries(Object.keys(o).sort().filter((k) => o[k] != null).map((k) => [k, tidy(o[k])]))
      : o;
  const before = JSON.parse(readFileSync(JSN, 'utf8'));
  const wb = XLSX.read(XLSX.write(toXlsx(before), { type: 'buffer', bookType: 'xlsx' }));
  deepStrictEqual(tidy(toJson(wb)), tidy(before));
  console.log('content: round-trip ok');
} else if (process.argv.includes('--export')) {
  XLSX.writeFile(toXlsx(), XLS);
  console.log(`content: wrote ${XLS}`);
}
else {
  // a fresh download is always newer than the json, so it always rebuilds
  const pulled = SHEET && !process.argv.includes('--local') ? await pull() : false;

  if (!mtime(XLS)) console.log('content: no workbook, using data/site.json as is');
  else if (pulled || mtime(XLS) > mtime(JSN) || process.argv.includes('--force')) {
    writeFileSync(JSN, JSON.stringify(toJson(), null, 2) + '\n');
    console.log('content: rebuilt data/site.json');
  } else console.log('content: data/site.json is current');
}
