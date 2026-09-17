import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tours, site, waLink, tripSchema } from '@/data/site';
import { Close, Jsonld, WaIcon, money } from '@/components/ui';
import Profile from '@/components/Profile';

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }) {
  const t = tours.find((x) => x.slug === params.slug);
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

export default function Tour({ params }) {
  const t = tours.find((x) => x.slug === params.slug);
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
        </div>

        <div className="wrap--wide">
          <figure className="hero__frame rise rise-4" style={{ aspectRatio: '21/9' }}>
            <img src={`/img/tours/${t.img}`} alt={`${t.title}, ${t.region}`} fetchPriority="high" />
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
            <h2 style={{ fontSize: 'clamp(1.8rem,1.4rem + 1.4vw,2.6rem)' }}>The route</h2>
            <p className="muted" style={{ marginTop: '.9rem', maxWidth: '52ch' }}>
              From {site.city} at {money(site.cityM)} m, climbing {money(t.high - site.cityM)} metres
              over {t.days} days.
            </p>
            <Profile stops={t.profile} tall />

            <h2 style={{ fontSize: 'clamp(1.8rem,1.4rem + 1.4vw,2.6rem)', marginTop: 'clamp(2.5rem,5vw,4rem)' }}>
              Day by day
            </h2>
            <ol className="days">
              {t.itinerary.map((d) => (
                <li key={d.day}>
                  <b>Day {d.day}</b>
                  <p>{d.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="book">
            <p className="price">PKR {money(t.price)} <small>per person</small></p>
            <p className="book__note">Leaves {t.dates}, back after {t.days} days. The advance holds your seat.</p>
            <a className="btn" href={waLink(`Hi Wahid, I want a seat on ${t.title} (${t.dates})`)} rel="noopener">
              <WaIcon className="ico" /> Ask for a seat
            </a>
            <a className="btn btn--quiet" href={site.waGroup} rel="noopener">Join the trip group</a>

            <h4>Your seat covers</h4>
            <ul className="ticks">{t.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            <h4>Not included</h4>
            <ul className="ticks ticks--no">{t.excludes.map((i) => <li key={i}>{i}</li>)}</ul>
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
