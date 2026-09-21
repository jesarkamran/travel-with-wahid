'use client';
/* Four seasons of the same mountains.

   The split here matters. Everything *visual* — the palette, the sky, the
   photograph — hangs off a `data-season` attribute on <html> and lives in CSS
   (globals.css §8b), set by a blocking script before first paint, exactly like
   the light/dark toggle next door. So the right season is on screen before any
   JavaScript hydrates, only one photograph is ever downloaded, and the server's
   HTML and the client's first render have nothing to disagree about — which
   matters doubly here, because the site is a static export whose HTML may have
   been built in a different season than the one it is read in.

   This file keeps what CSS cannot: which icon, which photograph, what falls
   through the air, and the sentence under the headline. */
import { useCallback, useEffect, useState } from 'react';
import { Flower2, Leaf, Snowflake, Sun } from 'lucide-react';

export const ORDER = ['winter', 'spring', 'summer', 'autumn'];
export const SEASON_KEY = 'twv-season';

export const SEASONS = {
  winter: {
    id: 'winter',
    label: 'Winter',
    icon: Snowflake,
    photo: '/img/hero/winter.jpg',
    alt: 'Snow-covered peaks under a hard blue sky',
    note: 'Passes shut, valleys quiet, the north at its most severe.',
    particle: 'snow',
  },
  spring: {
    id: 'spring',
    label: 'Spring',
    icon: Flower2,
    photo: '/img/hero/spring.jpg',
    alt: 'A green valley with the river running through it',
    note: 'Snowmelt in the rivers, the first green back on the terraces.',
    particle: 'petal',
  },
  summer: {
    id: 'summer',
    label: 'Summer',
    icon: Sun,
    photo: '/img/hero/summer.jpg',
    alt: 'A high meadow in full sun, wooden huts along the tree line',
    note: 'Every road open, the meadows at their greenest, the trips full.',
    particle: 'firefly',
  },
  autumn: {
    id: 'autumn',
    label: 'Autumn',
    icon: Leaf,
    photo: '/img/hero/autumn.jpg',
    alt: 'Poplars turning gold along the valley floor, snow peaks behind',
    note: 'Poplars going gold, cold nights, the clearest air of the year.',
    particle: 'leaf',
  },
};

/* Northern Pakistan, not the calendar's equinoxes: the roads open late and
   shut early up there, so the driving season is short and winter is long. */
export function seasonNow(date = new Date()) {
  const m = date.getMonth(); // 0–11
  if (m <= 1 || m === 11) return 'winter'; // Dec–Feb
  if (m <= 4) return 'spring';             // Mar–May
  if (m <= 7) return 'summer';             // Jun–Aug
  return 'autumn';                         // Sep–Nov
}

/* Runs blocking in <head>, so the season is decided before the first pixel and
   the page never flashes the wrong one. Mirrors themeScript in ThemeToggle. */
export const seasonScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('${SEASON_KEY}'),o=${JSON.stringify(ORDER)};if(o.indexOf(s)<0){var m=new Date().getMonth();s=m<=1||m===11?'winter':m<=4?'spring':m<=7?'summer':'autumn'}d.dataset.season=s;var l=document.createElement('link');l.rel='preload';l.as='image';l.href='/img/hero/'+s+'.jpg';l.setAttribute('fetchpriority','high');document.head.appendChild(l)}catch(e){d.dataset.season='autumn'}})()`;

/* React's copy of the season, resolved after mount.

   It deliberately starts as null: the first client render has to match HTML
   that may have been built months ago, so nothing season-dependent is rendered
   until we are safely past hydration. The CSS is already showing the right
   thing by then, so there is nothing to see. */
export function useSeason() {
  const [season, setSeason] = useState(null);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(SEASON_KEY); } catch { /* private mode */ }
    const attr = document.documentElement.dataset.season;
    setSeason(SEASONS[attr] ? attr : seasonNow());
    setPicked(Boolean(saved && SEASONS[saved]));
  }, []);

  const choose = useCallback((id) => {
    if (!SEASONS[id]) return;
    document.documentElement.dataset.season = id; // CSS follows immediately
    setSeason(id);
    setPicked(true);
    try { localStorage.setItem(SEASON_KEY, id); } catch { /* the choice just won't stick */ }
  }, []);

  const reset = useCallback(() => {
    const now = seasonNow();
    document.documentElement.dataset.season = now;
    setSeason(now);
    setPicked(false);
    try { localStorage.removeItem(SEASON_KEY); } catch { /* ignore */ }
  }, []);

  return { season, theme: season ? SEASONS[season] : null, choose, reset, picked, real: seasonNow() };
}
