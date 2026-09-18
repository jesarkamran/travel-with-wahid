import Link from 'next/link';
import { site, tours, destinations, reviews, gallery, credits, faqs, tripSchema, faqSchema, waLink } from '@/data/site';
import { Trip, Deck, Strip, Quotes, Reasons, Close } from '@/components/ui';
import { Jsonld } from '@/components/fmt';
import { Reveal } from '@/components/motion';
import Hero from '@/components/Hero';

export const metadata = { alternates: { canonical: '/' } };

const reasons = [
  { h: 'The price you are quoted', p: 'Everything a seat covers is written on the trip page. No surprise jeep fare, no room upgrade halfway up the valley.' },
  { h: 'Room to breathe', p: 'Seats are capped so nobody rides squeezed and nobody waits forty minutes at every stop.' },
  { h: 'Roads already driven', p: 'Kalam, Fairy Meadows, Kumrat, Kalash — run often enough to know which stretch to take at first light.' },
  { h: 'One number throughout', p: `${site.phone} is the same line for booking, for questions at 2am on the road, and for the photographs afterwards.` },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="sec">
        <div className="wrap">
          <Reveal as="header" className="head">
            <p className="kicker">Two dates open</p>
            <h2>Trips leaving this August</h2>
            <p className="lede">
              Fixed dates and a fixed price. What you agree before you leave is what the
              trip costs — nothing is added at the last stop.
            </p>
          </Reveal>

          <div style={{ marginTop: 'clamp(3.5rem,7vw,6rem)' }}>
            {tours.map((t) => <Trip key={t.slug} t={t} />)}
          </div>

          <Reveal as="p" style={{ marginTop: 'clamp(3.5rem,6vw,5rem)', textAlign: 'center' }}>
            <span className="muted">Planning something for a society or a batch? </span>
            <a href={waLink('Hi Wahid, I want to plan a group trip')} rel="noopener" style={{ color: 'var(--gold)' }}>
              Ask for a group date
            </a>
          </Reveal>
        </div>
      </section>

      <section className="sec--sm">
        <div className="wrap--wide">
          <Reveal as="header" className="head center" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)', textAlign: 'center' }}>
            <p className="kicker">Where the van goes</p>
            <h2>Valleys we know well</h2>
          </Reveal>
          <Deck items={destinations.slice(0, 3)} />
          <p style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link className="btn btn--quiet" href="/destinations">See all six valleys</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap--wide">
          <Reveal as="header" className="head" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)' }}>
            <p className="kicker">Photographs</p>
            <h2>What it looks like up there</h2>
          </Reveal>
          <Strip items={gallery} />
          <p className="muted" style={{ fontSize: '.82rem', marginTop: '1.4rem' }}>
            Photographs by {credits[0].by} and others, used under Creative Commons.{' '}
            <Link href="/about" style={{ color: 'var(--gold)' }}>Full credits</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <Reveal>
            <p className="kicker">Why travel with Wahid</p>
            <h2>One person, start to finish</h2>
            <p className="lede" style={{ marginTop: '1.2rem' }}>
              There is no office and no call centre. You message one person, that person
              replies, and that person is in the van with you the whole way.
            </p>
            <a className="btn" href={site.waGroup} rel="noopener" style={{ marginTop: '1.8rem' }}>
              Join the trip group
            </a>
          </Reveal>
          <Reasons items={reasons} />
        </div>
      </section>

      <section className="sec on-pine grain">
        <div className="wrap">
          <Reveal as="header" className="head" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)' }}>
            <p className="kicker">From people who came</p>
            <h2>Trips, in their words</h2>
          </Reveal>
        </div>
        <Quotes items={reviews} />
      </section>

      <Close />
      <Jsonld data={[...tours.map(tripSchema), faqSchema(faqs)]} />
    </>
  );
}
