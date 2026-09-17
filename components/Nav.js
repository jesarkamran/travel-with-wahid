'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/data/site';
import Mark from './Mark';

const links = [
  { href: '/tours', label: 'Tours' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const path = usePathname();
  const solid = path !== '/'; // only the home hero sits under a transparent nav

  useEffect(() => {
    const onScroll = () => setStuck(scrollY > 40);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  // scroll reveal, re-armed on every route change
  useEffect(() => {
    setOpen(false);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [path]);

  return (
    <header className={`nav${stuck || solid ? ' is-stuck' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap nav__in">
        <Link className="brand" href="/" aria-label={`${site.name}, home`}>
          <Mark className="brand__mark" />
          <span className="brand__txt">Travel<em>With</em>Wahid</span>
        </Link>

        <nav className="nav__links" id="menu" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <a className="btn btn--sm" href={site.wa} rel="noopener">Book a seat</a>
        </nav>

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
