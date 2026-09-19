'use client';
/* The hero is the whole pitch: a valley at first light, the next van out with
   its seats counted, and one button. Everything else on the page is detail. */
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { site, tours, waLink } from '@/data/site';
import { BookBtn, IgIcon, Img, SeatMap, Stat, money } from './ui';
import { Magnetic, MaskLine, Reveal } from './motion';

export default function Hero() {
  const ref = useRef(null);
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const next = tours[0];

  return (
    <>
      <section className="cine grain" ref={ref}>
        <motion.div className="cine__bg" style={calm ? undefined : { y: bgY }}>
          <Img
            src="/img/hero.jpg"
            alt="Fairy Meadows at first light, with Nanga Parbat behind"
            sizes="100vw"
            priority
            className="kenburns"
          />
        </motion.div>
        <div className="cine__veil" />
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
            <Reveal className="cine__cta" delay={0.62}>
              <BookBtn href={site.wa} pulse>Book on WhatsApp</BookBtn>
              <Magnetic>
                <Link className="btn btn--quiet" href="/tours">
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
          <Reveal as="aside" className="nextvan" delay={0.75} aria-label="Next departure">
            <p className="nextvan__eyebrow"><span className="live__dot" aria-hidden="true" /> Next van out</p>
            <Link href={`/tours/${next.slug}`} className="nextvan__title">{next.title}</Link>
            <p className="nextvan__sub">{next.dates} · {next.days} days · up to {money(next.high)} m</p>
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
            <Stat label="Highest we go" value={4600} sub="metres — Nanga Parbat Base Camp" />
          </dl>
        </div>
      </section>
    </>
  );
}
