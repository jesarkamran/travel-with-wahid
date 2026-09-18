'use client';
/* Appears once the first screen is behind you and stays there. It names the trip
   you are actually looking at, so the WhatsApp message arrives with context. */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { tours, waLink } from '@/data/site';
import { BookBtn, money } from './ui';

export default function StickyBook() {
  const path = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  const t = tours.find((x) => path.includes(x.slug)) || tours[0];

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className="dockbar"
          aria-label="Quick booking"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.8, 0.3, 1] }}
        >
          <div className="dockbar__in">
            <span className="dockbar__txt">
              <b>{t.title}</b>
              <span>{t.dates} · leaves Islamabad · {t.seats - t.filled} seats left</span>
            </span>
            <span className="dockbar__price">PKR {money(t.price)}</span>
            <BookBtn small href={waLink(`Hi Wahid, I want to book a seat on ${t.title} (${t.dates}) at PKR ${money(t.price)}`)}>
              Instant WhatsApp booking
            </BookBtn>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
