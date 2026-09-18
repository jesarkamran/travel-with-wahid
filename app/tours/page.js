import { tours, tripSchema, site, waLink } from '@/data/site';
import { Trip, Close } from '@/components/ui';
import { Jsonld, money } from '@/components/fmt';

export const metadata = {
  title: 'Upcoming Trips & Prices',
  description:
    'Fixed departures from Islamabad: two days to Mahodand Lake from PKR 7,999, and five days to Fairy Meadows and Nanga Parbat Base Camp from PKR 14,999.',
  alternates: { canonical: '/tours' },
};

export default function Tours() {
  return (
    <>
      <section className="mast mistfield" style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="wrap">
          <p className="kicker rise rise-1">Two dates open</p>
          <h1 className="rise rise-2">Every seat we have this season</h1>
          <p className="lede rise rise-3">
            Both trips leave {site.city} at night, so the driving happens while you sleep,
            and both come back to the same pickup point.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(3rem,6vw,5rem)' }}>
        <div className="wrap">
          {tours.map((t) => <Trip key={t.slug} t={t} />)}
          <p style={{ marginTop: 'clamp(3.5rem,6vw,5rem)', textAlign: 'center' }}>
            <span className="muted">Kumrat, Naran, Chitral and Ganga Choti run on request. </span>
            <a href={waLink('Hi Wahid, I want a group date')} rel="noopener" style={{ color: 'var(--gold)' }}>
              Ask for a group date
            </a>
          </p>
        </div>
      </section>

      <Close title="Not the week you needed?" text="New dates open every few weeks, and weather moves the old ones. Ask what is next." />
      <Jsonld data={tours.map(tripSchema)} />
    </>
  );
}
