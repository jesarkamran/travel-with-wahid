import { destinations, tours, waLink, site } from '@/data/site';
import { PageHeader, Cta, Jsonld } from '@/components/ui';

export const metadata = {
  title: 'Destinations in Northern Pakistan',
  description: 'Kalam, Fairy Meadows, Kumrat, Naran & Saif-ul-Malook, Chitral & Kalash, Ganga Choti — the valleys we run group trips to from Islamabad.',
  alternates: { canonical: '/destinations' },
};

const all = [
  ...tours.map((t) => ({ n: '', name: t.stops[t.stops.length - 1], desc: t.blurb, img: t.img })),
  ...destinations,
];

export default function Destinations() {
  return (
    <>
      <PageHeader
        eyebrow="Where we go"
        title="The north, valley by valley"
        sub="Routes we run again and again, because we know the roads, the hosts and the weather windows. Ask about any of them and I'll send dates and costs."
      />
      <section className="sec">
        <div className="wrap">
          <div className="dests">
            {all.map((d, i) => (
              <a key={d.name} className="dest reveal" href={waLink(`Tell me about ${d.name}`)} rel="noopener" style={{ '--img': `url('/img/tours/${d.img}')` }}>
                <span className="dest__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{d.name}</h3>
                <p>{d.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Cta title="Pick a valley, I'll build the trip." text="Society trips, batch trips, family groups — tell me the dates and the budget." />
      <Jsonld data={{
        '@type': 'ItemList',
        name: 'Destinations in Northern Pakistan',
        itemListElement: all.map((d, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'TouristDestination', name: d.name, description: d.desc, url: `${site.url}/destinations/` },
        })),
      }} />
    </>
  );
}
