import { tours, tripSchema, site, waLink } from '@/data/site';
import { Trip, Close } from '@/components/ui';
import { Jsonld } from '@/components/fmt';

export const metadata = {
  title: 'Upcoming Trips & Prices',
  description:
    'Fixed departures from Islamabad: two days up the Neelum valley to Arang Kel from PKR 7,999 — van, a night in a hut and breakfast both days included.',
  alternates: { canonical: '/tours' },
};

export default function Tours() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">Two dates open</p>
          <h1 className="rise rise-2">Every seat we have this season</h1>
          <p className="lede rise rise-3">
            Both trips leave {site.city} at night, so the driving happens while you sleep,
            and both come back to the same pickup point.
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
            <a href={waLink('Hi Wahid, I want a group date')} rel="noopener" className="link">
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
