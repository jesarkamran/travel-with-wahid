import { site, credits } from '@/data/site';
import { Close } from '@/components/ui';

export const metadata = {
  title: 'About',
  description:
    'Travel With Wahid is one person in Islamabad filling a small van and driving students north. No office, no call centre.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">About</p>
          <h1 className="rise rise-2">One person, one van, a lot of mountain road</h1>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap split">
          <div className="prose">
            <p>
              Travel With Wahid started the way most good trips do — a few friends, a rented
              van, and a plan made the night before. It became fixed departures because
              people kept asking to come along.
            </p>
            <p>
              The idea has not changed. Seats are priced for students, the van is kept small
              enough to actually move, and the person who plans the trip is the person
              sitting in it. When a pass closes or a road washes out, you hear it from him
              directly rather than from a form on a website.
            </p>
            <p>
              Everything runs out of {site.city}, at {site.cityM} metres. From there the
              routes go north to Swat and Kalam, up the Karakoram Highway to the Raikot
              track, across to Kumrat and Naran, and over the Lowari to Chitral and the
              Kalash valleys.
            </p>
            <p>
              If you have been meaning to go north and waiting for someone to handle the
              logistics — that is the whole job.
            </p>
          </div>

          <div className="rows">
            <a href={site.wa} rel="noopener">
              <div><h3>Ask Wahid anything</h3><p>The same number for booking, for the road, and for photographs afterwards.</p></div>
              <b>{site.phone}</b>
            </a>
            <a href={site.waGroup} rel="noopener">
              <div><h3>The trip group</h3><p>New dates and last-minute seats are posted here first.</p></div>
              <b>WhatsApp</b>
            </a>
            <a href={site.instagram} rel="noopener">
              <div><h3>Every trip, photographed</h3><p>See what you are signing up for before you pay.</p></div>
              <b>Instagram</b>
            </a>
          </div>
        </div>
      </section>

      <section className="sec--sm">
        <div className="wrap">
          <h2 className="h-sub">Photographs</h2>
          <p className="muted sub-lede">
            The trip photographs here are Creative Commons work by people who shot these
            valleys before us. Credit is a condition of using them, so here it is.
          </p>
          <ul className="creds">
            {credits.map((c) => (
              <li key={c.file}>
                <a href={c.source} rel="noopener nofollow">{c.title}</a>, {c.by},{' '}
                <a href={c.licenseUrl} rel="noopener nofollow">{c.license}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Close />
    </>
  );
}
