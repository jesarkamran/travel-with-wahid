import Link from 'next/link';
import { site, waLink } from '@/data/site';
import Profile from './Profile';

export const money = (n) => n.toLocaleString('en-US');

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

/* A trip as a quiet spread: photograph on one side, the route on the other. */
export function Trip({ t }) {
  return (
    <article className="trip">
      <figure className="trip__media" style={{ margin: 0 }}>
        <img src={`/img/tours/${t.img}`} alt={`${t.title}, ${t.region}`} loading="lazy" decoding="async" />
        {t.badge && <figcaption className="trip__tag">{t.badge}</figcaption>}
      </figure>
      <div>
        <p className="trip__when">{t.dates}</p>
        <h3><Link href={`/tours/${t.slug}`}>{t.title}</Link></h3>
        <p className="trip__body">{t.blurb}</p>

        <Profile stops={t.profile} />

        <ul className="trip__list">
          {t.includes.map((i) => <li key={i}>{i}</li>)}
        </ul>

        <div className="trip__foot">
          <p className="price">PKR {money(t.price)} <small>per person</small></p>
          <Link className="btn btn--sm" href={`/tours/${t.slug}`}>See the trip</Link>
          <a className="btn btn--sm btn--quiet" href={waLink(`Hi Wahid, is there a seat on ${t.title}, ${t.dates}?`)} rel="noopener">Ask about a seat</a>
        </div>
      </div>
    </article>
  );
}

export function Valley({ d }) {
  return (
    <a className="valley" href={waLink(`Hi Wahid, tell me about ${d.name}`)} rel="noopener">
      <img src={`/img/tours/${d.img}`} alt={`${d.name}, ${d.region}`} loading="lazy" decoding="async" />
      <span className="valley__alt">{money(d.high)} m</span>
      <span className="valley__in">
        <span className="valley__where">{d.region}</span>
        <h3>{d.name}</h3>
        <span style={{ display: 'block' }}><span className="valley__p">{d.note}</span></span>
      </span>
    </a>
  );
}

export function Strip({ items }) {
  return (
    <div className="strip">
      {items.map((g) => (
        <figure key={g.img} className="shot">
          <img src={`/img/tours/${g.img}`} alt={`${g.label}, ${g.place}`} loading="lazy" decoding="async" />
          <figcaption>{g.label}<span>{money(g.m)} m</span></figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Close({
  title = 'The next van leaves in August.',
  text = 'Message the number and Wahid answers it himself, usually the same day.',
}) {
  return (
    <section className="close on-pine">
      <div className="wrap">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="close__row">
          <a className="btn btn--gold" href={site.wa} rel="noopener"><WaIcon className="ico" /> Book on WhatsApp</a>
          <a className="btn btn--quiet" href={site.instagram} rel="noopener">See trips on Instagram</a>
        </div>
      </div>
    </section>
  );
}

export function Faq({ list }) {
  return (
    <div className="faq">
      {list.map((f, i) => (
        <details key={f.q} open={i === 0}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
