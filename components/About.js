'use client';
/* The About page. It renders the copy baked in at build time — what a crawler
   sees, and what stays if Drive cannot be reached — then swaps in whatever the
   content sheet says right now, via the Apps Script endpoint. So an edit to the
   about tab on Drive is live without a rebuild.

   The about tab is one row per piece, named by its block column: one heading,
   one description (the meta tag, so build time only), a story row per
   paragraph, a service row per card (name, text), and a team row per person —
   name, role, text, photo. */
import { useEffect, useState } from 'react';
import { site, credits, about as baked, block } from '@/data/site';
import { lookupAbout } from '@/lib/booking';
import { Close, Reasons } from '@/components/ui';

// A Drive share link opens a viewer page, not an image — use its thumbnail.
const photoSrc = (u) => {
  const id = String(u).match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : u;
};

export default function About() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    lookupAbout({ signal: ac.signal }).then((d) => {
      if (!ac.signal.aborted && d) setLive(d);
    });
    return () => ac.abort();
  }, []);

  const rows = live ?? baked;
  const heading = block(rows, 'heading')[0]?.text;
  const story = block(rows, 'story').map((r) => r.text).filter(Boolean);
  const services = block(rows, 'service').filter((r) => r.name).map((r) => ({ h: r.name, p: r.text }));
  const team = block(rows, 'team').filter((r) => r.name);

  return (
    <>
      <section className="mast mastpad mistfield">
        <div className="wrap">
          <p className="kicker rise rise-1">About</p>
          <h1 className="rise rise-2">{heading}</h1>
        </div>
      </section>

      <section className="sec sec--flush">
        <div className="wrap split">
          <div className="prose">
            {story.map((p) => <p key={p}>{p}</p>)}
          </div>

          <div className="rows">
            <a href={site.wa} rel="noopener">
              <div><h3>Ask Wahid anything</h3><p>The same number for booking, for the road, and for photographs afterwards.</p></div>
              <b>{site.phone}</b>
            </a>
            <a href={site.waGroup} rel="noopener">
              <div><h3>The trip group</h3><p>New dates and last-minute seats are posted here first.</p></div>
              <b>WhatsApp</b>
            </a>
            <a href={site.instagram} rel="noopener">
              <div><h3>Every trip, photographed</h3><p>See what you are signing up for before you pay.</p></div>
              <b>Instagram</b>
            </a>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="sec--sm">
          <div className="wrap">
            <h2 className="h-sub">What we do</h2>
            <Reasons items={services} />
          </div>
        </section>
      )}

      <section className="sec--sm">
        <div className="wrap">
          <h2 className="h-sub">The people behind it</h2>
          <div className="team">
            {team.map((p) => (
              <article key={p.name} className="card">
                {/* initials stand in until the photo cell is filled */}
                {p.photo ? (
                  <img className="team__av" src={photoSrc(p.photo)} alt="" loading="lazy" />
                ) : (
                  <span className="team__av" aria-hidden="true">
                    {String(p.name).split(/\s+/).map((w) => w[0]).join('')}
                  </span>
                )}
                <h3>{p.name}</h3>
                {p.role && <p className="chip chip--sun">{p.role}</p>}
                <p className="muted">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec--sm">
        <div className="wrap">
          <h2 className="h-sub">Photographs</h2>
          <p className="muted sub-lede">
            The trip photographs here are Creative Commons work by people who shot these
            valleys before us. Credit is a condition of using them, so here it is.
          </p>
          <ul className="creds">
            {credits.map((c) => (
              <li key={c.file}>
                <a href={c.source} rel="noopener nofollow">{c.title}</a>, {c.by},{' '}
                <a href={c.licenseUrl} rel="noopener nofollow">{c.license}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Close />
    </>
  );
}
