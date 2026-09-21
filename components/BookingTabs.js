'use client';
/* Book a seat, or find the one you already have.

   The same tab shape the trip cards use, so the pill and the panel are already
   styled and already behave — arrow keys walk the tablist, the pill slides
   between them on a shared layoutId.

   Someone arriving to check a booking is usually anxious rather than shopping,
   so ?check in the URL opens straight onto that tab: the link Wahid sends when
   a traveller asks where their seat went lands them where they need to be. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BookingForm from './BookingForm';
import BookingStatus from './BookingStatus';

const EASE = [0.22, 0.8, 0.3, 1];
const TABS = [
  { id: 'book', label: 'Book a seat' },
  { id: 'check', label: 'Check a booking' },
];

export default function BookingTabs({ trip }) {
  const calm = useReducedMotion();
  const [tab, setTab] = useState('book');
  const refs = useRef({});

  // ?check — read after mount, so the server and the first render agree
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('check')) setTab('check');
  }, []);

  const onKey = (e) => {
    const i = TABS.findIndex((x) => x.id === tab);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = TABS[(i + d + TABS.length) % TABS.length].id;
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="tabs bk-tabs">
      <div className="tabs__list" role="tablist" aria-label="Book or check a booking" onKeyDown={onKey}>
        {TABS.map((x) => (
          <button
            key={x.id}
            ref={(el) => { refs.current[x.id] = el; }}
            type="button"
            role="tab"
            id={`bk-tab-${x.id}`}
            aria-controls={`bk-panel-${x.id}`}
            aria-selected={tab === x.id}
            tabIndex={tab === x.id ? 0 : -1}
            className={tab === x.id ? 'is-on' : ''}
            onClick={() => setTab(x.id)}
          >
            {tab === x.id && (
              <motion.span
                layoutId="bk-tab-pill"
                className="tabs__pill"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="tabs__label">{x.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`bk-panel-${tab}`}
          aria-labelledby={`bk-tab-${tab}`}
          className="tabs__panel"
          initial={calm ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {tab === 'book' ? <BookingForm trip={trip} /> : <BookingStatus />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
