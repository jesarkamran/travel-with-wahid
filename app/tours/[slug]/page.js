import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tours, site, waLink, tripSchema } from '@/data/site';
import { Cta, Jsonld, WaIcon, Ph, Pin } from '@/components/ui';

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }) {
  const t = tours.find((x) => x.slug === params.slug);
  if (!t) return {};
  return {
    title: `${t.title} — ${t.duration}, PKR ${t.price.toLocaleString('en-US')}`,
    description: `${t.blurb} Departs ${site.city} ${t.dates}.`,
    alternates: { canonical: `/tours/${t.slug}` },
    openGraph: {
      title: `${t.title} · ${t.duration}`,
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
      <section className="phead">
        <div className="wrap">
          <nav className="crumbs reveal" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span>/</span> <Link href="/tours">Tours</Link> <span>/</span> <span>{t.title}</span>
          </nav>
          <h1 className="reveal">{t.title}</h1>
          <p className="lede reveal">{t.blurb}</p>
          <div className="phead__meta reveal">
            <div><span>Dates</span><strong>{t.dates}</strong></div>
            <div><span>Duration</span><strong>{t.duration}</strong></div>
            <div><span>Departs</span><strong>{site.city}</strong></div>
            <div><span>Price</span><strong>PKR {t.price.toLocaleString('en-US')}</strong></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap trip">
          <div>
            <figure className="trip__hero reveal" style={{ margin: 0 }}>
              <Ph src={`/img/tours/${t.img}`} alt={`${t.title} — ${t.region}`} priority sizes="(max-width:900px) 100vw, 700px" />
              <span className="scrim" aria-hidden="true" />
              <figcaption>
                <strong>{t.stops[t.stops.length - 1]}</strong>
                <span className="plabel plabel--bare"><Pin /> {t.region}</span>
              </figcaption>
            </figure>
            <h2 className="reveal">Day by day</h2>
            <ol className="days reveal" style={{ marginTop: '1.8rem' }}>
              {t.itinerary.map((d) => (
                <li key={d.day}><h3>{d.day}</h3><p>{d.text}</p></li>
              ))}
            </ol>
            <h2 className="reveal" style={{ marginTop: '2rem' }}>Stops on this route</h2>
            <ul className="incl reveal" style={{ marginTop: '1rem' }}>
              {t.stops.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <aside className="book reveal">
            <p className="price"><span>PKR</span> {t.price.toLocaleString('en-US')} <small>/ person</small></p>
            <p className="book__note">Advance confirms your seat · {t.duration} · {t.dates}</p>
            <a className="btn btn--wa" href={waLink(`Hi Wahid, I'd like to book ${t.title} (${t.dates})`)} rel="noopener"><WaIcon className="ico" /> Reserve on WhatsApp</a>
            <a className="btn btn--light" href={site.waGroup} rel="noopener">Join the group</a>
            <h4>Included</h4>
            <ul className="ticks">{t.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            <h4>Not included</h4>
            <ul className="ticks ticks--no">{t.excludes.map((i) => <li key={i}>{i}</li>)}</ul>
          </aside>
        </div>
      </section>

      <Cta title={`Holding seats for ${t.dates}.`} />
      <Jsonld data={[
        tripSchema(t),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Tours', item: `${site.url}/tours/` },
            { '@type': 'ListItem', position: 3, name: t.title, item: `${site.url}/tours/${t.slug}/` },
          ],
        },
      ]} />
    </>
  );
}
