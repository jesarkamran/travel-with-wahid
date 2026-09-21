// Content sync: data/content.xlsx  <->  data/site.json
//
//   node scripts/content.mjs           sync xlsx -> json, but only if the
//                                      workbook is newer than the json
//   node scripts/content.mjs --export  write the workbook from the json
//   node scripts/content.mjs --force   sync regardless of timestamps
//
// The app only ever reads data/site.json (see data/site.js). Edit the workbook
// in Excel, run `npm run dev` or `npm run build`, and the json is rebuilt.
import fs from 'node:fs';
const { readFileSync, writeFileSync, statSync } = fs;
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs); // the ESM build does not pull in node:fs itself

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const XLS = join(dir, 'content.xlsx');
const JSN = join(dir, 'site.json');

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
else if (!mtime(XLS)) console.log('content: no workbook, using data/site.json as is');
else if (mtime(XLS) > mtime(JSN) || process.argv.includes('--force')) {
  writeFileSync(JSN, JSON.stringify(toJson(), null, 2) + '\n');
  console.log('content: workbook is newer — rebuilt data/site.json');
} else console.log('content: data/site.json is current');
