import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="nf wrap">
      <div>
        <p className="eyebrow eyebrow--dark">404</p>
        <h1>This road doesn&apos;t go anywhere.</h1>
        <p className="sec__sub">The page moved or never existed. The valleys, though, are still where we left them.</p>
        <Link className="btn" href="/tours">Browse upcoming tours</Link>
      </div>
    </section>
  );
}
