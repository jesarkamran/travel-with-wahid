'use client';
/* What falls through the air, per season.

   One <canvas> and one rAF loop rather than a particle library: the whole thing
   is four force functions over the same little struct, and a dependency would
   cost more to configure than to write. Canvas also keeps the cursor physics
   honest — a few hundred particles as DOM nodes would each need their own
   layout, and the repulsion would stutter the moment the pointer moved.

   The pointer arrives as a ref, not a prop, so moving the mouse never re-renders
   React — the loop just reads the latest value on the next frame.

   The loop is idle unless it has something to do: paused off-screen, paused on a
   hidden tab, and never started at all under prefers-reduced-motion. */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// how many particles at 1280px wide; scaled by area, then capped
const DENSITY = { snow: 90, petal: 46, firefly: 34, leaf: 40 };
const CAP = 160;
const PUSH_R = 132;   // how close the pointer has to get to be felt
const PUSH_F = 0.78;  // how hard it shoves

const rand = (a, b) => a + Math.random() * (b - a);

function spawn(kind, w, h, seeded) {
  const p = {
    x: Math.random() * w,
    y: seeded ? Math.random() * h : -20,
    vx: 0, vy: 0, a: Math.random() * Math.PI * 2, spin: rand(-0.02, 0.02),
    r: 1, alpha: 1, phase: Math.random() * Math.PI * 2, hue: 0,
  };
  if (kind === 'snow') {
    p.r = rand(1, 3.2); p.vy = rand(0.32, 1.05); p.vx = rand(-0.18, 0.18); p.alpha = rand(0.35, 0.92);
  } else if (kind === 'petal') {
    p.r = rand(3, 6.5); p.vy = rand(0.34, 0.85); p.vx = rand(-0.25, 0.25); p.alpha = rand(0.5, 0.92);
    p.hue = rand(0, 1); // 0 pink … 1 white
  } else if (kind === 'leaf') {
    p.r = rand(4, 8.5); p.vy = rand(0.5, 1.25); p.vx = rand(-0.3, 0.3); p.alpha = rand(0.6, 0.95);
    p.spin = rand(-0.045, 0.045); p.hue = rand(0, 1); // gold … rust
  } else { // firefly — drifts and breathes rather than falls
    p.r = rand(1.2, 2.6); p.vx = rand(-0.22, 0.22); p.vy = rand(-0.16, 0.16);
    p.y = Math.random() * h; p.alpha = rand(0.25, 0.8);
  }
  return p;
}

function draw(ctx, kind, p, t) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  if (kind === 'snow') {
    ctx.fillStyle = '#EAF4FF';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'firefly') {
    // a soft bloom, breathing out of phase with its neighbours
    const pulse = 0.55 + 0.45 * Math.sin(t * 0.0022 + p.phase);
    ctx.globalAlpha = p.alpha * pulse;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
    g.addColorStop(0, 'rgba(255,229,150,.95)');
    g.addColorStop(0.35, 'rgba(255,196,84,.4)');
    g.addColorStop(1, 'rgba(255,196,84,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = p.alpha * pulse;
    ctx.fillStyle = '#FFF6D8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // petal and leaf are the same blade, turned edge-on as they tumble
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.scale(1, Math.max(0.18, Math.abs(Math.cos(p.a * 0.9))));
    ctx.fillStyle = kind === 'petal'
      ? `rgb(${255 - p.hue * 12}, ${182 + p.hue * 60}, ${205 + p.hue * 40})`
      : `rgb(${226 - p.hue * 40}, ${138 - p.hue * 60}, ${46 - p.hue * 26})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export default function Weather({ kind = 'snow', pointer, className = '' }) {
  const ref = useRef(null);
  const calm = useReducedMotion();

  useEffect(() => {
    if (calm) return;
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let parts = [];
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const fill = (seeded) => {
      const n = Math.min(CAP, Math.round((DENSITY[kind] ?? 60) * (w / 1280) * Math.max(h / 720, 0.6)));
      parts = Array.from({ length: Math.max(n, 12) }, () => spawn(kind, w, h, seeded));
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fill(true);
    };

    const step = (t) => {
      raf = requestAnimationFrame(step);
      // normalise to 60fps so a 120Hz screen doesn't double the wind speed
      const dt = Math.min((t - (last || t)) / 16.667, 3);
      last = t;
      ctx.clearRect(0, 0, w, h);

      const pt = pointer?.current;
      const live = pt?.active;

      for (const p of parts) {
        if (kind === 'firefly') {
          // wander, and keep a polite distance from the cursor
          p.vx += Math.sin(t * 0.0006 + p.phase) * 0.008 * dt;
          p.vy += Math.cos(t * 0.0005 + p.phase * 1.7) * 0.008 * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
        } else {
          p.a += p.spin * dt;
          p.vx += Math.sin(t * 0.001 + p.phase) * (kind === 'snow' ? 0.004 : 0.012) * dt;
          p.vx *= 0.99;
        }

        if (live) {
          const dx = p.x - pt.x;
          const dy = p.y - pt.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < PUSH_R * PUSH_R) {
            const d = Math.sqrt(d2) || 0.001;
            // falls off with distance, so the edge of the field is gentle
            const f = (1 - d / PUSH_R) * PUSH_F * dt;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f * (kind === 'firefly' ? 1 : 0.75);
          }
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // wrap sideways; recycle at the top once it falls out of frame
        if (p.x < -30) p.x = w + 30;
        else if (p.x > w + 30) p.x = -30;
        if (kind === 'firefly') {
          if (p.y < -20) p.y = h + 20;
          else if (p.y > h + 20) p.y = -20;
        } else if (p.y > h + 24) {
          Object.assign(p, spawn(kind, w, h, false));
          p.x = Math.random() * w;
        }

        draw(ctx, kind, p, t);
      }
    };

    const play = () => {
      if (raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen ? play() : stop(); }, { threshold: 0 });
    io.observe(host);
    const vis = () => (document.hidden ? stop() : play());
    document.addEventListener('visibilitychange', vis);
    play();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, [kind, calm, pointer]);

  if (calm) return null;
  return <canvas ref={ref} className={`weather ${className}`.trim()} aria-hidden="true" />;
}
