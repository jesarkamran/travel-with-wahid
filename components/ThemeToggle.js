'use client';
/* Both icons are always in the DOM and CSS picks one off the `data-theme`
   attribute, so there is nothing for the server and the client to disagree
   about on first paint, and the right icon shows before this ever hydrates. */
import { Moon, Sun } from 'lucide-react';

export const THEME_KEY = 'tww-theme';

// Runs blocking in <head> so the page never flashes the wrong palette.
export const themeScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.dataset.theme=t}catch(e){}})()`;

export default function ThemeToggle() {
  const flip = () => {
    const d = document.documentElement;
    const next = d.dataset.theme === 'light' ? 'dark' : 'light';
    d.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode — the choice just won't stick */ }
  };

  return (
    <button className="tog" type="button" onClick={flip} aria-label="Switch between light and dark">
      <Sun className="sun" size={17} aria-hidden="true" />
      <Moon className="moon" size={17} aria-hidden="true" />
    </button>
  );
}
