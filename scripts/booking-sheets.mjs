// Generates the two operational workbooks the booking flow writes to:
//
//   data/booking/people.xlsx     one row per person, keyed by email
//   data/booking/bookings.xlsx   one row per booking, email as the link back
//
// Bookings are filed one tab per trip, named after the trip's slug. The tab in
// this file is the header template — the endpoint copies its header row when a
// trip books for the first time, and leaves it alone otherwise.
//
//   node scripts/booking-sheets.mjs          write them if they do not exist
//   node scripts/booking-sheets.mjs --force  overwrite, losing local edits
//
// These are templates. The live copies are the ones on Drive — upload these
// once, convert them to Google Sheets (Apps Script cannot write a raw .xlsx),
// and the web app in scripts/booking-endpoint.gs appends to them from there.
//
// The column order here is the contract: scripts/booking-endpoint.gs writes by
// header name, so columns can be reordered on Drive, but renaming one means
// renaming it there too.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs);

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'booking');
const force = process.argv.includes('--force');

/* One row per person. The email is the primary key: a second booking from the
   same address updates this row rather than adding one. */
const PEOPLE = [
  {
    email: 'ayesha.khan@example.com',
    name: 'Ayesha Khan',
    phone: '+92 300 1234567',
    city: 'Islamabad',
    institution: 'NUST',
    firstBooked: '2026-09-18',
    lastBooked: '2026-09-18',
    bookings: 1,
    seatsTotal: 2,
    trips: 'arang-kel-neelum-valley',
    notes: 'Travelling with her sister — asked for front seats.',
  },
  {
    email: 'hamza.raza@example.com',
    name: 'Hamza Raza',
    phone: '+92 321 7654321',
    city: 'Rawalpindi',
    institution: 'Bahria University',
    firstBooked: '2026-08-02',
    lastBooked: '2026-09-19',
    bookings: 2,
    seatsTotal: 3,
    trips: 'kalam-mahodand-lake, arang-kel-neelum-valley',
    notes: 'Came on the Kalam trip in August.',
  },
  {
    email: 'sara.iqbal@example.com',
    name: 'Sara Iqbal',
    phone: '+92 333 2223344',
    city: 'Islamabad',
    institution: 'Quaid-i-Azam University',
    firstBooked: '2026-09-20',
    lastBooked: '2026-09-20',
    bookings: 1,
    seatsTotal: 1,
    trips: 'arang-kel-neelum-valley',
    notes: '',
  },
];

/* One row per booking, on its trip's own tab.

   Who the traveller is lives once, in people.xlsx — the email is the link.
   Name and phone are deliberately not repeated here: two copies of a name is
   two answers the day somebody corrects theirs.

   `ref` is what the traveller quotes on WhatsApp. `status` is the only column
   Wahid edits by hand: pending -> booked once he has seen the receipt. */
const BOOKINGS = [
  {
    ref: 'TWV-2609-4KD1',
    submittedAt: '2026-09-18T20:14:00+05:00',
    email: 'ayesha.khan@example.com',
    tripTitle: 'Arang Kel & the Neelum Valley',
    dates: '28–29 September',
    seats: 2,
    amount: 15998,
    status: 'booked',
    pickup: 'Faizabad',
    notes: 'Full payment, not just the advance.',
  },
  {
    ref: 'TWV-2609-9XQ7',
    submittedAt: '2026-09-19T11:02:00+05:00',
    email: 'hamza.raza@example.com',
    tripTitle: 'Arang Kel & the Neelum Valley',
    dates: '28–29 September',
    seats: 1,
    amount: 4000,
    status: 'pending',
    pickup: '26 Number Chungi',
    notes: 'Advance only — balance on the day.',
  },
  {
    ref: 'TWV-2609-2MB5',
    submittedAt: '2026-09-20T09:41:00+05:00',
    email: 'sara.iqbal@example.com',
    tripTitle: 'Arang Kel & the Neelum Valley',
    dates: '28–29 September',
    seats: 1,
    amount: 7999,
    status: 'cancelled',
    pickup: 'G-9 Markaz',
    notes: 'Withdrew before paying — seat released.',
  },
];

// Column widths only; the header row is whatever the first object's keys are.
const widths = (rows) =>
  Object.keys(rows[0]).map((k) => ({
    wch: Math.min(Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)) + 2, 42),
  }));

function write(name, sheet, rows) {
  const file = join(dir, name);
  if (fs.existsSync(file) && !force) {
    console.log(`booking: ${name} already exists — left alone (--force to replace)`);
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = widths(rows);
  ws['!autofilter'] = { ref: ws['!ref'] };
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, file);
  console.log(`booking: wrote ${name} (${rows.length} sample rows, ${Object.keys(rows[0]).length} columns)`);
}

fs.mkdirSync(dir, { recursive: true });
write('people.xlsx', 'people', PEOPLE);
write('bookings.xlsx', 'bookings', BOOKINGS);
