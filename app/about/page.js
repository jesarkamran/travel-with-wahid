import { site } from '@/data/site';
import { PageHeader, Cta } from '@/components/ui';

export const metadata = {
  title: 'About',
  description: 'Travel With Wahid organizes small, affordable student trips from Islamabad to the Northern Areas of Pakistan.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="One person, a van, and a lot of mountain roads" />
      <section className="sec">
        <div className="wrap why">
          <div className="prose reveal">
            <p>Travel With Wahid started the way most good trips do — a few friends, a rented van, and a plan made the night before. It turned into fixed departures because people kept asking to come along.</p>
            <p>The idea has not changed since. Trips are priced for students, groups are kept small enough to actually move, and the person who plans the trip is the person sitting on the bus with you. When the weather closes a pass or a road is out, you hear it from him directly, not from a form on a website.</p>
            <p>Everything runs out of {site.city}. Departures head north to Swat and Kalam, up the Karakoram Highway to Fairy Meadows, across to Kumrat and Naran, and out to Chitral and the Kalash valleys.</p>
            <p>If you have been thinking about the north and waiting for someone to handle the logistics — that is the whole job.</p>
          </div>
          <ul className="feats">
            <li className="reveal"><span className="feats__i">📍</span><h3>Based in {site.city}</h3><p>Every departure starts here, with pickup points shared before the trip.</p></li>
            <li className="reveal"><span className="feats__i">🎓</span><h3>Student-first</h3><p>Dates planned around semesters, prices planned around student budgets.</p></li>
            <li className="reveal"><span className="feats__i">🤝</span><h3>Direct contact</h3><p>{site.phone} — the same number before, during and after the trip.</p></li>
            <li className="reveal"><span className="feats__i">📸</span><h3>See it first</h3><p>Every trip is documented on Instagram, so you know what you are signing up for.</p></li>
          </ul>
        </div>
      </section>
      <Cta />
    </>
  );
}
