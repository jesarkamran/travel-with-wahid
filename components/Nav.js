'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site, nextDeparture } from '@/data/site';
import { Magnetic, ScrollProgress } from './motion';
import { IgIcon, WaIcon } from './ui';
import Mark from './Mark';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/tours', label: 'Trips' },
  { href: '/destinations', label: 'Valleys' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'Questions' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [away, setAway] = useState(false);
  const lastY = useRef(0);
  const path = usePathname();

  // The dock tucks away while you read down the page and comes straight back
  // the moment you scroll up — the reading room of a hidden bar, with none of
  // the hunting for it.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 24);
      if (Math.abs(y - lastY.current) > 6) {
        setAway(y > lastY.current && y > 320);
        lastY.current = y;
      }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open]);

  return (
    <header className={`top${stuck ? ' stuck' : ''}${away && !open ? ' away' : ''}${open ? ' is-open' : ''}`}>
      <ScrollProgress />
      <div className="wrap top__in">
        <Link className="brand" href="/" aria-label={`${site.name} — home`}>
          <Mark priority />
          <span className="brand__txt">Travel with Wahid</span>
        </Link>

        <p className="live">
          <span className="live__dot" aria-hidden="true" />
          Next van: <b>{nextDeparture.month}</b> · <b>{nextDeparture.seatsLeft} seats left</b>
        </p>

        <nav className="menu" id="menu" aria-label="Primary">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ '--i': i }}
              aria-current={path.startsWith(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
          <div className="menu__foot" style={{ '--i': links.length }}>
            <a className="btn btn--wa" href={site.wa} rel="noopener">
              <WaIcon className="ico" /> Book a seat
            </a>
            <a className="btn btn--quiet" href={site.instagram} rel="noopener" target="_blank">
              <IgIcon size={16} /> Instagram
            </a>
            <p className="menu__live">
              <span className="live__dot" aria-hidden="true" />
              Next van {nextDeparture.month} · {nextDeparture.seatsLeft} seats left
            </p>
          </div>
        </nav>

        <ThemeToggle />

        <Magnetic className="top__cta">
          <a className="btn btn--sm btn--wa" href={site.wa} rel="noopener">
            <WaIcon className="ico" /> Book a seat
          </a>
        </Magnetic>

        <button
          className="burger"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
