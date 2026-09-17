import Link from 'next/link';
import { site, tours, destinations, reviews, gallery, credits, faqs, tripSchema, faqSchema, waLink } from '@/data/site';
import { Trip, Valley, Strip, Close, WaIcon, Jsonld, money } from '@/components/ui';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <section className="hero mistfield">
        <div className="wrap hero__in">
          <p className="kicker rise rise-1">Islamabad, and everything north of it</p>
          <h1 className="rise rise-2">Exploring Pakistan <em>&amp; beyond</em></h1>
          <p className="lede rise rise-3">
            Small, unhurried trips into the northern valleys — the van, the beds and the
            food arranged, so all you carry is a warm layer.
          </p>
          <div className="hero__cta rise rise-3">
            <a className="btn" href={site.wa} rel="noopener"><WaIcon className="ico" /> Book on WhatsApp</a>
            <Link className="btn btn--quiet" href="/tours">See upcoming trips</Link>
          </div>
        </div>

        <div className="wrap--wide">
          <figure className="hero__frame rise rise-4">
            <img src="/img/hero.jpg" alt="Fairy Meadows at first light, with Nanga Parbat behind" fetchPriority="high" />
            <figcaption>
              <span>Fairy Meadows, beneath Nanga Parbat</span>
              <span>3,300 m</span>
            </figcaption>
          </figure>

          <dl className="facts">
            <div><dt>Trips leave from</dt><dd>{site.city}</dd></div>
            <div><dt>Seats from</dt><dd>PKR {money(tours[0].price)}</dd></div>
            <div><dt>Group size</dt><dd>One small van</dd></div>
            <div><dt>Highest we go</dt><dd>{money(4600)} m</dd></div>
          </dl>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <header className="head">
            <p className="kicker">Two dates open</p>
            <h2>Trips leaving this August</h2>
            <p className="lede">
              Fixed dates and a fixed price. What you agree before you leave is what the
              trip costs — nothing is added at the last stop.
            </p>
          </header>

          <div style={{ marginTop: 'clamp(3.5rem,7vw,6rem)' }}>
            {tours.map((t) => <Trip key={t.slug} t={t} />)}
          </div>

          <p style={{ marginTop: 'clamp(3.5rem,6vw,5rem)', textAlign: 'center' }}>
            <span className="muted">Planning something for a society or a batch? </span>
            <a href={waLink('Hi Wahid, I want to plan a group trip')} rel="noopener" style={{ color: 'var(--gold)' }}>
              Ask for a group date
            </a>
          </p>
        </div>
      </section>

      <section className="sec--sm">
        <div className="wrap--wide">
          <header className="head center" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)', textAlign: 'center' }}>
            <p className="kicker">Where the van goes</p>
            <h2>Six valleys we know well</h2>
          </header>
          <div className="valleys">
            {destinations.slice(0, 3).map((d) => <Valley key={d.name} d={d} />)}
          </div>
          <p style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link className="btn btn--quiet" href="/destinations">See all six valleys</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap--wide">
          <header className="head" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)' }}>
            <p className="kicker">Photographs</p>
            <h2>What it looks like up there</h2>
          </header>
          <Strip items={gallery} />
          <p className="muted" style={{ fontSize: '.82rem', marginTop: '1.4rem' }}>
            Photographs by {credits[0].by} and others, used under Creative Commons.{' '}
            <Link href="/about" style={{ color: 'var(--sage-deep)' }}>Full credits</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div>
            <p className="kicker">Why travel with Wahid</p>
            <h2>One person, start to finish</h2>
            <p className="lede" style={{ marginTop: '1.2rem' }}>
              There is no office and no call centre. You message one person, that person
              replies, and that person is in the van with you the whole way.
            </p>
            <a className="btn" href={site.waGroup} rel="noopener" style={{ marginTop: '1.8rem' }}>
              Join the trip group
            </a>
          </div>
          <ul className="reasons">
            <li>
              <span className="line" />
              <h3>The price you are quoted</h3>
              <p>Everything a seat covers is written on the trip page. No surprise jeep fare, no room upgrade halfway up the valley.</p>
            </li>
            <li>
              <span className="line" />
              <h3>Room to breathe</h3>
              <p>Seats are capped so nobody rides squeezed and nobody waits forty minutes at every stop.</p>
            </li>
            <li>
              <span className="line" />
              <h3>Roads already driven</h3>
              <p>Kalam, Fairy Meadows, Kumrat, Kalash — run often enough to know which stretch to take at first light.</p>
            </li>
            <li>
              <span className="line" />
              <h3>One number throughout</h3>
              <p>{site.phone} is the same line for booking, for questions at 2am on the road, and for the photographs afterwards.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="sec on-pine">
        <div className="wrap">
          <header className="head" style={{ marginBottom: 'clamp(2.5rem,5vw,3.5rem)' }}>
            <p className="kicker">From people who came</p>
            <h2>Trips, in their words</h2>
          </header>
          <div className="quotes">
            {reviews.map((r) => (
              <figure key={r.by} className="quote">
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.by}<em>{r.trip}</em></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Close />
      <Jsonld data={[...tours.map(tripSchema), faqSchema(faqs)]} />
    </>
  );
}
