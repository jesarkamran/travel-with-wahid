import { site } from '@/data/site';
import { Close } from '@/components/ui';

export const metadata = {
  title: 'Contact & Booking',
  description: `Hold a seat or ask about a group trip — WhatsApp ${site.phone}, or join the Travel With Wahid trip group.`,
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <>
      <section className="mast mistfield" style={{ paddingBottom: 'clamp(3rem,6vw,5rem)' }}>
        <div className="wrap">
          <p className="kicker rise rise-1">Contact</p>
          <h1 className="rise rise-2">No forms. Just message.</h1>
          <p className="lede rise rise-3">
            Booking, group trips, or a question about a road — WhatsApp reaches Wahid
            directly, and he answers it himself.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(2.5rem,5vw,4rem)' }}>
        <div className="wrap rows" style={{ maxWidth: '54rem' }}>
          <a href={site.wa} rel="noopener">
            <div><h3>WhatsApp</h3><p>The fastest way to hold a seat or ask anything at all.</p></div>
            <b>{site.phone}</b>
          </a>
          <a href={site.waGroup} rel="noopener">
            <div><h3>The trip group</h3><p>New departures and last-minute seats are posted here first.</p></div>
            <b>Join</b>
          </a>
          <a href={site.instagram} rel="noopener">
            <div><h3>Instagram</h3><p>Photographs and stories from every trip that has run.</p></div>
            <b>@travelwithwahid</b>
          </a>
          <a href={`tel:${site.phone.replace(/\s/g, '')}`}>
            <div><h3>Call</h3><p>{site.city}, Pakistan. Reasonable hours, please.</p></div>
            <b>{site.phone}</b>
          </a>
        </div>
      </section>

      <Close title="Tell us the dates and the headcount." text="You will have a plan back the same day." />
    </>
  );
}
