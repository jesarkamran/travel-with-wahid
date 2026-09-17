import { site } from '@/data/site';
import { PageHeader, Cta } from '@/components/ui';

export const metadata = {
  title: 'Contact & Booking',
  description: `Book a seat or ask about custom group trips — WhatsApp ${site.phone}, or join the Travel With Wahid group.`,
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="No forms. Just message."
        sub="Booking, custom group trips, or a question about a route — WhatsApp is the fastest way to reach us."
      />
      <section className="sec">
        <div className="wrap">
          <div className="contacts">
            <a href={site.wa} rel="noopener">
              <h3>WhatsApp</h3><p>{site.phone} — booking, questions, anything.</p>
            </a>
            <a href={site.waGroup} rel="noopener">
              <h3>Trip group</h3><p>New departures and last-minute seats get posted here first.</p>
            </a>
            <a href={site.instagram} rel="noopener">
              <h3>Instagram</h3><p>@travelwithwahid — photos and stories from every trip.</p>
            </a>
            <a href={`tel:${site.phone.replace(/\s/g, '')}`}>
              <h3>Call</h3><p>{site.phone} · {site.city}, Pakistan.</p>
            </a>
          </div>
        </div>
      </section>
      <Cta title="Ready when you are." text="Tell us the dates and the group size — you'll have a plan back the same day." />
    </>
  );
}
