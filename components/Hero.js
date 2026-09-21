'use client';
/* The hero is the whole pitch: a valley at the right time of year, the next van
   out with its seats counted, and one button. Everything else on the page is
   detail.

   It changes with the season, and the season is decided before this component
   ever runs — a blocking script sets `data-season` on <html> and CSS paints the
   palette, the sky and the photograph off that attribute (globals.css §8b). So
   the first paint is already right, and nothing here renders season-dependent
   markup until after hydration, which is what keeps a statically exported page
   built in one season from arguing with a browser reading it in another.

   Depth comes from four layers answering the same pointer at different rates:
   the sky barely moves, the photograph a little, the weather with it, and the
   ridge in front swings widest. Different rates across the same distance is
   what the eye reads as depth. It all runs off one pointer position, held in
   motion values for the parallax and in a ref for the canvas, so moving the
   mouse never re-renders React. */
import { useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, RotateCcw } from 'lucide-react';
import { site, tours, waLink } from '@/data/site';
import { BookBtn, IgIcon, SeatMap, Stat, money } from './ui';
import { Magnetic, MaskLine, Reveal } from './motion';
import RouteRibbon from './RouteRibbon';
import Weather from './Weather';
import { ORDER, SEASONS, useSeason } from './seasons';

const EASE = [0.22, 0.8, 0.3, 1];
const BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDEwIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzE2MjcxRCIvPjwvc3ZnPg==';

/* The nearest layer, drawn rather than photographed — which is why it can be
   tinted per season and why it costs nothing to move every frame. */
const RIDGE =
  'M0 118 L64 74 L104 92 L150 44 L196 88 L238 58 L286 96 L330 62 L380 100 L432 66 L470 104 L512 78 L556 110 L604 72 L654 104 L700 80 L744 112 L792 76 L840 106 L892 70 L940 100 L1000 62 L1050 96 L1100 74 L1160 112 L1200 88 L1200 170 L0 170 Z';

/* Seasons cross-fade rather than slide: the photographs are of different
   places, and sliding between them would imply a continuity that isn't there.
   The slight scale gives the swap somewhere to go without moving the frame. */
const plate = {
  enter: { opacity: 0, scale: 1.06 },
  on: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.75, ease: EASE } },
};

export default function Hero() {
  const ref = useRef(null);
  const calm = useReducedMotion();
  const { season, theme, choose, reset, picked, real } = useSeason();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scrollY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  /* One pointer, two consumers: motion values for the parallax, so framer can
     spring them without React, and a plain ref for the canvas, so the particle
     loop reads a raw position on its own frame. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const pointer = useRef({ x: -999, y: -999, active: false });

  const sp = { stiffness: 80, damping: 18, mass: 0.7 };
  const skyX = useSpring(useTransform(px, [-0.5, 0.5], [10, -10]), sp);
  const skyY = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), sp);
  const midX = useSpring(useTransform(px, [-0.5, 0.5], [26, -26]), sp);
  const airX = useSpring(useTransform(px, [-0.5, 0.5], [34, -34]), sp);
  const nearX = useSpring(useTransform(px, [-0.5, 0.5], [54, -54]), sp);
  const nearY = useSpring(useTransform(py, [-0.5, 0.5], [26, -26]), sp);
  // the card leans toward the cursor; Reveal already animates its y, so the
  // pointer takes x and a tilt — keys it does not touch — rather than fight it
  const cardX = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), sp);
  const cardRy = useSpring(useTransform(px, [-0.5, 0.5], [-4.5, 4.5]), sp);
  const cardRx = useSpring(useTransform(py, [-0.5, 0.5], [3.5, -3.5]), sp);

  const onMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
    if (calm) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }, [calm, px, py]);

  const onLeave = useCallback(() => {
    pointer.current = { x: -999, y: -999, active: false };
    px.set(0);
    py.set(0);
  }, [px, py]);

  // the dial walks with the arrow keys, as a set of related controls should
  const onDialKey = (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const from = season ?? real;
    choose(ORDER[(ORDER.indexOf(from) + d + ORDER.length) % ORDER.length]);
  };

  const next = tours[0];
  const high = tours
    .map((t) => ({ m: t.high, name: t.profile[t.profile.length - 1].name }))
    .reduce((a, b) => (b.m > a.m ? b : a));

  return (
    <>
      <section
        className="cine grain"
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {/* 1 · sky — furthest, and the only layer that is pure colour */}
        <motion.div className="cine__sky" style={calm ? undefined : { x: skyX, y: skyY }} aria-hidden="true">
          <span className="cine__sun" />
        </motion.div>

        {/* 2 · the photograph. The base plate is CSS, keyed off data-season, so
               it is already correct at first paint; once mounted, React stacks
               its own on top and cross-fades them on a change. */}
        <motion.div className="cine__bg" style={calm ? undefined : { y: scrollY, x: midX }}>
          <div className="cine__plate cine__plate--css" aria-hidden="true" />
          <AnimatePresence initial={false}>
            {theme && (
              <motion.div
                key={season}
                className="cine__plate"
                variants={calm ? undefined : plate}
                initial={calm ? false : 'enter'}
                animate={calm ? undefined : 'on'}
                exit={calm ? undefined : 'exit'}
              >
                <Image
                  src={theme.photo}
                  alt={theme.alt}
                  fill
                  sizes="100vw"
                  priority
                  placeholder="blur"
                  blurDataURL={BLUR}
                  style={{ objectFit: 'cover' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="cine__veil" />

        {/* 3 · the weather, between the photograph and the ridge */}
        <motion.div className="cine__air" style={calm ? undefined : { x: airX }} aria-hidden="true">
          {theme && <Weather kind={theme.particle} pointer={pointer} />}
        </motion.div>

        {/* 4 · the ridge — nearest, so it swings widest */}
        <motion.div className="cine__ridge" style={calm ? undefined : { x: nearX, y: nearY }} aria-hidden="true">
          <svg viewBox="0 0 1200 170" preserveAspectRatio="none"><path d={RIDGE} /></svg>
        </motion.div>

        <div className="fog" aria-hidden="true"><span /><span /><span /></div>

        <motion.div className="wrap--wide cine__grid" style={calm ? undefined : { y: lift }}>
          <div className="cine__in">
            <Reveal as="p" className="kicker" delay={0.1}>Islamabad, and everything north of it</Reveal>
            <h1>
              <MaskLine delay={0.2}>Exploring Pakistan</MaskLine>
              <MaskLine delay={0.34}><em>&amp; beyond</em></MaskLine>
            </h1>
            <Reveal as="p" className="lede" delay={0.5}>
              Small, unhurried trips into the northern valleys — the van, the beds and the
              food arranged, so all you carry is a warm layer.
            </Reveal>

            {/* The dial's looks come from CSS and the attribute, so it is right
                before hydration; React supplies the pressed state and the clicks. */}
            <Reveal className="season" delay={0.58}>
              <div className="season__dial" role="group" aria-label="See the valleys in another season" onKeyDown={onDialKey}>
                <span className="season__pill" aria-hidden="true" />
                {ORDER.map((id) => {
                  const Icon = SEASONS[id].icon;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`season__pick season__pick--${id}`}
                      onClick={() => choose(id)}
                      aria-pressed={id === season}
                    >
                      <span className="season__ico"><Icon size={16} aria-hidden="true" /></span>
                      <span className="season__name">{SEASONS[id].label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="season__say">
                <span className="season__lines">
                  {ORDER.map((id) => (
                    <span key={id} className={`season__line season__line--${id}`}>{SEASONS[id].note}</span>
                  ))}
                </span>
                {picked && season && season !== real && (
                  <button type="button" className="season__back" onClick={reset}>
                    <RotateCcw size={12} aria-hidden="true" /> back to now
                  </button>
                )}
              </p>
            </Reveal>

            <Reveal className="cine__cta" delay={0.66}>
              <BookBtn href={site.wa} pulse>Book on WhatsApp</BookBtn>
              <Magnetic>
                <Link className="btn btn--quiet btn--season" href="/tours">
                  See upcoming trips <ArrowRight size={16} className="arr" aria-hidden="true" />
                </Link>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ig" href={site.instagram} rel="noopener" target="_blank">
                  <IgIcon /> Instagram
                </a>
              </Magnetic>
            </Reveal>
          </div>

          {/* the next departure, pinned beside the headline on wide screens */}
          <Reveal
            as="aside"
            className="nextvan"
            delay={0.75}
            aria-label="Next departure"
            style={calm ? undefined : { x: cardX, rotateY: cardRy, rotateX: cardRx }}
          >
            <p className="nextvan__eyebrow"><span className="live__dot" aria-hidden="true" /> Next van out</p>
            <Link href={`/tours/${next.slug}`} className="nextvan__title">{next.title}</Link>
            <p className="nextvan__sub">{next.dates} · {next.days} days · up to {money(next.high)} m</p>
            <RouteRibbon stops={next.profile} />
            <SeatMap seats={next.seats} filled={next.filled} compact />
            <div className="nextvan__foot">
              <p className="price">PKR {money(next.price)} <small>per person</small></p>
              <BookBtn small href={waLink(`Hi Wahid, I want a seat on ${next.title} (${next.dates})`)}>Hold a seat</BookBtn>
            </div>
          </Reveal>
        </motion.div>

        <motion.p className="scroll-hint" style={calm ? undefined : { opacity: fade }} aria-hidden="true">
          <i />
          <ChevronDown size={14} />
        </motion.p>
      </section>

      <section className="facts-band">
        <div className="wrap--wide">
          <dl className="facts">
            <Stat label="Trips leave from" value={site.city} sub={`${money(site.cityM)} m`} />
            <Stat label="Seats from" value={`PKR ${money(tours[0].price)}`} sub="per person, all in" />
            <Stat label="Group size" value="One small van" sub={`${site.seatsPerVan} seats max`} />
            <Stat label="Highest we go" value={high.m} sub={`metres — ${high.name}`} />
          </dl>
        </div>
      </section>
    </>
  );
}
