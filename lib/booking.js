/* The booking rules, kept away from the form that renders them.

   How a booking travels: the form collects the details, files them in the
   sheets on Drive as a row marked "pending", and opens WhatsApp with the whole
   booking written out. The traveller sends their payment receipt straight into
   that chat, and Wahid moves the row on once he has seen it.

   The site never handles the receipt image at all. That is deliberate — it was
   the one part of this that could fail in ways nobody could see, and a payment
   screenshot is something people are already used to sending on WhatsApp.

   Everything here is pure except the functions that talk to the outside
   world: handoff, and everything that calls the endpoint. */

/* Deliberately loose. A regex cannot tell you an address exists, and a strict
   one mostly rejects real people — this catches typos and gets out of the way. */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/** Pakistani mobiles: 03xx xxxxxxx, or +92 / 0092 with the same 10 digits. */
export function normalisePhone(raw = '') {
  const d = String(raw).replace(/[^\d+]/g, '');
  const m = d.match(/^(?:\+?92|0)?3(\d{9})$/);
  return m ? `+923${m[1]}` : null;
}

/** Field name -> message. An empty object means it is good to send. */
export function validate(form, { seatsLeft = Infinity } = {}) {
  const out = {};
  const email = String(form.email || '').trim().toLowerCase();
  const name = String(form.name || '').trim();
  const seats = Number(form.seats);

  if (!name) out.name = 'Who is the seat for?';
  else if (name.length < 2) out.name = 'That looks too short.';

  if (!email) out.email = 'We need an email — it is how we find your booking again.';
  else if (!EMAIL.test(email)) out.email = 'Check that address.';

  if (!form.phone) out.phone = 'A WhatsApp number, so we can reach you on the road.';
  else if (!normalisePhone(form.phone)) out.phone = 'Use a Pakistani mobile, like 0300 1234567.';

  if (!Number.isInteger(seats) || seats < 1) out.seats = 'At least one seat.';
  else if (seats > seatsLeft) out.seats = seatsLeft > 0 ? `Only ${seatsLeft} seats left on this trip.` : 'This trip is full.';

  if (!form.agree) out.agree = 'Please confirm you have sent the advance.';
  return out;
}

/** What the booking costs, so the traveller and the sheet agree on a number. */
export const total = (price, seats) => (Number(price) || 0) * (Number(seats) || 0);

/** TWV-DDMM-XXXX — short enough to read down a phone line. */
export function newRef(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to misread
  let tail = '';
  for (let i = 0; i < 4; i++) tail += abc[Math.floor(Math.random() * abc.length)];
  return `TWV-${pad(d.getDate())}${pad(d.getMonth() + 1)}-${tail}`;
}

const money = (n) => Number(n || 0).toLocaleString('en-US');

/** The message Wahid receives. Every column of the bookings sheet is in here,
    in the order he reads them, so checking a row against it is a glance. */
export function waMessage(form, trip, ref) {
  const lines = [
    `NEW BOOKING — ${ref}`,
    '',
    `Trip: ${trip.title}`,
    `Dates: ${trip.dates}`,
    `Seats: ${form.seats}`,
    `Amount: PKR ${money(total(trip.price, form.seats))}`,
    '',
    `Name: ${String(form.name).trim()}`,
    `Email: ${String(form.email).trim().toLowerCase()}`,
    `Phone: ${normalisePhone(form.phone) || form.phone}`,
  ];
  if (form.city) lines.push(`City: ${String(form.city).trim()}`);
  if (form.institution) lines.push(`Institution: ${String(form.institution).trim()}`);
  if (form.pickup) lines.push(`Pickup: ${String(form.pickup).trim()}`);
  if (form.notes) lines.push(`Notes: ${String(form.notes).trim()}`);
  lines.push('', 'Sending the payment receipt here now.');
  return lines.join('\n');
}

export const waHref = (phone, text) =>
  `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

/**
 * Open WhatsApp on Wahid's number with the booking written out.
 *
 * A plain link rather than the share sheet: share would let the traveller pick
 * any app and any contact, and this has to land in one specific chat — the one
 * they are about to send the receipt into.
 *
 * Call it straight out of the submit handler. A browser only allows a popup
 * from a real tap, and an await in between can spend that permission.
 */
export function handoff({ form, trip, ref, phone }) {
  const url = waHref(phone, waMessage(form, trip, ref));
  const win = typeof window !== 'undefined' ? window.open(url, '_blank', 'noopener') : null;
  return { via: win ? 'link' : 'blocked', url };
}

/* ---------------------------------------------------------------------------
   The sheet write.

   Sending on WhatsApp also files the booking: scripts/booking-endpoint.gs
   appends a row with status "pending" and adds the person to the people sheet
   if this is the first time we have seen their email.

   Only a deployed web app can take a POST. A plain spreadsheet URL is the
   document, not an endpoint, so one pasted here is ignored on purpose — and
   said out loud in the console, because a silently ignored endpoint is exactly
   how a booking goes missing. */
const RAW_ENDPOINT = process.env.NEXT_PUBLIC_BOOKING_ENDPOINT || '';
export const isScriptEndpoint = (u) => /^https:\/\/script\.google\.com\/.+\/exec\b/.test(String(u || ''));
export const ENDPOINT = isScriptEndpoint(RAW_ENDPOINT) ? RAW_ENDPOINT : '';

if (typeof window !== 'undefined' && !ENDPOINT) {
  console.warn(
    RAW_ENDPOINT
      ? '[booking] NEXT_PUBLIC_BOOKING_ENDPOINT is set but is not an Apps Script web ' +
        'app URL (expected https://script.google.com/.../exec). Bookings are NOT ' +
        'being written to the sheets. WhatsApp hand-off still works.'
      : '[booking] NEXT_PUBLIC_BOOKING_ENDPOINT is not set, so bookings are NOT being ' +
        'written to the sheets. On a static export this value is baked in at build ' +
        'time — set it and rebuild. WhatsApp hand-off still works.',
  );
}

/**
 * Write the booking into the sheets on Drive: a row in bookings marked
 * "pending", and the person added to (or updated in) people, keyed by email.
 *
 * It never throws. WhatsApp carries the booking either way, so a failure here
 * costs a row, not the booking — and the caller reports which of the two
 * happened rather than guessing.
 */
export function mirror(form, trip, ref) {
  return post({
    ref,
    email: String(form.email).trim().toLowerCase(),
    name: String(form.name).trim(),
    phone: normalisePhone(form.phone) || String(form.phone).trim(),
    city: String(form.city || '').trim(),
    institution: String(form.institution || '').trim(),
    tripSlug: trip.slug, // picks the tab
    tripTitle: trip.title,
    dates: trip.dates,
    seats: Number(form.seats),
    amount: total(trip.price, form.seats),
    pickup: String(form.pickup || '').trim(),
    notes: String(form.notes || '').trim(),
  });
}

/** One POST to the endpoint. Never throws — see mirror. */
async function post(payload) {
  if (!ENDPOINT) return { ok: false, reason: 'no-endpoint' };
  try {
    // form-encoded on purpose: a JSON content-type triggers a CORS preflight,
    // which an Apps Script web app cannot answer
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
      redirect: 'follow',
    });
    const text = await res.text();

    /* A misconfigured deployment answers with Google's sign-in or
       access-denied page — HTML, not JSON. That is worth telling apart from
       "the server said no", because the fix is completely different: one is a
       setting in the Apps Script deployment, the other is the data. */
    if (!res.ok || text.trim().startsWith('<')) {
      return { ok: false, reason: 'forbidden', status: res.status };
    }

    const data = JSON.parse(text);
    // the one refusal worth naming: they already hold a seat on this trip
    if (!data.ok && data.error === 'already-booked') {
      return { ok: false, reason: 'already-booked', ref: data.ref, status: data.status };
    }
    return { ok: Boolean(data.ok), reason: data.ok ? null : 'refused', ...data };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}

/* ---------------------------------------------------------------------------
   Custom trips.

   A request, not a seat: no advance, no receipt. It is filed on the
   custom-trips tab as "requested", Wahid plans it and sends a price on
   WhatsApp, and moves the row to "approved" — which the traveller sees under
   "Check a booking", because that tab shares its column names with a trip's. */

/** Same shape as validate: field name -> message, empty means good to send. */
export function validateCustom(form, today = new Date().toLocaleDateString('en-CA')) {
  // name, email and phone follow the same rules as a seat — the rest of what
  // validate checks (seats, the advance) does not apply, so it is satisfied here
  const out = validate({ ...form, seats: 1, agree: true });
  const people = Number(form.people);
  const days = Number(form.days);

  if (!String(form.destination || '').trim()) out.destination = 'Where do you want to go?';
  if (!Number.isInteger(people) || people < 1) out.people = 'At least one person.';
  if (!form.start) out.start = 'Roughly when? Pick a start date.';
  else if (form.start < today) out.start = 'That date has already passed.';
  if (!Number.isInteger(days) || days < 1 || days > 30) out.days = 'Between 1 and 30 days.';
  return out;
}

/** "12 Oct 2026 · 3 days" — how the dates read in the sheet and on WhatsApp. */
export function customDates({ start, days }) {
  const d = new Date(`${start}T00:00`);
  const on = Number.isNaN(d.getTime())
    ? String(start || '')
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${on} · ${days} ${Number(days) === 1 ? 'day' : 'days'}`;
}

/** The request written out, for WhatsApp — the way in when the sheet is not. */
export function customMessage(form, ref) {
  const lines = [
    `CUSTOM TRIP REQUEST — ${ref}`,
    '',
    `Destination: ${String(form.destination).trim()}`,
    `Dates: ${customDates(form)}`,
    `People: ${form.people}${form.groupType ? ` (${form.groupType})` : ''}`,
  ];
  if (form.budget) lines.push(`Budget: PKR ${money(form.budget)} per person`);
  if (form.pickup) lines.push(`Pickup: ${String(form.pickup).trim()}`);
  lines.push(
    '',
    `Name: ${String(form.name).trim()}`,
    `Email: ${String(form.email).trim().toLowerCase()}`,
    `Phone: ${normalisePhone(form.phone) || form.phone}`,
  );
  if (form.notes) lines.push('', String(form.notes).trim());
  return lines.join('\n');
}

/** File a custom trip request. Same bargain as mirror: it never throws. */
export function requestCustom(form, ref) {
  return post({
    kind: 'custom',
    ref,
    email: String(form.email).trim().toLowerCase(),
    name: String(form.name).trim(),
    phone: normalisePhone(form.phone) || String(form.phone).trim(),
    destination: String(form.destination).trim(),
    dates: customDates(form),
    seats: Number(form.people),
    groupType: String(form.groupType || '').trim(),
    budget: Number(form.budget) || '',
    pickup: String(form.pickup || '').trim(),
    notes: String(form.notes || '').trim(),
  });
}

/* ---------------------------------------------------------------------------
   Knowing a returning traveller.

   Two sources, deliberately unequal:

     · This device. After a booking we keep the details in localStorage, so a
       repeat booking on the same phone fills itself in completely — including
       the phone number, because it never left the device it was typed on.

     · The people sheet. A lookup by email, for someone booking from a new
       device. It answers with name, city and institution but never the phone:
       the endpoint is open to anyone, so an email-to-phone lookup would be a
       harvesting tool. Three fields of typing saved is worth having; a public
       oracle over customers' phone numbers is not. */

const MINE = 'twv-booking-me';

/** Keep this booking's details for next time, on this device only. */
export function remember(form) {
  try {
    localStorage.setItem(MINE, JSON.stringify({
      name: String(form.name || '').trim(),
      email: String(form.email || '').trim().toLowerCase(),
      phone: String(form.phone || '').trim(),
      city: String(form.city || '').trim(),
      institution: String(form.institution || '').trim(),
      pickup: String(form.pickup || '').trim(),
    }));
  } catch { /* private mode — it just will not be remembered */ }
}

/** What this device remembers, or null. */
export function recall() {
  try {
    const raw = localStorage.getItem(MINE);
    if (!raw) return null;
    const me = JSON.parse(raw);
    return me && me.email ? me : null;
  } catch {
    return null;
  }
}

export function forget() {
  try { localStorage.removeItem(MINE); } catch { /* ignore */ }
}

/**
 * Ask the sheet whether this email has booked before.
 *
 * Returns null when there is nothing useful to say — no endpoint, a bad
 * address, throttled, offline. The form treats "we do not know" and "we could
 * not ask" the same way, because to the traveller they are the same.
 */
export async function lookupPerson(email, { trip, signal } = {}) {
  const clean = String(email || '').trim().toLowerCase();
  if (!ENDPOINT || !EMAIL.test(clean)) return null;
  try {
    const q = `?email=${encodeURIComponent(clean)}${trip ? `&trip=${encodeURIComponent(trip)}` : ''}`;
    const res = await fetch(ENDPOINT + q, { signal, redirect: 'follow' });
    const data = JSON.parse(await res.text());
    if (!data || !data.ok) return null;
    // a first-time traveller is still worth an answer — they may hold a seat
    // on this trip without ever having had a people row before
    return data.known || data.booked ? data : null;
  } catch {
    return null;
  }
}

/**
 * Every booking this email has made, newest first.
 *
 * Returns an array, or null when we could not ask. An empty array is a real
 * answer — "no bookings under that address" — and the caller says so, because
 * to someone waiting on a seat those two are not the same thing at all.
 */
export async function lookupBookings(email, { signal } = {}) {
  const clean = String(email || '').trim().toLowerCase();
  if (!ENDPOINT) throw new Error('Booking records are not connected yet.');
  if (!EMAIL.test(clean)) throw new Error('Check that address.');
  let res;
  try {
    res = await fetch(`${ENDPOINT}?bookings=${encodeURIComponent(clean)}`, { signal, redirect: 'follow' });
  } catch {
    throw new Error('Could not reach the booking system. Try again in a moment.');
  }
  const text = await res.text();
  if (!res.ok || text.trim().startsWith('<')) throw new Error('The booking system turned the request away.');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('The booking system answered with something unexpected.');
  }
  if (!data.ok) throw new Error(data.error === 'slow down' ? 'Too many checks just now — wait a minute.' : 'We could not look that up.');

  /* An older deployment does not know ?bookings and just answers with its
     health check — ok:true and no list. Treating that as an empty result would
     tell someone who has a seat that we have never heard of them, which is the
     worst possible wrong answer here. */
  if (!Array.isArray(data.bookings)) {
    throw new Error('Booking lookup is not available yet — the booking system needs updating.');
  }
  return data.bookings;
}

/**
 * The rows of the about tab as the content sheet on Drive has them right now.
 * Null when they cannot be fetched, and the page keeps the copy baked in at
 * build time.
 */
export async function lookupAbout({ signal } = {}) {
  if (!ENDPOINT) return null;
  try {
    const res = await fetch(`${ENDPOINT}?about=1`, { signal, redirect: 'follow' });
    const text = await res.text();
    if (!res.ok || text.trim().startsWith('<')) return null;
    const data = JSON.parse(text);
    return data && data.ok && Array.isArray(data.about) && data.about.length ? data.about : null;
  } catch {
    return null;
  }
}

/**
 * Seats taken on a trip, counted from the bookings sheet.
 *
 * Returns null rather than throwing: a seat count that cannot be fetched falls
 * back to the figure in the content sheet, which is a stale number but never a
 * broken page.
 */
export async function lookupSeats(slug, { signal } = {}) {
  if (!ENDPOINT || !slug) return null;
  try {
    const res = await fetch(`${ENDPOINT}?seats=${encodeURIComponent(slug)}`, { signal, redirect: 'follow' });
    const text = await res.text();
    if (!res.ok || text.trim().startsWith('<')) return null;
    const data = JSON.parse(text);
    return data && data.ok && typeof data.taken === 'number' ? data.taken : null;
  } catch {
    return null;
  }
}
