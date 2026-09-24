import { destinations, tours, site } from '@/data/site';
import { Valley, Close } from '@/components/ui';
import { Jsonld } from '@/components/fmt';

export const metadata = {
  title: 'Valleys We Travel To',
  description:
    'Naran, Kaghan and Babusar Top, Kumrat, Saif-ul-Malook, the Kalash valleys and Ganga Choti — the routes Travel With Wahid runs out of Islamabad.',
  alternates: { canonical: '/destinations' },
};

const all = [
  ...tours.map((t) => ({
    name: t.profile[t.profile.length - 1].name,
    region: t.region,
    high: t.high,
    note: t.blurb,
    img: t.img,
  })),
  ...destinations,
];

export default function Destinations() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">Where we go</p>
          <h1 className="rise rise-2">{all.length} valleys out of Islamabad</h1>
          <p className="lede rise rise-3">
            These are roads we already know — which stretch washes out, who keeps the rooms,
            and when the pass opens. Ask about any of them.
          </p>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap--wide">
          <div className="valleys">
            {[...all].sort((a, b) => b.high - a.high).map((d) => <Valley key={d.name} d={d} />)}
          </div>
        </div>
      </section>

      <Close title="Name a valley and a week." text="Group dates are built around what you pick, not the other way round." />
      <Jsonld data={{
        '@type': 'ItemList',
        name: 'Northern Pakistan valleys served by Travel With Wahid',
        itemListElement: all.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@type': 'TouristDestination', name: d.name, description: d.note, url: `${site.url}/destinations/` },
        })),
      }} />
    </>
  );
}
