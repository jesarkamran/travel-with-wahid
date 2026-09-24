import Link from 'next/link';
import { tours, tripSchema, site } from '@/data/site';
import { Trip, Close } from '@/components/ui';
import { Jsonld } from '@/components/fmt';

export const metadata = {
  title: 'Upcoming Trips & Prices',
  description:
    'Fixed departures from Islamabad: two days to Naran, Kaghan and Babusar Top from PKR 7,999 — transport, a night in Naran, breakfast and dinner included.',
  alternates: { canonical: '/tours' },
};

export default function Tours() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">{tours.length === 1 ? 'One date open' : `${tours.length} dates open`}</p>
          <h1 className="rise rise-2">Every seat we have this season</h1>
          <p className="lede rise rise-3">
            Every trip leaves from {site.city} and brings you back to the same pickup
            points, with transport, a bed and a guide sorted.
          </p>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap">
          <div className="trips">
            {tours.map((t) => <Trip key={t.slug} t={t} />)}
          </div>
          <p className="aside-note">
            <span className="muted">Kumrat, Naran, Chitral and Ganga Choti run on request. </span>
            <Link href="/custom-trip" className="link">Plan a custom trip</Link>
          </p>
        </div>
      </section>

      <Close title="Not the week you needed?" text="New dates open every few weeks, and weather moves the old ones. Ask what is next." />
      <Jsonld data={tours.map(tripSchema)} />
    </>
  );
}
