'use client';
/* The trip's climb, shrunk to a strip the size of a line of text: the same
   road, pins and van as the route map on the trip page, drawn small enough to
   sit inside the "next van out" card and loop on its own.

   It borrows the trip map's mechanics rather than its code — one <path>, a
   motion value running 0..1 along it, getPointAtLength for the van, and
   strokeDashoffset on a pathLength="1" overlay for the lit stretch. At this
   size the geometry can stay simple: no switchbacks, just the elevation. */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';

const W = 320;
const H = 58;
const PAD = 12;
const TOP = 14;
const BOT = 44;
const EASE = [0.22, 0.8, 0.3, 1];
const fmt = (n) => n.toLocaleString('en-US');

export default function RouteRibbon({ stops = [], className = '' }) {
  const n = stops.length;
  const last = n - 1;
  const calm = useReducedMotion();
  const uid = `rb${useId().replace(/[^\w-]/g, '')}`;

  const ref = useRef(null);
  const pathRef = useRef(null);
  const seen = useInView(ref, { margin: '-10% 0px' });

  const run = useMotionValue(0);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const va = useMotionValue(0);
  const [at, setAt] = useState(0); // which pin the van has passed

  const ms = stops.map((s) => s.m);
  const lo = Math.min(...ms);
  const span = Math.max(Math.max(...ms) - lo, 1);
  const x = (i) => PAD + (i * (W - PAD * 2)) / Math.max(last, 1);
  const y = (m) => BOT - ((m - lo) / span) * (BOT - TOP);
  const pts = stops.map((s, i) => [x(i), y(s.m)]);

  let d = `M ${pts[0]?.[0] ?? 0} ${pts[0]?.[1] ?? 0}`;
  for (let i = 1; i < n; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = (px + cx) / 2;
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }

  const place = useCallback((p) => {
    const el = pathRef.current;
    if (!el) return;
    const total = el.getTotalLength();
    if (!total) return;
    const a = el.getPointAtLength(Math.min(Math.max(p, 0), 1) * total);
    const b = el.getPointAtLength(Math.min(Math.max(p, 0), 1) * total + 1.5);
    vx.set(a.x);
    vy.set(a.y);
    if (b.x !== a.x || b.y !== a.y) va.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
    setAt(Math.round(Math.min(Math.max(p, 0), 1) * last));
  }, [last, va, vx, vy]);

  useMotionValueEvent(run, 'change', place);

  // the drive loops while the strip is on screen, and stops when it is not
  useEffect(() => {
    if (calm) { run.set(1); place(1); return; }
    if (!seen) return;
    place(0);
    const c = animate(run, 1, {
      duration: Math.min(Math.max(n * 1.1, 3.2), 7),
      ease: EASE,
      repeat: Infinity,
      repeatDelay: 1.6,
      repeatType: 'loop',
    });
    return () => c.stop();
  }, [seen, calm, n, place, run]);

  if (!n) return null;

  return (
    <div ref={ref} className={`ribbon ${className}`.trim()}>
      <svg viewBox={`0 0 ${W} ${H}`} className="ribbon__svg" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-lit`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--sun)" />
          </linearGradient>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sun)" stopOpacity=".2" />
            <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={`${d} L ${W - PAD} ${H} L ${PAD} ${H} Z`} fill={`url(#${uid}-fill)`} />
        <path ref={pathRef} d={d} className="ribbon__road" />
        <Lit d={d} run={run} stroke={`url(#${uid}-lit)`} />

        {pts.map(([px, py], i) => (
          <circle key={stops[i].name} cx={px} cy={py} r={i === 0 || i === last ? 3.4 : 2.6}
            className={`ribbon__pin${i <= at ? ' is-lit' : ''}`} />
        ))}

        {/* the van, drawn at the size of a full stop */}
        <motion.g style={{ x: vx, y: vy, rotate: va }} className="ribbon__van">
          <path d="M-5 1.5 L-5 -1.5 Q-5 -2.6 -3.8 -2.6 L1.6 -2.6 L3.6 -0.6 L4.8 -0.6 Q5.4 -0.6 5.4 0 L5.4 1.5 Z" />
          <circle cx="-3" cy="1.9" r="1.3" className="ribbon__wheel" />
          <circle cx="3" cy="1.9" r="1.3" className="ribbon__wheel" />
        </motion.g>
      </svg>

      <p className="ribbon__ends">
        <span>{stops[0].name}<i>{fmt(stops[0].m)} m</i></span>
        <span className="ribbon__climb">+{fmt(stops[last].m - stops[0].m)} m</span>
        <span className="ribbon__to">{stops[last].name}<i>{fmt(stops[last].m)} m</i></span>
      </p>
    </div>
  );
}

function Lit({ d, run, stroke }) {
  const offset = useMotionValue(1);
  useMotionValueEvent(run, 'change', (p) => offset.set(1 - Math.min(Math.max(p, 0), 1)));
  return <motion.path d={d} pathLength="1" className="ribbon__lit" stroke={stroke} strokeDasharray="1 1" style={{ strokeDashoffset: offset }} />;
}
