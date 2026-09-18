'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Mountain, Share2, X } from 'lucide-react';
import { site, waLink } from '@/data/site';
import Profile from './Profile';
import { Counter, Magnetic, Reveal, Tilt, celebrate, useCursorGlow, useParallax } from './motion';

export { money, Jsonld } from './fmt';
import { money } from './fmt';

// One flat deep-forest placeholder. The export build serves images unoptimised,
// so a generated per-image blur would be dead weight — this holds the frame.
const BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDEwIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzE2MjcxRCIvPjwvc3ZnPg==';

export function Img({ src, alt, sizes = '100vw', priority, ...rest }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      blurDataURL={BLUR}
      priority={priority}
      style={{ objectFit: 'cover' }}
      {...rest}
    />
  );
}

export const WaIcon = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.6 14.2c-.24.67-1.4 1.28-1.93 1.32-.5.04-1.12.2-3.63-.85-3.06-1.28-5-4.45-5.15-4.66-.15-.2-1.22-1.62-1.22-3.1s.78-2.2 1.06-2.5a1.1 1.1 0 0 1 .8-.37h.57c.18 0 .43-.07.67.51.24.6.83 2.06.9 2.2.07.16.12.34.02.54-.1.2-.15.33-.3.5l-.44.52c-.15.16-.3.34-.13.65.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.3 2.36 1.46.3.15.47.13.65-.08.17-.2.74-.87.94-1.17.2-.3.4-.25.66-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.7-.17 1.37Z" />
  </svg>
);

/* A WhatsApp button that pulls toward the cursor and throws colour on click. */
export function BookBtn({ href, children, className = '', small }) {
  return (
    <Magnetic>
      <a
        className={`btn btn--wa${small ? ' btn--sm' : ''} ${className}`}
        href={href}
        rel="noopener"
        onClick={celebrate}
      >
        <WaIcon className="ico" /> {children}
      </a>
    </Magnetic>
  );
}

/* --- a trip: photograph, route, and how full the van is --------------- */
export function Trip({ t }) {
  const left = (t.seats ?? 12) - (t.filled ?? 0);
  const pct = Math.round(((t.filled ?? 0) / (t.seats ?? 12)) * 100);

  return (
    <Reveal as="article" className="trip">
      <Tilt className="trip__media" style={{ margin: 0 }}>
        <Img src={`/img/tours/${t.img}`} alt={`${t.title}, ${t.region}`} sizes="(max-width:880px) 100vw, 55vw" />
        {t.badge && <span className="trip__tag">{t.badge}</span>}
      </Tilt>
      <div>
        <p className="trip__when">{t.dates}</p>
        <h3><Link href={`/tours/${t.slug}`}>{t.title}</Link></h3>
        <p className="trip__body">{t.blurb}</p>

        <Profile stops={t.profile} />

        <ul className="trip__list">
          {t.includes.map((i) => <li key={i}>{i}</li>)}
        </ul>

        <div className="seats">
          <p className="seats__top">
            <span>Seats taken</span>
            <b>{t.filled ?? 0}/{t.seats ?? 12}</b>
          </p>
          <span className="seats__rail">
            <motion.span
              className="seats__fill"
              style={{ display: 'block' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 0.8, 0.3, 1] }}
            />
          </span>
          <p className="seats__note">
            {left <= 4 ? `Only ${left} seats left on this van` : `${left} seats still open`}
          </p>
        </div>

        <div className="trip__foot">
          <p className="price">PKR {money(t.price)} <small>per person</small></p>
          <Link className="btn btn--sm btn--quiet" href={`/tours/${t.slug}`}>See the trip</Link>
          <BookBtn small href={waLink(`Hi Wahid, is there a seat on ${t.title}, ${t.dates}?`)}>
            Ask about a seat
          </BookBtn>
        </div>
      </div>
    </Reveal>
  );
}

/* --- a valley card, used flat in the grid and expanding in the deck --- */
export function Valley({ d, active, onEnter }) {
  return (
    <a
      className={`valley${active ? ' is-active' : ''}`}
      href={waLink(`Hi Wahid, tell me about ${d.name}`)}
      rel="noopener"
      onMouseEnter={onEnter}
      onFocus={onEnter}
    >
      <Img src={`/img/tours/${d.img}`} alt={`${d.name}, ${d.region}`} sizes="(max-width:900px) 100vw, 33vw" />
      <span className="valley__alt"><Mountain size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />{money(d.high)} m</span>
      <span className="valley__in">
        <span className="valley__where">{d.region}</span>
        <h3>{d.name}</h3>
        <span className="valley__more">
          <span className="valley__p" style={{ display: 'block', fontSize: '.92rem', color: 'rgba(247,249,246,.78)' }}>{d.note}</span>
          {d.season && <span className="valley__season">Road open {d.season}</span>}
          {d.coord && <span className="valley__coord">{d.coord}</span>}
        </span>
      </span>
    </a>
  );
}

/* The home-page deck: hovering one pushes it open and blurs the rest back. */
export function Deck({ items }) {
  const [on, setOn] = useState(null);
  return (
    <div className={`deck${on != null ? ' has-active' : ''}`} onMouseLeave={() => setOn(null)}>
      {items.map((d, i) => (
        <Valley key={d.name} d={d} active={on === i} onEnter={() => setOn(i)} />
      ))}
    </div>
  );
}

/* --- masonry gallery: three columns drifting at different speeds ------ */
function Column({ items, speed, onOpen, onMove }) {
  const ref = useRef(null);
  const y = useParallax(ref, speed);
  return (
    <motion.div ref={ref} style={{ y, display: 'grid', gap: 'inherit' }}>
      {items.map((g) => (
        <figure
          key={g.img}
          className="shot"
          style={{ aspectRatio: g.ratio }}
          onClick={() => onOpen(g)}
          onMouseMove={(e) => onMove(g, e)}
          onMouseLeave={() => onMove(null)}
        >
          <Img src={`/img/tours/${g.img}`} alt={`${g.label}, ${g.place}`} sizes="(max-width:720px) 50vw, 33vw" />
          <figcaption>{g.label}<span>{money(g.m)} m</span></figcaption>
        </figure>
      ))}
    </motion.div>
  );
}

export function Strip({ items }) {
  const ratios = ['3/4', '1/1', '3/4.4', '4/5', '1/1.15', '3/4'];
  const shaped = items.map((g, i) => ({ ...g, ratio: ratios[i % ratios.length] }));
  const cols = [[], [], []];
  shaped.forEach((g, i) => cols[i % 3].push(g));

  const [open, setOpen] = useState(null);
  const [tip, setTip] = useState(null);

  const move = (g, e) => setTip(g ? { text: `${money(g.m)} m`, x: e.clientX, y: e.clientY } : null);

  // Hold the page still behind the lightbox, and let Escape out of it.
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && setOpen(null);
    document.body.style.overflow = 'hidden';
    addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', esc); };
  }, [open]);

  const share = async (g) => {
    const url = `${site.url}/destinations/`;
    try {
      if (navigator.share) await navigator.share({ title: `${g.label}, ${g.place}`, url });
      else await navigator.clipboard.writeText(url);
    } catch { /* the user dismissed the sheet — nothing to do */ }
  };

  return (
    <>
      <div className="masonry">
        {cols.map((c, i) => (
          <Column key={i} items={c} speed={[70, -40, 30][i]} onOpen={setOpen} onMove={move} />
        ))}
      </div>

      {tip && <span className="tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</span>}

      <AnimatePresence>
        {open && (
          <motion.div
            className="lb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog" aria-modal="true" aria-label={`${open.label}, ${open.place}`}
          >
            <button className="lb__x" aria-label="Close" onClick={() => setOpen(null)}><X size={20} /></button>
            <motion.figure
              initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 0.8, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic size is unknown here and fill would crop the frame */}
              <img src={`/img/tours/${open.img}`} alt={`${open.label}, ${open.place}`} />
              <figcaption>
                <span>
                  <b style={{ fontWeight: 500 }}>{open.label}</b>
                  <span className="muted"> · {open.place} · {money(open.m)} m</span>
                </span>
                <span style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                  <button className="btn btn--sm btn--quiet" onClick={() => share(open)}>
                    <Share2 size={15} /> Share
                  </button>
                  <BookBtn small href={waLink(`Hi Wahid, I want to go to ${open.label} (${open.place})`)}>
                    Book this destination
                  </BookBtn>
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* --- reasons, with a glow that follows the cursor --------------------- */
export function Reasons({ items }) {
  const glow = useCursorGlow();
  return (
    <ul className="reasons">
      {items.map((r, i) => (
        <Reveal as="li" key={r.h} delay={i * 0.06} {...glow}>
          <span className="line" />
          <h3>{r.h}</h3>
          <p>{r.p}</p>
        </Reveal>
      ))}
    </ul>
  );
}

/* --- testimonials, running past forever ------------------------------ */
export function Quotes({ items }) {
  const row = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee__row">
        {row.map((r, i) => (
          <figure key={`${r.by}-${i}`} className="quote" aria-hidden={i >= items.length}>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              {r.by}<em>{r.trip}</em>
              {r.verified && <span className="verified"><BadgeCheck size={14} /> Verified trip</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {typeof value === 'number' ? <Counter to={value} /> : value}
        {sub && <small>{sub}</small>}
      </dd>
    </div>
  );
}

export function Close({
  title = 'The next van leaves in August.',
  text = 'Message the number and Wahid answers it himself, usually the same day.',
}) {
  return (
    <section className="close on-pine grain">
      <div className="wrap">
        <Reveal as="h2">{title}</Reveal>
        <Reveal as="p" delay={0.08}>{text}</Reveal>
        <Reveal className="close__row" delay={0.16}>
          <BookBtn href={site.wa}>Book on WhatsApp</BookBtn>
          <Magnetic>
            <a className="btn btn--quiet" href={site.instagram} rel="noopener">
              See trips on Instagram <ArrowUpRight size={16} />
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

export function Faq({ list }) {
  return (
    <div className="faq">
      {list.map((f, i) => (
        <details key={f.q} open={i === 0}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
