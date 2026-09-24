import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { site, tours, nextDeparture, destinations, reviews, gallery, credits, faqs, steps, tripSchema, faqSchema } from '@/data/site';
import { Trip, Deck, Strip, Quotes, Reasons, Close, Faq, Steps, SectionHead } from '@/components/ui';
import { Jsonld } from '@/components/fmt';
import { Reveal } from '@/components/motion';
import Hero from '@/components/Hero';

export const metadata = { alternates: { canonical: '/' } };

const reasons = [
  { h: 'The price you are quoted', p: 'Everything a seat covers is written on the trip. No surprise jeep fare, no room upgrade halfway up the valley.' },
  { h: 'Room to breathe', p: 'Seats are capped so nobody rides squeezed and nobody waits forty minutes at every stop.' },
  { h: 'Roads already driven', p: 'The Neelum valley, Kumrat, Kalash — run often enough to know which stretch to take at first light.' },
  { h: 'One number throughout', p: `${site.phone} is the same line for booking, for questions at 2am on the road, and for the photographs afterwards.` },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Trips — every detail of a departure lives on its card */}
      <section className="sec" id="trips">
        <div className="wrap">
          <SectionHead
            eyebrow={`${tours.length === 1 ? 'One date' : `${tours.length} dates`} open`}
            title={`Trips leaving this ${nextDeparture.month}`}
            lede="Fixed dates and a fixed price. Open a trip's route, its days and what the seat covers — all right here."
            action={<Link className="btn btn--sm btn--quiet" href="/tours">All trips <ArrowRight size={15} className="arr" aria-hidden="true" /></Link>}
          />
          <div className="trips">
            {tours.map((t) => <Trip key={t.slug} t={t} />)}
          </div>
          <Reveal as="p" className="aside-note">
            <span className="muted">Planning something for a society or a batch? </span>
            <Link href="/custom-trip" className="link">Plan a custom trip</Link>
          </Reveal>
        </div>
      </section>

      <section className="sec sec--tint">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="Four steps to the mountains" center />
          <Steps items={steps} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap--wide">
          <SectionHead
            eyebrow="Where we go"
            title="Valleys we know well"
            action={<Link className="btn btn--sm btn--quiet" href="/destinations">All {destinations.length + tours.length} valleys <ArrowRight size={15} className="arr" aria-hidden="true" /></Link>}
          />
          <Deck items={destinations.slice(0, 3)} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap--wide">
          <SectionHead eyebrow="Photographs" title="What it looks like up there" />
          <Strip items={gallery} />
          <p className="muted fine">
            Photographs by {credits[0].by} and others, used under Creative Commons.{' '}
            <Link href="/about" className="link">Full credits</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <Reveal className="split__lead">
            <p className="kicker">Why travel with Wahid</p>
            <h2>Planned, managed and booked for you</h2>
            <p className="lede">
              Routes, transport, stays and bookings are handled end to end — fixed departures
              or a custom trip for your group, with support from the first message to the
              drive home.
            </p>
            <a className="btn" href={site.waGroup} rel="noopener">
              Join the trip group <ArrowRight size={16} className="arr" aria-hidden="true" />
            </a>
          </Reveal>
          <Reasons items={reasons} />
        </div>
      </section>

      <section className="sec on-pine grain">
        <div className="wrap">
          <SectionHead eyebrow="From people who came" title="Trips, in their words" />
        </div>
        <Quotes items={reviews} />
      </section>

      <section className="sec">
        <div className="wrap split">
          <SectionHead
            className="split__lead"
            eyebrow="Before you book"
            title="Questions people ask"
            lede={`Not here? Message ${site.phone} — replies usually land the same day.`}
            action={<Link className="btn btn--sm btn--quiet" href="/faq">All questions <ArrowRight size={15} className="arr" aria-hidden="true" /></Link>}
          />
          <Faq list={faqs.slice(0, 4)} />
        </div>
      </section>

      <Close />
      <Jsonld data={[...tours.map(tripSchema), faqSchema(faqs)]} />
    </>
  );
}
