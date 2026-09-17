import { tours, tripSchema } from '@/data/site';
import { PageHeader, TourCard, CustomTripCard, Cta, Jsonld } from '@/components/ui';

export const metadata = {
  title: 'Upcoming Tours & Prices',
  description: 'Fixed-departure group tours from Islamabad: Kalam & Mahodand Lake from PKR 7,999 and Fairy Meadows & Nanga Parbat Base Camp from PKR 14,999.',
  alternates: { canonical: '/tours' },
};

export default function Tours() {
  return (
    <>
      <PageHeader
        eyebrow="Upcoming tours"
        title="Every departure, every price, in one place"
        sub="Fixed dates, fixed costs, small groups. What's included is listed on each tour — nothing gets added at the last stop."
      />
      <section className="sec">
        <div className="wrap">
          <div className="tours">
            {tours.map((t) => <TourCard key={t.slug} t={t} />)}
            <CustomTripCard />
          </div>
        </div>
      </section>
      <Cta title="Seat not listed? Ask anyway." text="Dates shift with the weather and new departures open every few weeks. Message and I'll tell you what's next." />
      <Jsonld data={tours.map(tripSchema)} />
    </>
  );
}
