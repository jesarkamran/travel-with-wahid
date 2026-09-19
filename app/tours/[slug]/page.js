import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tours, site, waLink, tripSchema } from '@/data/site';
import { Close, Img, BookBtn, SeatMap, TripMeta, Itinerary, Included } from '@/components/ui';
import { Jsonld, money } from '@/components/fmt';
import Profile from '@/components/Profile';

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = tours.find((x) => x.slug === slug);
  if (!t) return {};
  return {
    title: `${t.title} — ${t.days} days, PKR ${money(t.price)}`,
    description: `${t.blurb} Leaves ${site.city} ${t.dates}. Highest point ${money(t.high)} m.`,
    alternates: { canonical: `/tours/${t.slug}` },
    openGraph: {
      title: `${t.title}, ${t.dates}`,
      description: t.blurb,
      url: `/tours/${t.slug}`,
      images: [{ url: `/img/tours/${t.img}`, alt: t.title }],
    },
  };
}

export default async function Tour({ params }) {
  const { slug } = await params;
  const t = tours.find((x) => x.slug === slug);
  if (!t) notFound();

  return (
    <>
      <section className="mast mistfield">
        <div className="wrap">
          <p className="crumb rise rise-1">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/tours">Trips</Link>
          </p>
          <p className="kicker rise rise-1">{t.dates}</p>
          <h1 className="rise rise-2">{t.title}</h1>
          <p className="lede rise rise-3">{t.blurb}</p>
          <div className="rise rise-3 mast__meta"><TripMeta t={t} /></div>
        </div>

        <div className="wrap--wide">
          <figure className="hero__frame rise rise-4">
            <Img src={`/img/tours/${t.img}`} alt={`${t.title}, ${t.region}`} sizes="100vw" priority className="kenburns" />
            <figcaption>
              <span>{t.region}</span>
              <span>{money(t.high)} m at its highest</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="sec">
        <div className="wrap detail">
          <div>
            <h2 className="h-sub">The route</h2>
            <p className="muted sub-lede">
              From {site.city} at {money(site.cityM)} m, climbing {money(t.high - site.cityM)} metres
              over {t.days} days. Tap any stop to see what happens there.
            </p>
            <Profile stops={t.profile} tall />

            <h2 className="h-sub">Day by day</h2>
            <Itinerary t={t} />

            <h2 className="h-sub">What the seat covers</h2>
            <Included t={t} />
          </div>

          <aside className="book card">
            <p className="price">PKR {money(t.price)} <small>per person</small></p>
            <p className="book__note">Leaves {t.dates}, back after {t.days} days. The advance holds your seat.</p>
            <SeatMap seats={t.seats} filled={t.filled} />
            <div className="book__cta">
              <BookBtn pulse href={waLink(`Hi Wahid, I want a seat on ${t.title} (${t.dates})`)}>Ask for a seat</BookBtn>
              <a className="btn btn--quiet" href={site.waGroup} rel="noopener">Join the trip group</a>
            </div>
          </aside>
        </div>
      </section>

      <Close title={`Seats held for ${t.dates}.`} />
      <Jsonld data={[
        tripSchema(t),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Trips', item: `${site.url}/tours/` },
            { '@type': 'ListItem', position: 3, name: t.title, item: `${site.url}/tours/${t.slug}/` },
          ],
        },
      ]} />
    </>
  );
}
