import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="nf mistfield">
      <div className="wrap">
        <p className="kicker">404</p>
        <h1>This road does not go anywhere</h1>
        <p>The page moved, or never existed. The valleys are still where we left them.</p>
        <Link className="btn" href="/tours">See upcoming trips</Link>
      </div>
    </section>
  );
}
