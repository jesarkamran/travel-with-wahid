'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, ChevronLeft, ChevronRight,
  Clock, MapPin, Mountain, Share2, X,
} from 'lucide-react';
import { site, waLink } from '@/data/site';
import Profile from './Profile';
import { Counter, Magnetic, Reveal, Tilt, celebrate, useCursorGlow, useParallax } from './motion';

export { money, Jsonld } from './fmt';
import { money } from './fmt';

const EASE = [0.22, 0.8, 0.3, 1];

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

/* lucide-react v1 dropped its brand icons, so this one is drawn here — same
   approach as WaIcon above, and stroked to sit level with the lucide set. */
export const IgIcon = ({ size = 17, ...p }) => (
  <svg
    viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

/* A WhatsApp button that pulls toward the cursor and throws colour on click.
   `pulse` adds the double ring — kept for the one main call on a screen, so the
   page doesn't throb in five places at once. */
export function BookBtn({ href, children, className = '', small, pulse }) {
  return (
    <Magnetic>
      <a
        className={`btn btn--wa${small ? ' btn--sm' : ''}${pulse ? ' btn--pulse' : ''} ${className}`.trim()}
        href={href}
        rel="noopener"
        onClick={celebrate}
      >
        <WaIcon className="ico" /> {children}
      </a>
    </Magnetic>
  );
}

/* --- one header shape for every section ------------------------------ */
export function SectionHead({ eyebrow, title, lede, action, center, className = '' }) {
  return (
    <Reveal as="header" className={`head${center ? ' head--center' : ''} ${className}`.trim()}>
      <div className="head__text">
        {eyebrow && <p className="kicker">{eyebrow}</p>}
        <h2>{title}</h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {action && <div className="head__action">{action}</div>}
    </Reveal>
  );
}

/* --- the van, seat by seat -------------------------------------------- */
export function SeatMap({ seats = 25, filled = 0, compact }) {
  const calm = useReducedMotion();
  const left = seats - filled;
  return (
    <div className={`seatmap${compact ? ' seatmap--compact' : ''}`}>
      <p className="seatmap__top">
        <span>Seats on the van</span>
        <b>{filled}/{seats} taken</b>
      </p>
      <motion.ol
        style={{ '--cols': seats > 14 ? Math.ceil(seats / 2) : seats }}
        className="seatmap__row"
        aria-label={`${filled} of ${seats} seats taken`}
        initial={calm ? false : 'off'}
        whileInView="on"
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ staggerChildren: 0.05 }}
      >
        {Array.from({ length: seats }, (_, i) => (
          <motion.li
            key={i}
            className={i < filled ? 'is-taken' : ''}
            variants={{ off: { scale: 0.4, opacity: 0 }, on: { scale: 1, opacity: 1 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          />
        ))}
      </motion.ol>
      <p className={`seatmap__note${left <= 4 ? ' is-low' : ''}`}>
        {left <= 0 ? 'This van is full — ask about the next one' : left <= 4 ? `Only ${left} seats left on this van` : `${left} seats still open`}
      </p>
    </div>
  );
}

/* --- trip details: the three things people ask, in one place ---------- */
// 'Day 1 · evening' covers day 1; 'Days 2–4' covers 2, 3 and 4.
const onDay = (label, n) => {
  const [a, b = a] = (label?.split('·')[0].match(/\d+/g) || []).map(Number);
  return a != null && n >= a && n <= b;
};

export function Itinerary({ t }) {
  return (
    <ol className="days">
      {t.itinerary.map((d) => {
        const here = t.profile.filter((s) => onDay(s.day, d.day));
        return (
          <li key={d.day}>
            <span className="days__n" aria-hidden="true">{d.day}</span>
            <div>
              <b>Day {d.day}</b>
              <p>{d.text}</p>
              {here.length > 0 && (
                <p className="days__stops">
                  {here.map((s) => <span key={s.name} className="chip"><MapPin size={12} aria-hidden="true" /> {s.name}</span>)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Included({ t }) {
  return (
    <div className="incl">
      <div>
        <h4>Your seat covers</h4>
        <ul className="ticks">{t.includes.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
      <div>
        <h4>Not included</h4>
        <ul className="ticks ticks--no">{t.excludes.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    </div>
  );
}

export function TripMeta({ t }) {
  return (
    <ul className="meta">
      <li><CalendarDays size={15} aria-hidden="true" /> {t.dates}</li>
      <li><Clock size={15} aria-hidden="true" /> {t.days} days · {t.nights} {t.nights === 1 ? 'night' : 'nights'}</li>
      <li><Mountain size={15} aria-hidden="true" /> Up to {money(t.high)} m</li>
      <li><MapPin size={15} aria-hidden="true" /> From {site.city}</li>
    </ul>
  );
}

const TABS = [
  { id: 'route', label: 'Route' },
  { id: 'days', label: 'Day by day' },
  { id: 'incl', label: "What's included" },
];

function TripTabs({ t }) {
  const [tab, setTab] = useState('route');
  const calm = useReducedMotion();
  const refs = useRef({});

  // Arrow keys move between tabs, as a tablist should.
  const onKey = (e) => {
    const i = TABS.findIndex((x) => x.id === tab);
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = TABS[(i + dir + TABS.length) % TABS.length].id;
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={`${t.title} details`} onKeyDown={onKey}>
        {TABS.map((x) => (
          <button
            key={x.id}
            ref={(el) => { refs.current[x.id] = el; }}
            type="button"
            role="tab"
            id={`${t.slug}-tab-${x.id}`}
            aria-controls={`${t.slug}-panel-${x.id}`}
            aria-selected={tab === x.id}
            tabIndex={tab === x.id ? 0 : -1}
            className={tab === x.id ? 'is-on' : ''}
            onClick={() => setTab(x.id)}
          >
            {tab === x.id && (
              <motion.span layoutId={`${t.slug}-pill`} className="tabs__pill" transition={{ type: 'spring', stiffness: 480, damping: 38 }} />
            )}
            <span className="tabs__label">{x.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`${t.slug}-panel-${tab}`}
          aria-labelledby={`${t.slug}-tab-${tab}`}
          className="tabs__panel"
          initial={calm ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {tab === 'route' && <Profile stops={t.profile} />}
          {tab === 'days' && <Itinerary t={t} />}
          {tab === 'incl' && <Included t={t} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --- a trip: photograph, then everything you need to decide ----------- */
export function Trip({ t }) {
  const [d, mon] = (t.dateShort || '').split(' ');
  return (
    <Reveal as="article" className="trip" id={t.slug}>
      <Tilt className="trip__media" max={5}>
        <Img src={`/img/tours/${t.img}`} alt={`${t.title}, ${t.region}`} sizes="(max-width:960px) 100vw, 45vw" />
        {t.badge && <span className="trip__tag">{t.badge}</span>}
        {d && (
          <span className="trip__date" aria-hidden="true">
            <b>{d}</b><span>{mon}</span>
          </span>
        )}
        <span className="trip__region"><MapPin size={14} aria-hidden="true" /> {t.region}</span>
      </Tilt>

      <div className="trip__main">
        <h3><Link href={`/tours/${t.slug}`}>{t.title}</Link></h3>
        <p className="trip__body">{t.blurb}</p>
        <TripMeta t={t} />
        <TripTabs t={t} />
        <SeatMap seats={t.seats ?? site.seatsPerVan} filled={t.filled ?? 0} compact />

        <div className="trip__foot">
          <p className="price">PKR {money(t.price)} <small>per person</small></p>
          <div className="trip__cta">
            <Link className="btn btn--sm btn--quiet" href={`/tours/${t.slug}`}>
              Full trip <ArrowRight size={15} className="arr" aria-hidden="true" />
            </Link>
            <BookBtn small href={waLink(`Hi Wahid, is there a seat on ${t.title}, ${t.dates}?`)}>
              Ask about a seat
            </BookBtn>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* --- how booking works ------------------------------------------------ */
export function Steps({ items }) {
  return (
    <ol className="steps">
      {items.map((s, i) => (
        <Reveal as="li" key={s.h} delay={i * 0.08} className="card steps__item">
          <span className="steps__n">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s.h}</h3>
          <p>{s.p}</p>
        </Reveal>
      ))}
    </ol>
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
      <Img src={`/img/tours/${d.img}`} alt={`${d.name}, ${d.region}`} sizes="(max-width:900px) 85vw, 33vw" />
      <span className="valley__alt"><Mountain size={13} aria-hidden="true" /> {money(d.high)} m</span>
      <span className="valley__in">
        <span className="valley__where">{d.region}</span>
        <h3>{d.name}</h3>
        <span className="valley__more">
          <span className="valley__p">{d.note}</span>
          {d.season && <span className="valley__season">Road open {d.season}</span>}
          {d.coord && <span className="valley__coord">{d.coord}</span>}
        </span>
        <span className="valley__go">Ask about {d.name} <ArrowUpRight size={15} aria-hidden="true" /></span>
      </span>
    </a>
  );
}

/* The home-page deck: hovering one pushes it open and blurs the rest back.
   On touch screens it becomes a swipeable, snapping carousel. */
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
          role="button"
          tabIndex={0}
          aria-label={`Open ${g.label}, ${g.place}`}
          onClick={() => onOpen(g.i)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(g.i); } }}
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
  const shaped = items.map((g, i) => ({ ...g, i, ratio: ratios[i % ratios.length] }));
  const cols = [[], [], []];
  shaped.forEach((g, i) => cols[i % 3].push(g));

  const [idx, setIdx] = useState(null);
  const [dir, setDir] = useState(0);
  const [tip, setTip] = useState(null);
  const open = idx == null ? null : items[idx];

  const move = (g, e) => setTip(g ? { text: `${money(g.m)} m`, x: e.clientX, y: e.clientY } : null);
  const go = (d) => { setDir(d); setIdx((i) => (i + d + items.length) % items.length); };

  // Hold the page still behind the lightbox; Escape closes, arrows step.
  useEffect(() => {
    if (idx == null) return;
    const key = (e) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', key); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx == null]);

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
          <Column key={i} items={c} speed={[70, -40, 30][i]} onOpen={(n) => { setDir(0); setIdx(n); }} onMove={move} />
        ))}
      </div>

      {tip && <span className="tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</span>}

      <AnimatePresence>
        {open && (
          <motion.div
            className="lb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIdx(null)}
            role="dialog" aria-modal="true" aria-label={`${open.label}, ${open.place}`}
          >
            <button className="lb__x" aria-label="Close" onClick={() => setIdx(null)}><X size={20} /></button>
            <button className="lb__nav lb__nav--prev" aria-label="Previous photograph" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft size={22} /></button>
            <button className="lb__nav lb__nav--next" aria-label="Next photograph" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight size={22} /></button>

            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.figure
                key={open.img}
                custom={dir}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d * 60, scale: d ? 1 : 0.94 }),
                  show: { opacity: 1, x: 0, scale: 1 },
                  leave: (d) => ({ opacity: 0, x: d * -60 }),
                }}
                initial="enter" animate="show" exit="leave"
                transition={{ duration: 0.4, ease: EASE }}
                onClick={(e) => e.stopPropagation()}
                drag
                dragDirectionLock
                dragSnapToOrigin
                dragElastic={0.5}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                  const { x, y } = info.offset;
                  if (Math.abs(y) > 110 && Math.abs(y) > Math.abs(x)) setIdx(null);
                  else if (x < -70) go(1);
                  else if (x > 70) go(-1);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic size is unknown here and fill would crop the frame */}
                <img src={`/img/tours/${open.img}`} alt={`${open.label}, ${open.place}`} draggable={false} />
                <figcaption>
                  <span>
                    <b>{open.label}</b>
                    <span className="muted"> · {open.place} · {money(open.m)} m</span>
                    <span className="lb__count">{idx + 1} / {items.length}</span>
                  </span>
                  <span className="lb__actions">
                    <button className="btn btn--sm btn--quiet" onClick={() => share(open)}>
                      <Share2 size={15} /> Share
                    </button>
                    <BookBtn small href={waLink(`Hi Wahid, I want to go to ${open.label} (${open.place})`)}>
                      Book this destination
                    </BookBtn>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <p className="lb__hint" aria-hidden="true">Swipe to browse · drag down to close</p>
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
        <Reveal as="li" key={r.h} delay={i * 0.06} className="card glow" {...glow}>
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
            <span className="quote__mark" aria-hidden="true">“</span>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <b>{r.by}</b><em>{r.trip}</em>
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
          <BookBtn href={site.wa} pulse>Book on WhatsApp</BookBtn>
          <Magnetic>
            <a className="btn btn--quiet" href={site.instagram} rel="noopener" target="_blank">
              <IgIcon size={16} /> See trips on Instagram <ArrowUpRight size={16} className="arr" />
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

/* An accordion animated by framer-motion rather than <details>, so the open
   and close glide the same way in every browser. Answers stay in the DOM when
   closed (height 0, inert) — search engines and find-in-page still see them. */
export function Faq({ list }) {
  const [open, setOpen] = useState(() => new Set([0]));
  const calm = useReducedMotion();
  const uid = useId();
  const toggle = (i) => setOpen((s) => {
    const next = new Set(s);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  return (
    <div className="faq">
      {list.map((f, i) => {
        const on = open.has(i);
        const id = `${uid}-faq-${i}`;
        return (
          <div key={f.q} className={`faq__item${on ? ' is-open' : ''}`}>
            <h3 className="faq__h">
              <button type="button" className="faq__q" aria-expanded={on} aria-controls={id} onClick={() => toggle(i)}>
                <span>{f.q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </button>
            </h3>
            <motion.div
              id={id}
              role="region"
              className="faq__a"
              initial={false}
              animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
              transition={calm ? { duration: 0 } : { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3, delay: on ? 0.08 : 0 } }}
              inert={!on}
            >
              <p>{f.a}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
