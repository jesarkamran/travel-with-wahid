'use client';
/* The route as an elevation trail you can run your cursor along. The hairline
   draws itself on scroll, then a glowing waypoint traces to whichever stop the
   pointer is nearest and reads out its altitude. */
import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const W = 1000;

export default function Profile({ stops, tall = false, className = '' }) {
  const H = tall ? 120 : 78;
  const top = 16;
  const bot = 10;
  const ms = stops.map((s) => s.m);
  const lo = Math.min(...ms);
  const hi = Math.max(...ms);
  const span = Math.max(hi - lo, 1);
  const x = (i) => (i * W) / (stops.length - 1);
  const y = (m) => top + (1 - (m - lo) / span) * (H - top - bot);
  const pts = stops.map((s, i) => [x(i), y(s.m)]);

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = (px + cx) / 2;
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }

  // A ridge silhouette behind the line — the peaks pushed up between the stops,
  // derived from the elevations so it redraws with the data rather than drifting.
  const ridge = pts.flatMap(([px, py], i) => {
    const next = pts[i + 1];
    if (!next) return [[px, py]];
    const peak = Math.min(py, next[1]) - 6 - ((stops[i].m % 7) + 3);
    return [[px, py], [(px + next[0]) / 2, Math.max(peak, 2)]];
  });
  const ridgeD = `M 0 ${H} ${ridge.map(([a, b]) => `L ${a} ${b}`).join(' ')} L ${W} ${H} Z`;

  const uid = stops.map((s) => s.name).join('').replace(/\W/g, '').slice(0, 10);
  const [active, setActive] = useState(null);
  const calm = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '-8% 0px' });

  const track = (clientX) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    setActive(Math.round(f * (stops.length - 1)));
  };

  const on = active == null ? stops.length - 1 : active;
  const lit = on / (stops.length - 1);

  return (
    <div
      ref={ref}
      className={`pf${tall ? ' pf--tall' : ''} ${className}`}
      onMouseMove={(e) => track(e.clientX)}
      onMouseLeave={() => setActive(null)}
      onTouchMove={(e) => track(e.touches[0].clientX)}
    >
      <p className="pf__read" aria-live="polite">
        {stops[on].name} · {stops[on].m.toLocaleString('en-US')} m
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="pf__svg">
        <defs>
          <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sage-deep)" stopOpacity=".3" />
            <stop offset="100%" stopColor="var(--sage-deep)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ridge-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F382B" stopOpacity=".9" />
            <stop offset="100%" stopColor="#1F382B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`lit-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--sun)" />
          </linearGradient>
        </defs>

        <path d={ridgeD} fill={`url(#ridge-${uid})`} />
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`url(#g-${uid})`} />
        <path d={d} fill="none" stroke="var(--sage-deep)" strokeWidth="1.25" strokeLinecap="round" opacity=".5" vectorEffect="non-scaling-stroke" />

        {/* the lit stretch — draws on scroll, then follows the pointer */}
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#lit-${uid})`}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 6px rgba(244,162,97,.65))' }}
          initial={calm ? false : { pathLength: 0 }}
          animate={{ pathLength: seen || calm ? lit : 0 }}
          transition={{ duration: active == null ? 1.6 : 0.4, ease: [0.22, 0.8, 0.3, 1] }}
        />
      </svg>

      <div className="pf__marks">
        {stops.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={`${s.name}, ${s.m.toLocaleString('en-US')} metres`}
            className={`pf__stop${i === 0 ? ' pf__stop--start' : ''}${i === stops.length - 1 ? ' pf__stop--end' : ''}${i === on ? ' is-on' : ''}`}
            style={{
              left: `${(pts[i][0] / W) * 100}%`,
              top: `${(pts[i][1] / H) * 100}%`,
              background: 'none', border: 0, padding: 0,
            }}
          >
            <span className="pf__dot" />
            <span className="pf__tag">
              <b>{s.name}</b>
              <i>{s.m.toLocaleString('en-US')} m</i>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
