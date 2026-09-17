import Link from 'next/link';
import { site, waLink } from '@/data/site';

export const Pin = () => (
  <svg viewBox="0 0 24 24" className="pin" aria-hidden="true">
    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

export const Jsonld = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [].concat(data) }) }}
  />
);

export const WaIcon = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.6 14.2c-.24.67-1.4 1.28-1.93 1.32-.5.04-1.12.2-3.63-.85-3.06-1.28-5-4.45-5.15-4.66-.15-.2-1.22-1.62-1.22-3.1s.78-2.2 1.06-2.5a1.1 1.1 0 0 1 .8-.37h.57c.18 0 .43-.07.67.51.24.6.83 2.06.9 2.2.07.16.12.34.02.54-.1.2-.15.33-.3.5l-.44.52c-.15.16-.3.34-.13.65.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.3 2.36 1.46.3.15.47.13.65-.08.17-.2.74-.87.94-1.17.2-.3.4-.25.66-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.7-.17 1.37Z" />
  </svg>
);

export const Fab = () => (
  <a className="fab" href={site.wa} rel="noopener" aria-label="Chat on WhatsApp">
    <WaIcon />
  </a>
);

export function PageHeader({ eyebrow, title, sub, children }) {
  return (
    <section className="phead">
      <div className="wrap">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal">{title}</h1>
        {sub && <p className="lede reveal">{sub}</p>}
        {children}
      </div>
    </section>
  );
}

export function Ph({ src, alt, className = '', priority = false, sizes = '(max-width:700px) 100vw, 400px' }) {
  return (
    <span className={`ph ${className}`}>
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </span>
  );
}

export function TourCard({ t }) {
  return (
    <article className="tour reveal">
      <Link className="tour__media" href={`/tours/${t.slug}`} aria-label={t.title}>
        <Ph src={`/img/tours/${t.img}`} alt={`${t.title} — ${t.region}`} />
        <span className="scrim" aria-hidden="true" />
        <span className="tag tag--hot">{t.duration}</span>
        {t.badge && <span className="tag tag--alt">{t.badge}</span>}
        <span className="plabel"><Pin /> {t.region}</span>
      </Link>
      <div className="tour__body">
        <p className="tour__when">{t.dates}</p>
        <h3><Link href={`/tours/${t.slug}`}>{t.title}</Link></h3>
        <p className="tour__desc">{t.blurb}</p>
        <ul className="incl">{t.includes.map((i) => <li key={i}>{i}</li>)}</ul>
        <div className="tour__foot">
          <p className="price"><span>PKR</span> {t.price.toLocaleString('en-US')} <small>/ person</small></p>
          <Link className="btn btn--sm" href={`/tours/${t.slug}`}>Details</Link>
        </div>
      </div>
    </article>
  );
}

export function CustomTripCard() {
  return (
    <article className="tour tour--cta reveal">
      <h3>Planning a university trip?</h3>
      <p>Custom departures for societies, batches and friend groups — pick the valley, we handle transport, stay and food.</p>
      <a className="btn btn--light btn--sm" href={waLink("Hi Wahid, I want a custom group trip")} rel="noopener">Get a group quote</a>
      <p className="tour__note">Prices for Naran, Kumrat, Chitral, Kalash &amp; Ganga Choti shared on request.</p>
    </article>
  );
}

export function Cta({ title = 'The next departure is already filling.', text = 'Send a message, ask anything, and hold your seat. No forms, no callbacks — just WhatsApp.' }) {
  return (
    <section className="cta">
      <div className="wrap cta__in reveal">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="cta__row">
          <a className="btn btn--wa btn--lg" href={site.wa} rel="noopener"><WaIcon className="ico" /> WhatsApp {site.phone}</a>
          <a className="btn btn--ghost btn--lg" href={site.instagram} rel="noopener">See trips on Instagram</a>
        </div>
      </div>
    </section>
  );
}

export function Faq({ list }) {
  return (
    <div className="faq__list">
      {list.map((f, i) => (
        <details key={f.q} className="reveal" open={i === 0}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function DestCard({ d, n }) {
  return (
    <a className="dest reveal" href={waLink(`Tell me about ${d.name}`)} rel="noopener">
      <Ph src={`/img/tours/${d.img}`} alt={`${d.name}, ${d.region}`} sizes="(max-width:700px) 100vw, 300px" />
      <span className="scrim scrim--full" aria-hidden="true" />
      <span className="dest__top">
        <span className="dest__n">{n}</span>
        {d.season && <span className="chip">{d.season}</span>}
      </span>
      <span className="dest__body">
        <span className="plabel plabel--bare"><Pin /> {d.region}</span>
        <h3>{d.name}</h3>
        <p>{d.desc}</p>
        <span className="dest__go">Ask about this trip <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}

export function Strip({ items }) {
  return (
    <div className="strip">
      {items.map((g) => (
        <figure key={g.img} className="shot reveal">
          <Ph src={`/img/tours/${g.img}`} alt={`${g.label}, ${g.place}`} sizes="(max-width:700px) 50vw, 300px" />
          <span className="scrim" aria-hidden="true" />
          <figcaption>
            <strong>{g.label}</strong>
            <span><Pin /> {g.place}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
