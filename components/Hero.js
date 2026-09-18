'use client';
/* The hero is the whole pitch: a valley at first light, the numbers that make
   the trip legible, and one button. Everything else on the page is detail. */
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { site, tours } from '@/data/site';
import { BookBtn, Img, Stat, money } from './ui';
import { Magnetic, MaskLine, Reveal } from './motion';

export default function Hero() {
  const ref = useRef(null);
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

        <div className="wrap cine__in">
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
            <BookBtn href={site.wa}>Book on WhatsApp</BookBtn>
            <Magnetic>
              <Link className="btn btn--quiet" href="/tours">See upcoming trips</Link>
            </Magnetic>
          </Reveal>
        </div>

        <motion.p className="scroll-hint" style={calm ? undefined : { opacity: fade }} aria-hidden="true">
          <i />
          <ChevronDown size={14} />
        </motion.p>
      </section>

      <section className="sec--sm" style={{ paddingTop: 0 }}>
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
