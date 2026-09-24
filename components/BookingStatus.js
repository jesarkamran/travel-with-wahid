'use client';
/* "Where is my seat?"

   The email is the key to everything in the booking sheets, so it is the only
   thing this asks for. What comes back is the booking and nothing about the
   person — the rows carry no name or phone, which is the normalisation paying
   for itself: there is nothing here to hand to the wrong pair of eyes.

   An empty result is a real answer, not an error. "We have no bookings under
   that address" and "we could not check" mean very different things to someone
   waiting on a seat, so they never share a message. */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CalendarDays, Loader2, MapPin, Search, Ticket } from 'lucide-react';
import { site, waLink } from '@/data/site';
import { money } from './fmt';
import { BookBtn } from './ui';
import { lookupBookings, recall } from '@/lib/booking';

const EASE = [0.22, 0.8, 0.3, 1];

/* What each status means, said plainly. The sheet's own words are the source —
   Wahid types them — so anything unrecognised still shows, just unstyled. */
const SAYS = {
  pending: 'Wahid is checking your receipt. Your seat is held while he does.',
  booked: 'Confirmed. Your seat is yours — pickup points go out in the trip group.',
  confirmed: 'Confirmed. Your seat is yours — pickup points go out in the trip group.',
  cancelled: 'This booking was cancelled and the seat released.',
  waitlist: 'The trip is full. You are next in line if a seat opens.',
  // custom trip requests (the custom-trips tab)
  requested: 'Wahid is planning your trip and will send a route and a price on WhatsApp.',
  approved: 'Approved. Wahid will message you on WhatsApp with the plan and the advance to lock it in.',
  declined: 'We cannot run this one as asked. Wahid will message you with other options.',
};

export default function BookingStatus() {
  const calm = useReducedMotion();
  const [email, setEmail] = useState(() => recall()?.email || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState(null); // null = not asked yet
  const live = useRef(null);

  const check = async (e) => {
    e.preventDefault();
    live.current?.abort();
    const ac = new AbortController();
    live.current = ac;
    setBusy(true);
    setError('');
    try {
      setRows(await lookupBookings(email, { signal: ac.signal }));
    } catch (err) {
      if (ac.signal.aborted) return;
      setError(err.message);
      setRows(null);
    } finally {
      if (!ac.signal.aborted) setBusy(false);
    }
  };

  return (
    <div className="bst">
      <form className="bst__ask" onSubmit={check}>
        <p className="bk__field">
          <label htmlFor="check-email">The email you booked with</label>
          <input
            id="check-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
          />
        </p>
        <button type="submit" className="btn btn--book" disabled={busy || !email.trim()}>
          {busy
            ? <><Loader2 size={17} className="bk__spin" aria-hidden="true" /> Checking…</>
            : <><Search size={16} aria-hidden="true" /> Check my booking</>}
        </button>
      </form>

      {error && (
        <p className="bk__fail" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error} You can always ask on <a className="link" href={site.wa} rel="noopener">WhatsApp</a>.</span>
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {rows && rows.length === 0 && (
          <motion.p
            key="none"
            className="bst__none"
            initial={calm ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            No bookings under that address yet. If you booked with a different email, try
            that one — otherwise message Wahid and he will find you.
          </motion.p>
        )}

        {rows && rows.length > 0 && (
          <motion.ul
            key="rows"
            className="bst__list"
            initial={calm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {rows.map((b, i) => (
              <motion.li
                key={b.ref || i}
                className="bst__row"
                initial={calm ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: EASE }}
              >
                <p className="bst__top">
                  <span className={`bst__tag is-${b.status}`}>{b.status}</span>
                  <span className="bst__ref"><Ticket size={13} aria-hidden="true" /> {b.ref}</span>
                </p>

                <h3>{b.tripTitle}</h3>

                <p className="bst__meta">
                  {b.dates && <span><CalendarDays size={13} aria-hidden="true" /> {b.dates}</span>}
                  <span>{b.seats} {b.seats === 1 ? 'seat' : 'seats'}</span>
                  {b.amount ? <span>PKR {money(b.amount)}</span> : null}
                  {b.pickup && <span><MapPin size={13} aria-hidden="true" /> {b.pickup}</span>}
                </p>

                {SAYS[b.status] && <p className="bst__says">{SAYS[b.status]}</p>}
                {b.notes && <p className="bst__notes">{b.notes}</p>}

                <BookBtn
                  small
                  href={waLink(`Hi Wahid, about my booking ${b.ref} (${b.tripTitle}) — `)}
                >
                  Ask about this booking
                </BookBtn>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
