import Link from 'next/link';
import { tours, site } from '@/data/site';
import { Close, TripMeta, SeatMap } from '@/components/ui';
import { money } from '@/components/fmt';
import BookingTabs from '@/components/BookingTabs';

export const metadata = {
  title: 'Hold a Seat',
  description:
    'Log your advance and hold a seat on the next trip out of Islamabad. Attach the payment receipt and Wahid confirms by hand.',
  alternates: { canonical: '/book' },
};

/* One trip runs at a time, so this books the next departure rather than asking
   which. If that changes, the form takes any trip — pass a different one. */
export default function Book() {
  const trip = tours[0];

  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="crumb rise rise-1">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/tours">Trips</Link>
          </p>
          <p className="kicker rise rise-2">Booking</p>
          <h1 className="rise rise-2">Hold a seat.</h1>
          <p className="lede rise rise-3">
            Send the advance on WhatsApp, then log it here. Your email is the reference —
            use the same one next time and we will know it is you, and come back any time
            to check where a booking has got to.
          </p>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap book-grid">
          <BookingTabs trip={trip} />

          <aside className="book-side card">
            <p className="kicker">The trip you are joining</p>
            <h2 className="book-side__title">
              <Link href={`/tours/${trip.slug}`}>{trip.title}</Link>
            </h2>
            <TripMeta t={trip} />
            <p className="price">PKR {money(trip.price)} <small>per person</small></p>
            <SeatMap seats={trip.seats ?? site.seatsPerVan} filled={trip.filled ?? 0} slug={trip.slug} compact />
            <ol className="book-side__how">
              <li>Send the advance on WhatsApp.</li>
              <li>Fill this in and attach the receipt.</li>
              <li>Wahid confirms — usually the same day.</li>
              <li>Pickup points go out in the trip group.</li>
            </ol>
            <p className="muted">
              Going as a group on your own dates?{' '}
              <Link href="/custom-trip" className="link">Plan a custom trip</Link>
            </p>
          </aside>
        </div>
      </section>

      <Close title={`Seats held for ${trip.dates}.`} />
    </>
  );
}
