import Link from 'next/link';
import { site, tours, destinations, reviews, waLink, faqs, tripSchema, faqSchema } from '@/data/site';
import { TourCard, CustomTripCard, Cta, Jsonld, WaIcon } from '@/components/ui';

export const metadata = {
  alternates: { canonical: '/' },
};

const ticker = ['Kalam', 'Fairy Meadows', 'Naran', 'Kumrat', 'Chitral', 'Kalash', 'Ganga Choti', 'Mahodand Lake'];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__art" aria-hidden="true">
          <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A1720" /><stop offset="48%" stopColor="#123642" />
                <stop offset="82%" stopColor="#2E5C60" /><stop offset="100%" stopColor="#5E7F72" />
              </linearGradient>
              <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#25525C" /><stop offset="100%" stopColor="#16333D" /></linearGradient>
              <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18404A" /><stop offset="100%" stopColor="#0E262F" /></linearGradient>
              <radialGradient id="glow" cx="72%" cy="42%" r="34%">
                <stop offset="0%" stopColor="#E8A33D" stopOpacity=".55" /><stop offset="100%" stopColor="#E8A33D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1440" height="760" fill="url(#sky)" />
            <rect width="1440" height="760" fill="url(#glow)" />
            <circle cx="1037" cy="320" r="46" fill="#F0B75C" opacity=".92" />
            <path d="M0 470 L190 300 L300 392 L430 250 L560 430 L690 340 L820 470 L1440 470 L1440 760 L0 760 Z" fill="url(#r1)" opacity=".85" />
            <path d="M430 250 L378 322 L430 300 L472 328 Z" fill="#DCE9E6" opacity=".9" />
            <path d="M190 300 L152 356 L190 340 L226 360 Z" fill="#DCE9E6" opacity=".7" />
            <path d="M0 560 L160 452 L300 540 L470 400 L640 545 L800 470 L980 580 L1160 490 L1440 600 L1440 760 L0 760 Z" fill="url(#r2)" />
            <path d="M0 668 L240 620 L520 672 L760 628 L1040 688 L1440 640 L1440 760 L0 760 Z" fill="#0A1C23" />
          </svg>
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="wrap hero__in">
          <p className="eyebrow reveal">📍 {site.city} · Pakistan</p>
          <h1 className="reveal">Exploring Pakistan<br /><em>&amp; Beyond</em></h1>
          <p className="lede reveal">Student trips to the Northern Areas — planned properly, priced honestly and run by someone who actually goes on every single one.</p>
          <div className="hero__cta reveal">
            <a className="btn btn--wa" href={site.wa} rel="noopener"><WaIcon className="ico" /> Book on WhatsApp</a>
            <Link className="btn btn--ghost" href="/tours">See upcoming tours</Link>
          </div>
          <dl className="stats reveal">
            <div><dt>From</dt><dd>PKR 7,999</dd></div>
            <div><dt>Groups</dt><dd>Small &amp; student-friendly</dd></div>
            <div><dt>Departs</dt><dd>{site.city}</dd></div>
          </dl>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__row">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>{t}<span> ✦ </span></span>
          ))}
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <header className="sec__head reveal">
            <p className="eyebrow eyebrow--dark">Upcoming tours</p>
            <h2>Seats open right now</h2>
            <p className="sec__sub">Fixed departures, fixed prices, no hidden add-ons at the last stop. Groups are kept small, so seats go fast.</p>
          </header>
          <div className="tours">
            {tours.map((t) => <TourCard key={t.slug} t={t} />)}
            <CustomTripCard />
          </div>
        </div>
      </section>

      <section className="sec sec--dark">
        <div className="wrap">
          <header className="sec__head reveal">
            <p className="eyebrow">Where we go</p>
            <h2>The north, valley by valley</h2>
            <p className="sec__sub">Routes we run again and again, because we know the roads, the hosts and the weather windows.</p>
          </header>
          <div className="dests">
            {destinations.map((d) => (
              <a key={d.name} className="dest reveal" href={waLink(`Tell me about ${d.name}`)} rel="noopener" style={{ '--img': `url('/img/tours/${d.img}')` }}>
                <span className="dest__n">{d.n}</span><h3>{d.name}</h3><p>{d.desc}</p>
              </a>
            ))}
          </div>
          <p className="sec__sub reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link className="btn btn--ghost" href="/destinations">All destinations</Link>
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap why">
          <div className="why__intro reveal">
            <p className="eyebrow eyebrow--dark">Why travel with Wahid</p>
            <h2>Trips built for student budgets, not tourist traps</h2>
            <p className="sec__sub">No agency call centre. You message one person, that person answers, and that person is on the bus with you.</p>
            <a className="btn" href={site.waGroup} rel="noopener">Join the WhatsApp group</a>
          </div>
          <ul className="feats">
            <li className="reveal"><span className="feats__i">₨</span><h3>Honest pricing</h3><p>What&apos;s included is listed on the tour page. No surprise jeep fare or room upgrade halfway up the valley.</p></li>
            <li className="reveal"><span className="feats__i">◎</span><h3>Small groups</h3><p>Seats are capped so the van isn&apos;t packed and nobody waits an hour at every stop.</p></li>
            <li className="reveal"><span className="feats__i">⛰</span><h3>Routes we know</h3><p>Kalam, Fairy Meadows, Kumrat, Kalash — repeated trips mean tested drivers, stays and timings.</p></li>
            <li className="reveal"><span className="feats__i">✆</span><h3>One person, always reachable</h3><p>Before, during and after the trip you have a direct WhatsApp line, not a ticket number.</p></li>
          </ul>
        </div>
      </section>

      <section className="sec sec--paper">
        <div className="wrap">
          <header className="sec__head reveal">
            <p className="eyebrow eyebrow--dark">From the group</p>
            <h2>What travellers say</h2>
          </header>
          <div className="quotes">
            {reviews.map((r) => (
              <figure key={r.by} className="quote reveal">
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.by}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Cta />
      <Jsonld data={[...tours.map(tripSchema), faqSchema(faqs)]} />
    </>
  );
}
