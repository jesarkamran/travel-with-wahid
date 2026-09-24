import Link from 'next/link';
import { Close } from '@/components/ui';
import CustomTripForm from '@/components/CustomTripForm';

export const metadata = {
  title: 'Plan a Custom Trip',
  description:
    'Request a custom trip to northern Pakistan for your friends, family, society or team — your destination, your dates, your group. Wahid plans it and sends a price.',
  alternates: { canonical: '/custom-trip' },
};

export default function CustomTrip() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="crumb rise rise-1">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/book">Booking</Link>
          </p>
          <p className="kicker rise rise-2">Custom trip</p>
          <h1 className="rise rise-2">Your group, your dates.</h1>
          <p className="lede rise rise-3">
            Tell us where you want to go, when, and how many of you. We plan the route,
            the transport and the stays, and send you a price.
          </p>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap book-grid">
          <CustomTripForm />

          <aside className="book-side card">
            <p className="kicker">How a custom trip works</p>
            <ol className="book-side__how">
              <li>Send the request — it is filed under your email as requested.</li>
              <li>Wahid plans it and sends a route and a price on WhatsApp.</li>
              <li>Once he approves it, the status changes to approved.</li>
              <li>Pay the advance and the trip is yours.</li>
            </ol>
            <p className="muted">
              Check where your request is any time on{' '}
              <Link href="/book?check" className="link">Check a booking</Link>.
            </p>
          </aside>
        </div>
      </section>

      <Close />
    </>
  );
}
