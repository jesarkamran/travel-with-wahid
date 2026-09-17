'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import Mark from './Mark';

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
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <header className={`top${stuck ? ' stuck' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap top__in">
        <Link className="brand" href="/">
          <Mark />
          <span className="brand__txt">Travel with Wahid</span>
        </Link>

        <nav className="menu" id="menu" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <a className="btn btn--sm top__cta" href={site.wa} rel="noopener">Book a seat</a>

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
