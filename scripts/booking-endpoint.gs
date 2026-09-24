/**
 * Travel With Wahid — booking endpoint.
 *
 * This is the server the website does not have. The site is a static export,
 * so it cannot take a file upload or hold a Google credential (anything in the
 * page source is public). This runs on Google's side instead: the browser POSTs
 * here, and this appends the rows under an account that is never exposed to
 * the browser. Receipts do not come this way — they go to WhatsApp.
 *
 * SETUP (once)
 *  1. Upload data/booking/people.xlsx and data/booking/bookings.xlsx to Drive,
 *     open each, and File ▸ Save as Google Sheets. Apps Script cannot write a
 *     raw .xlsx — it needs native Sheets. Keep or bin the .xlsx copies.
 *
 *     Bookings are filed one tab per trip, named after the trip's slug, and a
 *     tab appears by itself the first time someone books that trip. The first
 *     tab in the workbook is the header template — leave it in place. Custom
 *     trip requests get a tab of their own, custom-trips, made the same way.
 *  2. script.google.com ▸ New project, paste this file in. The two sheet ids
 *     are already filled in below, read out of .env.
 *  3. Deploy ▸ New deployment ▸ Web app.
 *       Execute as:       Me
 *       Who has access:   Anyone
 *     "Anyone" is what lets a logged-out traveller post; it does not expose the
 *     sheets, because only this script touches them and it only ever appends.
 *  4. Copy the /exec URL into NEXT_PUBLIC_BOOKING_ENDPOINT (see .env.example).
 *     That URL is the endpoint. A spreadsheet URL is the document, not a place
 *     that can receive a POST, so the site ignores one if it finds it there.
 *
 * Re-deploy (Deploy ▸ Manage deployments ▸ edit ▸ Version: New) after any edit,
 * or the old code keeps serving.
 */

const PEOPLE_SHEET_ID = '12wgqmRQs1tpg7SyfTIKe_V2NV2-9UV39sKoMhNAsEMY';
const BOOKINGS_SHEET_ID = '1TVO-JaUDhsYqGT5YVd6Xn6iKukh_0W9wh0-zRkLlfWA';
/** Where a booking notification goes. Blank turns the email off. */
const NOTIFY = '';
/** Custom trip requests land on their own tab in the bookings workbook, made
    on the first request. Its columns share names with a trip tab wherever they
    mean the same thing, so "Check a booking" lists a request with no extra
    code. Status starts at "requested"; Wahid moves it to "approved" (or
    "declined") by hand, and adds the quote in `amount`. */
const CUSTOM_TAB = 'custom-trips';
const CUSTOM_HEADERS = ['ref', 'submittedAt', 'email', 'tripTitle', 'dates', 'seats', 'groupType',
  'budget', 'pickup', 'amount', 'status', 'notes'];
/** The content sheet — data/content.xlsx uploaded to Drive and saved as a
    Google Sheet (File ▸ Save as Google Sheets). Only ?about reads it. */
const CONTENT_SHEET_ID = '';

/* The browser posts form-encoded, not JSON, on purpose: a JSON content-type
   would trigger a CORS preflight, and Apps Script web apps cannot answer one.
   Form encoding is a "simple request", so the POST goes straight through. */
function doPost(e) {
  try {
    const raw = (e && e.parameter && e.parameter.payload) || '';
    if (!raw) return reply({ ok: false, error: 'empty request' });

    const b = JSON.parse(raw);
    if (b.kind === 'custom') return reply(customTrip(b));
    const email = String(b.email || '').trim().toLowerCase();
    const name = String(b.name || '').trim();
    const seats = Math.max(1, Math.min(parseInt(b.seats, 10) || 1, 25));

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return reply({ ok: false, error: 'that email does not look right' });
    if (!name) return reply({ ok: false, error: 'we need a name for the seat' });
    if (!String(b.tripSlug || '').trim()) return reply({ ok: false, error: 'no trip on the booking' });

    // the site generates the reference and shows it to the traveller before
    // this ever runs, so honour theirs — inventing a second one here would
    // mean the number they quote on WhatsApp matches no row in the sheet
    const ref = String(b.ref || '').trim() || makeRef();
    const now = new Date();

    // Already filed? Then this is a retry of a booking that got through, and
    // writing it again would give one traveller two rows and double their count.
    const tab = tripTab(String(b.tripSlug || '').trim());
    if (alreadyFiled(tab, ref)) return reply({ ok: true, ref: ref, duplicate: true, sheet: tab.getName() });

    /* One live booking per person per trip. Per trip, not per person: the
       whole point of the people sheet is that travellers come back, and a
       global block would stop them booking the next departure. A cancelled
       row does not count — that seat was released, so they are free to take
       another. */
    const held = activeBooking(tab, email);
    if (held) {
      return reply({
        ok: false,
        error: 'already-booked',
        ref: held.ref,
        status: held.status,
        sheet: tab.getName()
      });
    }

    appendBooking(tab, {
      ref: ref,
      submittedAt: iso(now),
      email: email,          // the only identity a booking needs
      tripTitle: String(b.tripTitle || '').trim(),
      dates: String(b.dates || '').trim(),
      seats: seats,
      amount: Number(b.amount) || '',
      status: 'pending',
      pickup: String(b.pickup || '').trim(),
      notes: String(b.notes || '').trim()
    });

    upsertPerson({
      email: email,
      name: name,
      phone: String(b.phone || '').trim(),
      city: String(b.city || '').trim(),
      institution: String(b.institution || '').trim(),
      when: ymd(now),
      seats: seats,
      trip: String(b.tripSlug || '').trim()
    });

    if (NOTIFY) {
      MailApp.sendEmail(NOTIFY, 'Booking ' + ref + ' — ' + name,
        [name + ' · ' + seats + ' seat(s)', email, String(b.phone || ''),
         'Trip: ' + tab.getName(), 'Receipt comes by WhatsApp.'].join('\n'));
    }

    return reply({ ok: true, ref: ref, sheet: tab.getName() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/**
 * A custom trip request: a row on the custom-trips tab, status "requested",
 * and the person added to (or updated in) people — the same email key as a
 * seat, so one traveller's requests and bookings sit together.
 *
 * No one-per-person rule here, unlike a seat: someone can ask for Kumrat in
 * October and Chitral in May. A retry is still caught by its ref.
 */
function customTrip(b) {
  const email = String(b.email || '').trim().toLowerCase();
  const name = String(b.name || '').trim();
  const destination = String(b.destination || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return { ok: false, error: 'that email does not look right' };
  if (!name) return { ok: false, error: 'we need a name for the request' };
  if (!destination) return { ok: false, error: 'no destination on the request' };

  const ref = String(b.ref || '').trim() || makeRef();
  const tab = tripTab(CUSTOM_TAB, CUSTOM_HEADERS);
  if (alreadyFiled(tab, ref)) return { ok: true, ref: ref, duplicate: true, sheet: CUSTOM_TAB };

  const seats = Math.max(1, Math.min(parseInt(b.seats, 10) || 1, 200));
  appendBooking(tab, {
    ref: ref,
    submittedAt: iso(new Date()),
    email: email,
    tripTitle: 'Custom trip — ' + destination,
    dates: String(b.dates || '').trim(),
    seats: seats,
    groupType: String(b.groupType || '').trim(),
    budget: Number(b.budget) || '',
    pickup: String(b.pickup || '').trim(),
    status: 'requested',
    notes: String(b.notes || '').trim()
  });

  upsertPerson({
    email: email,
    name: name,
    phone: String(b.phone || '').trim(),
    city: '',
    institution: '',
    when: ymd(new Date()),
    seats: 0, // a request holds no seat until it is approved and paid for
    trip: CUSTOM_TAB
  });

  if (NOTIFY) {
    MailApp.sendEmail(NOTIFY, 'Custom trip ' + ref + ' — ' + name,
      [name + ' · ' + seats + ' people · ' + destination, email, String(b.phone || ''),
       String(b.dates || ''), String(b.notes || '')].join('\n'));
  }
  return { ok: true, ref: ref, sheet: CUSTOM_TAB };
}

/**
 * A GET never writes. It answers two things: a health check, and "have we met?"
 *
 * ?email= returns what we already know about a returning traveller so the form
 * can fill itself in. Note what it does NOT return: the phone number. This URL
 * is open to anyone, so anything it hands back is effectively public, and an
 * email-to-phone lookup is a harvesting tool. Names and cities are a much
 * smaller exposure and cover most of the typing; the phone is prefilled from
 * the traveller's own device instead (see lib/booking.js).
 */
function doGet(e) {
  const q = (e && e.parameter) || {};
  if (q.about) return reply(aboutContent());
  if (q.seats) return reply(seatsFor(String(q.seats)));
  if (q.bookings) return reply(bookingsFor(String(q.bookings)));
  if (q.email) return reply(lookup(String(q.email), String(q.trip || '')));
  return reply({ ok: true, service: 'travel-with-wahid booking', time: iso(new Date()) });
}

function lookup(raw, trip) {
  const email = String(raw).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return { ok: false, error: 'bad email' };
  if (!allow(email)) return { ok: false, error: 'slow down' };

  const sh = SpreadsheetApp.openById(PEOPLE_SHEET_ID).getSheets()[0];
  const last = sh.getLastRow();
  if (last < 2) return { ok: true, known: false };

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  const col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  if (col.email === undefined) return { ok: false, error: 'people sheet has no email column' };

  const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][col.email]).trim().toLowerCase() !== email) continue;
    const pick = function (k) { return col[k] === undefined ? '' : String(rows[i][col[k]] || '').trim(); };
    const out = {
      ok: true,
      known: true,
      name: pick('name'),
      city: pick('city'),
      institution: pick('institution'),
      bookings: Number(rows[i][col.bookings]) || 0
      // phone withheld on purpose — see the note on doGet
    };
    // so the form can say "you already have a seat" before anyone types it all out
    if (trip) {
      const tab = SpreadsheetApp.openById(BOOKINGS_SHEET_ID).getSheetByName(String(trip).trim());
      if (tab) out.booked = activeBooking(tab, email);
    }
    return out;
  }
  return { ok: true, known: false, booked: bookedOn(trip, email) };
}

/** Whichever live booking this email holds on that trip, if any. */
function bookedOn(trip, email) {
  if (!trip) return null;
  const tab = SpreadsheetApp.openById(BOOKINGS_SHEET_ID).getSheetByName(String(trip).trim());
  return tab ? activeBooking(tab, email) : null;
}

/**
 * How many seats are actually taken on a trip.
 *
 * A count, nothing else — no throttle and no names, because there is nothing
 * here that is not already on the trip page. Cancelled bookings release their
 * seats, which is the whole reason this is counted live rather than typed into
 * the content sheet and left to go stale.
 */
function seatsFor(slug) {
  const name = String(slug).trim();
  if (!name) return { ok: false, error: 'no trip' };

  const sh = SpreadsheetApp.openById(BOOKINGS_SHEET_ID).getSheetByName(name);
  if (!sh) return { ok: true, slug: name, taken: 0, bookings: 0 }; // nobody yet

  const last = sh.getLastRow();
  if (last < 2) return { ok: true, slug: name, taken: 0, bookings: 0 };

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  const col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  if (col.seats === undefined) return { ok: false, error: 'no seats column' };

  const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  var taken = 0;
  var count = 0;
  for (var i = 0; i < rows.length; i++) {
    const status = col.status === undefined ? '' : String(rows[i][col.status]).trim().toLowerCase();
    if (status === 'cancelled') continue;
    taken += Number(rows[i][col.seats]) || 0;
    count++;
  }
  return { ok: true, slug: name, taken: taken, bookings: count };
}

/**
 * The About page as the content sheet has it right now, so an edit on Drive is
 * live on the site without a rebuild. The site bakes the same copy in at build
 * time and falls back to it whenever this cannot answer.
 *
 * Only the about tab — never the whole workbook, so a tab added to the content
 * sheet later is not public by default.
 */
function aboutContent() {
  if (!CONTENT_SHEET_ID) return { ok: false, error: 'CONTENT_SHEET_ID is not set' };
  try {
    const tab = SpreadsheetApp.openById(CONTENT_SHEET_ID).getSheetByName('about');
    if (!tab) return { ok: false, error: 'the content sheet has no "about" tab' };
    return { ok: true, about: table(tab).filter(function (r) { return r.block; }) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** A tab as a list of objects keyed by its header row. */
function table(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift().map(function (h) { return String(h).trim(); });
  return rows.map(function (r) {
    const o = {};
    headers.forEach(function (h, i) { if (h) o[h] = typeof r[i] === 'string' ? r[i].trim() : r[i]; });
    return o;
  });
}

/**
 * Every booking this email has made, newest first, across every trip tab.
 *
 * Same bargain as the lookup above: open to anyone, so it hands back only the
 * booking — trip, seats, amount, status — and never the person. The rows carry
 * no name or phone in the first place, which is the normalisation earning its
 * keep: there is nothing here to leak.
 */
function bookingsFor(raw) {
  const email = String(raw).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return { ok: false, error: 'bad email' };
  if (!allow('b:' + email)) return { ok: false, error: 'slow down' };

  const out = [];
  const sheets = SpreadsheetApp.openById(BOOKINGS_SHEET_ID).getSheets();
  for (var s = 0; s < sheets.length; s++) {
    const sh = sheets[s];
    const last = sh.getLastRow();
    if (last < 2) continue;
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
    const col = {};
    headers.forEach(function (h, i) { col[h] = i; });
    if (col.email === undefined) continue;

    const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
    for (var r = 0; r < rows.length; r++) {
      if (String(rows[r][col.email]).trim().toLowerCase() !== email) continue;
      const pick = function (k) { return col[k] === undefined ? '' : rows[r][col[k]]; };
      out.push({
        ref: String(pick('ref') || '').trim(),
        tripTitle: String(pick('tripTitle') || '').trim() || sh.getName(),
        dates: String(pick('dates') || '').trim(),
        seats: Number(pick('seats')) || '',
        amount: Number(pick('amount')) || '',
        status: String(pick('status') || '').trim().toLowerCase() || 'pending',
        pickup: String(pick('pickup') || '').trim(),
        submittedAt: String(pick('submittedAt') || '').trim(),
        notes: String(pick('notes') || '').trim()
      });
    }
  }

  out.sort(function (a, b) { return a.submittedAt < b.submittedAt ? 1 : -1; });
  return { ok: true, count: out.length, bookings: out };
}

/**
 * Crude throttle. Apps Script cannot see the caller's IP, so this caps lookups
 * per address and overall — enough to make walking a list of emails tedious
 * without getting in a real traveller's way.
 */
function allow(email) {
  const cache = CacheService.getScriptCache();
  const mine = 'lk_' + Utilities.base64EncodeWebSafe(email).slice(0, 40);
  const n = Number(cache.get(mine) || 0) + 1;
  cache.put(mine, String(n), 600); // ten minutes
  if (n > 6) return false;

  const all = Number(cache.get('lk_all') || 0) + 1;
  cache.put('lk_all', String(all), 60); // one minute
  return all <= 60;
}

/* ---------------------------------------------------------------- sheets */

/**
 * The tab this trip's bookings live on, created on the first booking if it is
 * not there yet.
 *
 * One tab per trip rather than one spreadsheet per trip: a new departure then
 * costs nothing — no new file, no new id to paste into this script, no
 * redeploy — and every trip that has ever run stays in one place to look back
 * through. The first tab in the workbook is the template the headers come
 * from, and is left alone otherwise.
 *
 * The tab is named after the trip's slug because that is the stable key the
 * site sends. Renaming a tab by hand means the next booking for that trip
 * makes a fresh one, so rename the trip in the workbook instead.
 */
function tripTab(slug, own) {
  const ss = SpreadsheetApp.openById(BOOKINGS_SHEET_ID);
  const template = ss.getSheets()[0];
  if (!slug) return template; // no trip on the booking — better filed than lost

  const found = ss.getSheetByName(slug);
  if (found) return found;

  // `own` headers for a tab that is not a trip (custom-trips); else the template's
  const made = ss.insertSheet(slug);
  const headers = own ? [own] : template.getRange(1, 1, 1, template.getLastColumn()).getValues();
  const width = headers[0].length;
  made.getRange(1, 1, 1, width).setValues(headers);
  made.getRange(1, 1, 1, width).setFontWeight('bold');
  made.setFrozenRows(1);
  try { made.autoResizeColumns(1, width); } catch (e) { /* cosmetic only */ }
  return made;
}

/**
 * This email's live booking on a trip, or null.
 *
 * "Live" means anything that is not cancelled — a pending booking is still a
 * held seat, so it blocks a second one just as a confirmed booking does.
 */
function activeBooking(sh, email) {
  const last = sh.getLastRow();
  if (last < 2) return null;
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  const col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  if (col.email === undefined) return null;

  const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  const want = String(email).trim().toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][col.email]).trim().toLowerCase() !== want) continue;
    const status = col.status === undefined ? '' : String(rows[i][col.status]).trim().toLowerCase();
    if (status === 'cancelled') continue;
    return {
      ref: col.ref === undefined ? '' : String(rows[i][col.ref]).trim(),
      status: status || 'pending'
    };
  }
  return null;
}

/** Has this reference already been written to this trip's tab? */
function alreadyFiled(sh, ref) {
  const last = sh.getLastRow();
  if (last < 2) return false;
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  const at = headers.indexOf('ref');
  if (at === -1) return false;
  const refs = sh.getRange(2, at + 1, last - 1, 1).getValues();
  for (var i = 0; i < refs.length; i++) {
    if (String(refs[i][0]).trim() === ref) return true;
  }
  return false;
}

/**
 * Appends a booking to the tab it belongs to, by header name, so columns can
 * be reordered on Drive safely.
 *
 * The header row is the contract. Writing by name is forgiving of a reorder
 * but silently forgiving of the wrong sheet entirely — every cell would come
 * out blank — so the columns we cannot do without are checked first.
 */
function appendBooking(sh, row) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  needHeaders(headers, ['ref', 'email', 'status'], 'bookings', sh);
  const at = sh.getLastRow() + 1;
  headers.forEach(function (h, i) {
    if (row[h] !== undefined) sh.getRange(at, i + 1).setValue(row[h]);
  });
}

/** Fails with something a human can act on, rather than a row of blanks. */
function needHeaders(headers, must, which, sh) {
  const missing = must.filter(function (h) { return headers.indexOf(h) === -1; });
  if (!missing.length) return;
  throw new Error(
    'The "' + which + '" sheet is missing the column(s): ' + missing.join(', ') +
    '. Tab "' + sh.getName() + '" has: ' + headers.join(', ') +
    '. Check the id at the top of this script points at the converted Google Sheet ' +
    '(not the .xlsx), and that row 1 still holds the headers.'
  );
}

/**
 * The email is the key. A returning traveller updates their row — their counts
 * go up and their details are refreshed — rather than appearing twice.
 */
function upsertPerson(p) {
  const sh = SpreadsheetApp.openById(PEOPLE_SHEET_ID).getSheets()[0];
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  needHeaders(headers, ['email', 'bookings', 'seatsTotal'], 'people', sh);
  const col = {};
  headers.forEach(function (h, i) { col[h] = i; });

  const last = sh.getLastRow();
  const emails = last > 1 ? sh.getRange(2, col.email + 1, last - 1, 1).getValues() : [];
  var at = -1;
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === p.email) { at = i + 2; break; }
  }

  if (at === -1) {
    const fresh = {
      email: p.email, name: p.name, phone: p.phone, city: p.city, institution: p.institution,
      firstBooked: p.when, lastBooked: p.when, bookings: 1, seatsTotal: p.seats,
      trips: p.trip, notes: ''
    };
    sh.appendRow(headers.map(function (h) { return fresh[h] === undefined ? '' : fresh[h]; }));
    return;
  }

  const row = sh.getRange(at, 1, 1, headers.length);
  const vals = row.getValues()[0];
  const set = function (key, v) { if (col[key] !== undefined) vals[col[key]] = v; };
  // keep whatever they last told us, and never lose a hand-written note
  if (p.name) set('name', p.name);
  if (p.phone) set('phone', p.phone);
  if (p.city) set('city', p.city);
  if (p.institution) set('institution', p.institution);
  set('lastBooked', p.when);
  if (p.trip && col.trips !== undefined) {
    // a list of every trip this person has been on, each one once
    const seen = String(vals[col.trips] || '').split(',').map(function (t) { return t.trim(); }).filter(String);
    if (seen.indexOf(p.trip) === -1) seen.push(p.trip);
    set('trips', seen.join(', '));
  }
  set('bookings', (Number(vals[col.bookings]) || 0) + 1);
  set('seatsTotal', (Number(vals[col.seatsTotal]) || 0) + p.seats);
  row.setValues([vals]);
}

/* ---------------------------------------------------------------- bits */

/** TWV-DDMM-XXXX — short enough to read down a phone line. */
function makeRef() {
  const d = new Date();
  const pad = function (n) { return ('0' + n).slice(-2); };
  var tail = '';
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  for (var i = 0; i < 4; i++) tail += abc.charAt(Math.floor(Math.random() * abc.length));
  return 'TWV-' + pad(d.getDate()) + pad(d.getMonth() + 1) + '-' + tail;
}

function iso(d) { return Utilities.formatDate(d, 'Asia/Karachi', "yyyy-MM-dd'T'HH:mm:ssXXX"); }
function ymd(d) { return Utilities.formatDate(d, 'Asia/Karachi', 'yyyy-MM-dd'); }

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
