import Link from 'next/link';
import { site } from '@/data/site';
import Mark from './Mark';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__in">
        <div>
          <Link className="brand brand--foot" href="/">
            <Mark className="brand__mark" ring={false} />
            <span className="brand__txt">Travel<em>With</em>Wahid</span>
          </Link>
          <p className="foot__bio">{site.bio}</p>
        </div>
        <nav className="foot__nav" aria-label="Footer">
          <h3>Explore</h3>
          <Link href="/tours">Upcoming tours</Link>
          <Link href="/destinations">Destinations</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="foot__nav">
          <h3>Reach us</h3>
          <a href={site.wa} rel="noopener">WhatsApp · {site.phone}</a>
          <a href={site.waGroup} rel="noopener">Join the WhatsApp group</a>
          <a href={site.instagram} rel="noopener">Instagram · @travelwithwahid</a>
        </div>
      </div>
      <div className="wrap foot__bar">
        <p>© {new Date().getFullYear()} {site.name}. {site.city}, Pakistan.</p>
        <p>Trips subject to weather and road conditions.</p>
      </div>
    </footer>
  );
}
