import Link from 'next/link';
import { site } from '@/data/site';
import Mark from './Mark';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__in">
          <div>
            <Link className="brand" href="/">
              <Mark />
              <span className="brand__txt">Travel with Wahid</span>
            </Link>
            <p className="foot__bio">{site.bio} Every trip leaves from {site.city} and comes back to it.</p>
          </div>
          <nav aria-label="Footer">
            <h4>Travel</h4>
            <Link href="/tours">Upcoming trips</Link>
            <Link href="/destinations">Valleys</Link>
            <Link href="/about">About</Link>
            <Link href="/faq">Questions</Link>
          </nav>
          <nav aria-label="Contact">
            <h4>Get in touch</h4>
            <a href={site.wa} rel="noopener">WhatsApp {site.phone}</a>
            <a href={site.waGroup} rel="noopener">Join the trip group</a>
            <a href={site.instagram} rel="noopener">Instagram</a>
          </nav>
        </div>
        <div className="foot__bar">
          <p>© {new Date().getFullYear()} {site.name}, {site.city}.</p>
          <p>Mountain roads close without notice. Dates move when they do.</p>
        </div>
      </div>
    </footer>
  );
}
