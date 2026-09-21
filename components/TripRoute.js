'use client';
/* The trip as a road you can drive.

   Geometry first: stops are laid out left to right by order and up the frame by
   elevation, so the shape of the drawing *is* the ascent — Islamabad sits on the
   valley floor, Arang Kel up against the sky. A serpentine midpoint is folded
   into every leg so the connecting line reads as a mountain road rather than a
   chart, and the whole thing is smoothed through Catmull-Rom into one <path>.

   That single path is the source of truth for everything that moves. A motion
   value `run` holds 0..1 along it; getPointAtLength turns that into the van's
   position and heading, and the same number drives the lit tarmac through
   strokeDashoffset (pathLength="1", so the dash pattern is a plain fraction and
   no arc-length maths is needed). Picking a stop animates `run` to that stop's
   measured fraction — measured once on mount from prefix copies of the path,
   because a node's fraction along a curve is not i/n.

   Where the stop card goes matters as much as what it says. The point of the
   thing is watching the van climb, so the card never covers the road and never
   opens in some other part of the page: it takes over the trip's photograph,
   the frame already sitting beside the route, so the drive and the place being
   driven to are side by side and in view at the same time.

   Pass `onStop` and this component renders no card at all — it reports the
   current stop, with its own prev/next/close handles, and the host puts it in
   its picture frame. That callback must be referentially stable; a state setter
   is ideal. Without `onStop` the component brings its own frame, which holds
   the trip photo until the tour starts. */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, MapPin, Minus, Mountain, Play, Plus, RotateCcw, X } from 'lucide-react';

const W = 1000;
const H = 560;
const PAD_X = 86;
const SKY = 96;      // the road never climbs above this
const GROUND = 470;  // ...nor drops below it
const EASE = [0.22, 0.8, 0.3, 1];
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.8;

const fmt = (n) => n.toLocaleString('en-US');
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDEwIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzE2MjcxRCIvPjwvc3ZnPg==';

/* Stops carry no art of their own, so the nearest gallery frame stands in and
   anything unmatched falls back to the trip's own photograph. A stop can always
   override this with its own `img` once the workbook carries one. */
const ART = [
  [/arang ?kel/i, 'arang-kel.jpg'],
  [/kel/i, 'kel.jpg'],
  [/keran/i, 'keran.jpg'],
  [/muzaffarabad|neelum|sharda/i, 'muzaffarabad.jpg'],
  [/islamabad|rawalpindi/i, 'islamabad.jpg'],
  [/mahodand/i, 'mahodand.jpg'],
  [/kalam|blue ?point|ushu/i, 'kalam.jpg'],
  [/fairy ?meadow/i, 'fairy-meadows.jpg'],
  [/nanga|base ?camp|beyal|raikot|tato|chilas|jaglot/i, 'nanga-parbat.jpg'],
  [/saiful/i, 'saiful-muluk.jpg'],
  [/naran|babusar|kaghan/i, 'naran.jpg'],
  [/kumrat|thal/i, 'kumrat.jpg'],
  [/kalash|bumburet|chitral/i, 'kalash.jpg'],
  [/ganga|bagh|kashmir/i, 'ganga-choti.jpg'],
];
const artFor = (s, fallback) =>
  `/img/tours/${s.img || (ART.find(([re]) => re.test(s.name)) || [null, fallback])[1]}`;

// "Day 1 · 00:00" -> { day: "Day 1", at: "00:00" }
const splitWhen = (when = '') => {
  const [day, at] = String(when).split('·').map((p) => p.trim());
  return { day, at };
};

/* Catmull-Rom through the points, emitted as cubics. The segments come back
   alongside the joined path so prefixes stay cheap to build. */
function smooth(pts, tension = 1) {
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    segs.push(`C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  const head = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  return { d: `${head} ${segs.join(' ')}`, segs, head };
}

export default function InteractiveTripRoute({ stops = [], img = 'kalam.jpg', compact = false, onStop, className = '' }) {
  const n = stops.length;
  const last = n - 1;
  const calm = useReducedMotion();
  const uid = `tr${useId().replace(/[^\w-]/g, '')}`;

  /* ---------------- geometry ---------------- */
  const geo = useMemo(() => {
    const ms = stops.map((s) => s.m);
    const lo = Math.min(...ms);
    const span = Math.max(Math.max(...ms) - lo, 1);
    const x = (i) => PAD_X + (i * (W - PAD_X * 2)) / Math.max(last, 1);
    const y = (m) => GROUND - ((m - lo) / span) * (GROUND - SKY);
    const nodes = stops.map((s, i) => [x(i), y(s.m)]);

    // one bend per leg, alternating, sized by how hard that leg climbs
    const spine = [];
    nodes.forEach((p, i) => {
      spine.push(p);
      const next = nodes[i + 1];
      if (!next) return;
      const bend = clamp(Math.abs(next[1] - p[1]) * 0.3, 12, 40) * (i % 2 ? 1 : -1);
      spine.push([(p[0] + next[0]) / 2, clamp((p[1] + next[1]) / 2 + bend, SKY - 22, GROUND + 28)]);
    });

    const { d, segs, head } = smooth(spine);
    // node i is reached after 2i segments (node, bend, node, bend, …)
    const prefixes = nodes.map((_, i) => (i === 0 ? head : `${head} ${segs.slice(0, i * 2).join(' ')}`));

    /* Ridge lines behind the road, derived from the same elevations so the
       skyline always agrees with the data instead of drifting from it. */
    const ridge = (lift, wobble) => {
      const peaks = nodes.flatMap(([px, py], i) => {
        const top = clamp(py - lift - ((stops[i].m % 11) + wobble), 10, GROUND);
        const next = nodes[i + 1];
        if (!next) return [[px, top]];
        const saddle = clamp(Math.max(py, next[1]) - lift * 0.4, 18, GROUND);
        return [[px, top], [(px + next[0]) / 2, saddle]];
      });
      const all = [[-80, GROUND], ...peaks, [W + 80, GROUND]];
      return `M -80 ${H} L ${all.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L ')} L ${W + 80} ${H} Z`;
    };

    return {
      nodes,
      d,
      prefixes,
      ridges: [ridge(158, 26), ridge(96, 16), ridge(44, 8)],
      apron: `${d} L ${W + 80} ${H} L -80 ${H} Z`,
    };
  }, [stops, last]);

  /* ---------------- where we are ---------------- */
  const [on, setOn] = useState(0);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [wrapW, setWrapW] = useState(0);

  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const pathRef = useRef(null);
  const nodeBtns = useRef([]);
  const tween = useRef(null);
  const seen = useInView(wrapRef, { once: true, margin: '-18% 0px' });

  const run = useMotionValue(0);              // 0..1 along the road
  const vx = useMotionValue(geo.nodes[0][0]); // the van
  const vy = useMotionValue(geo.nodes[0][1]);
  const va = useMotionValue(0);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);

  // fraction of total length at each stop, measured off prefix copies of the path
  const [marks, setMarks] = useState(() => geo.nodes.map((_, i) => i / Math.max(last, 1)));
  const marksRef = useRef(marks);
  useEffect(() => {
    const el = pathRef.current;
    const svg = el?.ownerSVGElement;
    if (!svg) return;
    const total = el.getTotalLength();
    if (!total) return;
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    probe.setAttribute('fill', 'none');
    svg.appendChild(probe);
    const next = geo.prefixes.map((d) => {
      probe.setAttribute('d', d);
      return clamp(probe.getTotalLength() / total, 0, 1);
    });
    svg.removeChild(probe);
    setMarks(next);
    marksRef.current = next;
  }, [geo]);

  // the van rides the path; heading comes from a point a nudge further along
  const place = useCallback((p) => {
    const el = pathRef.current;
    if (!el) return;
    const total = el.getTotalLength();
    if (!total) return;
    const at = clamp(p, 0, 1) * total;
    const a = el.getPointAtLength(at);
    const b = el.getPointAtLength(clamp(at + 2, 0, total));
    vx.set(a.x);
    vy.set(a.y);
    if (b.x !== a.x || b.y !== a.y) va.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
  }, [va, vx, vy]);

  useMotionValueEvent(run, 'change', place);
  useEffect(() => { place(run.get()); }, [place, run, geo]);

  // which stop the van has most recently passed
  const reachedAt = useCallback((p) => {
    const m = marksRef.current;
    let reached = 0;
    for (let i = 0; i < m.length; i++) if (p >= m[i] - 0.004) reached = i;
    return reached;
  }, []);

  const driveTo = useCallback((i) => {
    tween.current?.stop();
    const target = marksRef.current[i] ?? 0;
    if (calm) { run.set(target); place(target); return; }
    tween.current = animate(run, target, {
      duration: clamp(Math.abs(target - run.get()) * 4.2, 0.45, 2.6),
      ease: EASE,
    });
  }, [calm, place, run]);

  // picking a stop drives the van there and puts that stop in the picture frame
  const go = useCallback((i) => {
    const next = clamp(i, 0, last);
    setPlaying(false);
    setOpen(true);
    setOn(next);
    driveTo(next);
  }, [driveTo, last]);

  const step = useCallback((dir) => {
    setPlaying(false);
    setOpen(true);
    setOn((prev) => {
      const next = clamp(prev + dir, 0, last);
      if (next !== prev) driveTo(next);
      return next;
    });
  }, [driveTo, last]);

  /* The tour: one continuous drive, the frame handing over to the next stop as
     the van passes it. */
  const startTour = useCallback(() => {
    tween.current?.stop();
    setOpen(true);
    setOn(0);
    run.set(0);
    place(0);
    if (calm) { run.set(1); place(1); setOn(last); return; }
    setPlaying(true);
    tween.current = animate(run, 1, {
      duration: clamp(n * 1.7, 4, 12),
      ease: 'easeInOut',
      onUpdate: (p) => setOn((prev) => { const r = reachedAt(p); return prev === r ? prev : r; }),
      onComplete: () => { setPlaying(false); setOn(last); },
    });
  }, [calm, last, n, place, reachedAt, run]);

  // the first scroll into view drives the route once, without stealing the page
  const rolled = useRef(false);
  useEffect(() => {
    if (!seen || rolled.current) return;
    rolled.current = true;
    if (calm) { run.set(1); place(1); setOn(last); return; }
    const t = setTimeout(() => {
      tween.current = animate(run, 1, {
        duration: clamp(n * 1.25, 3, 9),
        ease: EASE,
        onUpdate: (p) => setOn((prev) => { const r = reachedAt(p); return prev === r ? prev : r; }),
      });
    }, 320);
    return () => clearTimeout(t);
  }, [seen, calm, last, n, place, reachedAt, run]);

  useEffect(() => () => tween.current?.stop(), []);

  /* ---------------- the card, wherever it lives ---------------- */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWrapW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /* Is there a picture frame beside us, or does the stop need a tooltip?
     Hosted, that is the host's business: a trip card stacks its photograph above
     the tabs at 960px (globals.css §9), and above the fold is not beside. The
     column the route sits in is ~590px even on a wide screen, so the container
     width would answer this wrongly. Unhosted we own the frame, and the 620px
     container query that gives it its column is exactly the right question. */
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const on = () => setStacked(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const narrow = onStop ? stacked : wrapW > 0 && wrapW < 620;

  const close = useCallback(() => setOpen(false), []);
  const s = stops[on];
  const gain = s ? s.m - stops[0].m : 0;
  const when = splitWhen(s?.day);

  const card = useMemo(() => (s ? {
    stop: s,
    index: on,
    total: n,
    gain,
    img,
    onPrev: () => step(-1),
    onNext: () => step(1),
    onClose: close,
  } : null), [s, on, n, gain, img, step, close]);

  /* Hosted: hand the stop to whoever owns the picture frame. The clear on
     unmount goes through a ref so that switching tabs empties the frame even
     though the effect itself only re-runs on a real change. */
  const stopRef = useRef(onStop);
  stopRef.current = onStop;
  useEffect(() => { onStop?.(open && !narrow ? card : null); }, [onStop, open, card, narrow]);
  useEffect(() => () => stopRef.current?.(null), []);

  /* ---------------- pan + pinch ---------------- */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bound = useMemo(() => ({
    x: (stage.w * (zoom - 1)) / 2,
    y: (stage.h * (zoom - 1)) / 2,
  }), [stage, zoom]);

  const setZoomTo = useCallback((z) => {
    const next = clamp(z, ZOOM_MIN, ZOOM_MAX);
    setZoom(next);
    if (next === ZOOM_MIN) {
      animate(panX, 0, { duration: 0.35, ease: EASE });
      animate(panY, 0, { duration: 0.35, ease: EASE });
      return;
    }
    const bx = (stage.w * (next - 1)) / 2;
    const by = (stage.h * (next - 1)) / 2;
    panX.set(clamp(panX.get(), -bx, bx));
    panY.set(clamp(panY.get(), -by, by));
  }, [panX, panY, stage]);

  // two fingers down is a pinch; framer keeps the one-finger drag
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: zoom };
    }
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.current.size !== 2 || !pinch.current) return;
    const [a, b] = [...pointers.current.values()];
    setZoomTo(pinch.current.z * (Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.current.d));
  };
  const endPointer = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  /* React registers wheel at the root as a passive listener, so preventDefault
     inside an onWheel prop is ignored (and the browser zooms the page instead).
     Bind it here explicitly, non-passive. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // at rest the page scrolls straight past; a held modifier zooms instead
      if (!e.ctrlKey && !e.metaKey && zoom === ZOOM_MIN) return;
      e.preventDefault();
      setZoomTo(zoom - e.deltaY * 0.0016);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, setZoomTo]);

  // once zoomed in, keep the active stop in frame
  useEffect(() => {
    if (zoom === ZOOM_MIN || !stage.w) return;
    const [nx, ny] = geo.nodes[on];
    const tx = clamp(-(nx / W - 0.5) * stage.w * zoom, -bound.x, bound.x);
    const ty = clamp(-(ny / H - 0.5) * stage.h * zoom, -bound.y, bound.y);
    animate(panX, tx, { duration: 0.5, ease: EASE });
    animate(panY, ty, { duration: 0.5, ease: EASE });
  }, [on, zoom, stage, bound, geo, panX, panY]);

  const onKeyDown = (e) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (dir) {
      e.preventDefault();
      const next = clamp(on + dir, 0, last);
      go(next);
      nodeBtns.current[next]?.focus();
      return;
    }
    if (e.key === 'Escape') setOpen(false);
  };

  if (!n) return null;

  return (
    <div
      ref={wrapRef}
      className={`tr${compact ? ' tr--compact' : ''}${onStop ? '' : ' tr--framed'}${open ? ' is-showing' : ''}${playing ? ' is-playing' : ''}${zoom > ZOOM_MIN ? ' is-zoomed' : ''} ${className}`}
      style={{ '--climb': last ? on / last : 0 }}
      onKeyDown={onKeyDown}
    >
      <div className="tr__grid">
        <div className="tr__head">
          <p className="tr__read" aria-live="polite">
            <b>{s.name}</b>
            <span><Mountain size={13} aria-hidden="true" /> {fmt(s.m)} m</span>
            {gain > 0 && <span className="tr__gain">+{fmt(gain)} m climbed</span>}
          </p>
          <div className="tr__tools">
            <button type="button" className="tr__play" onClick={startTour}>
              {playing ? <RotateCcw size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {playing ? 'Driving…' : 'Start tour'}
            </button>
            {!compact && (
              <div className="tr__zoom" role="group" aria-label="Zoom the route">
                <button type="button" onClick={() => setZoomTo(zoom - 0.4)} disabled={zoom <= ZOOM_MIN} aria-label="Zoom out"><Minus size={14} /></button>
                <span aria-hidden="true">{zoom.toFixed(1)}×</span>
                <button type="button" onClick={() => setZoomTo(zoom + 0.4)} disabled={zoom >= ZOOM_MAX} aria-label="Zoom in"><Plus size={14} /></button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={stageRef}
          className="tr__stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          style={{ touchAction: zoom > ZOOM_MIN ? 'none' : 'pan-y' }}
        >
          <motion.div
            className="tr__canvas"
            style={{ x: panX, y: panY, scale: zoom }}
            drag={zoom > ZOOM_MIN}
            dragConstraints={{ left: -bound.x, right: bound.x, top: -bound.y, bottom: bound.y }}
            dragElastic={0.06}
            dragMomentum={false}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="tr__svg"
              role="img"
              aria-label={`Route from ${stops[0].name} to ${stops[last].name}, climbing to ${fmt(stops[last].m)} metres`}
            >
              <defs>
                <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--tr-sky-top)" />
                  <stop offset="58%" stopColor="var(--tr-sky-mid)" />
                  <stop offset="100%" stopColor="var(--tr-sky-low)" />
                </linearGradient>
                <linearGradient id={`${uid}-lit`} x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--ember)" />
                  <stop offset="100%" stopColor="var(--sun)" />
                </linearGradient>
                <linearGradient id={`${uid}-apron`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sage-deep)" stopOpacity=".26" />
                  <stop offset="100%" stopColor="var(--sage-deep)" stopOpacity="0" />
                </linearGradient>
                <radialGradient id={`${uid}-glow`}>
                  <stop offset="0%" stopColor="var(--sun)" stopOpacity=".45" />
                  <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect x="-80" y="-40" width={W + 160} height={H + 80} fill={`url(#${uid}-sky)`} />
              <circle cx={W * 0.76} cy={SKY * 0.66} r="170" fill={`url(#${uid}-glow)`} className="tr__sun" />

              {geo.ridges.map((d, i) => (
                <path key={`ridge${i}`} d={d} className={`tr__ridge tr__ridge--${i + 1}`} />
              ))}

              <path d={geo.apron} fill={`url(#${uid}-apron)`} />

              {/* the road: kerb, tarmac, centre line, then the lit stretch on top */}
              <path ref={pathRef} d={geo.d} className="tr__kerb" />
              <path d={geo.d} className="tr__tarmac" />
              <path d={geo.d} className="tr__centre" />
              <LitRoad d={geo.d} run={run} stroke={`url(#${uid}-lit)`} />

              {/* elevation poles: how far above the valley floor each stop sits */}
              {geo.nodes.map(([nx, ny], i) => (
                <line
                  key={`pole-${stops[i].name}`}
                  x1={nx} y1={ny} x2={nx} y2={GROUND + 52}
                  className={`tr__pole${i <= on ? ' is-lit' : ''}`}
                />
              ))}

              <motion.g style={{ x: vx, y: vy, rotate: va }} className="tr__van">
                <ellipse cx="0" cy="11" rx="21" ry="4.5" className="tr__van-shadow" />
                <path d="M20 1 L44 -7 L44 9 Z" className="tr__beam" />
                <path d="M-19 4 L-19 -6 Q-19 -9 -16 -9 L6 -9 L13 -2 L18 -2 Q20 -2 20 0 L20 4 Z" className="tr__van-body" />
                <path d="M-15 -7 L-4 -7 L-4 -1 L-15 -1 Z M-1 -7 L5 -7 L10 -2 L-1 -2 Z" className="tr__van-glass" />
                <circle cx="-11" cy="4.5" r="4.4" className="tr__wheel" />
                <circle cx="11" cy="4.5" r="4.4" className="tr__wheel" />
              </motion.g>
            </svg>

            <div className="tr__marks">
              {stops.map((st, i) => (
                <button
                  key={st.name}
                  ref={(el) => { nodeBtns.current[i] = el; }}
                  type="button"
                  className={[
                    'tr__stop',
                    i <= on && 'is-lit',
                    i === on && 'is-on',
                    i === last && 'tr__stop--end',
                  ].filter(Boolean).join(' ')}
                  style={{ left: `${(geo.nodes[i][0] / W) * 100}%`, top: `${(geo.nodes[i][1] / H) * 100}%` }}
                  onClick={() => go(i)}
                  aria-label={`Stop ${i + 1}, ${st.name}, ${fmt(st.m)} metres${st.day ? `, ${st.day}` : ''}`}
                  aria-current={i === on}
                >
                  <span className="tr__pin">
                    {i === 0 ? <MapPin size={13} aria-hidden="true" />
                      : i === last ? <Flag size={13} aria-hidden="true" />
                        : <span className="tr__pin-n">{i + 1}</span>}
                  </span>
                  <span className="tr__label">
                    <b>{st.name}</b>
                    <i>{fmt(st.m)} m</i>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <p className="tr__hint" aria-hidden="true">
            <span className="tr__hint--fine">{compact ? 'Click a stop · drag to pan' : 'Click a stop · ⌘/ctrl + scroll to zoom · drag to pan'}</span>
            <span className="tr__hint--touch">{open ? 'Swipe the card between stops' : 'Tap a stop, or start the tour'}</span>
          </p>
        </div>

        {/* Phone: the stop reads as a tooltip a little below the map, pointing up
            at the pin it belongs to, so the van and the road stay visible. */}
        <AnimatePresence initial={false}>
          {narrow && open && (
            <motion.div
              className="tr__tip"
              role="dialog"
              aria-label={`${s.name} — what happens here`}
              style={{ '--arrow': `${(geo.nodes[on][0] / W) * 100}%` }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              drag={calm ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.24}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.x < -48 || info.velocity.x < -480) step(1);
                else if (info.offset.x > 48 || info.velocity.x > 480) step(-1);
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={s.name}
                  className="tr__tip-in"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="tr__tip-shot">
                    <Image src={artFor(s, img)} alt={s.name} fill sizes="120px" placeholder="blur" blurDataURL={BLUR} style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="tr__tip-text">
                    <p className="tr__tip-meta">
                      {when.day && <span className="chip chip--sun">{when.day}</span>}
                      {when.at && <span className="tr__eta">{when.at}</span>}
                      <span className="tr__alt"><Mountain size={11} aria-hidden="true" /> {fmt(s.m)} m</span>
                    </p>
                    <h4>{s.name}</h4>
                    {s.note && <p className="tr__tip-note">{s.note}</p>}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="tr__tip-nav">
                <button type="button" onClick={() => step(-1)} disabled={on === 0} aria-label="Previous stop"><ChevronLeft size={15} /></button>
                <span className="tr__tip-count">Stop {on + 1} of {n}</span>
                <button type="button" onClick={() => step(1)} disabled={on === last} aria-label="Next stop"><ChevronRight size={15} /></button>
                <button type="button" className="tr__tip-x" onClick={close} aria-label="Close"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the progress rail doubles as a scrubber */}
        <div className="tr__rail" role="group" aria-label="Stops">
          {stops.map((st, i) => (
            <button
              key={`rail-${st.name}`}
              type="button"
              className={`tr__tick${i <= on ? ' is-lit' : ''}${i === on ? ' is-on' : ''}`}
              onClick={() => go(i)}
              aria-label={`Go to ${st.name}`}
              aria-current={i === on}
            >
              <span />
            </button>
          ))}
        </div>

        {/* Unhosted: bring a frame of our own, holding the trip photograph until
            the tour puts a stop in it. */}
        {!onStop && !narrow && (
          <div className="tr__frame">
            <AnimatePresence initial={false}>
              {open ? (
                <StopCard key="stop" {...card} />
              ) : (
                <motion.div
                  key="idle"
                  className="tr__idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.18 } }}
                >
                  <Image src={`/img/tours/${img}`} alt="" fill sizes="(max-width:900px) 100vw, 420px" placeholder="blur" blurDataURL={BLUR} style={{ objectFit: 'cover' }} />
                  <div className="tr__idle-body">
                    <p className="tr__idle-count">{n} stops</p>
                    <p className="tr__idle-climb">{fmt(stops[0].m)} m → {fmt(stops[last].m)} m</p>
                    <p className="tr__idle-note">Start the tour, or pick a stop — it appears here as the van reaches it.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* The stop as a photograph you can swipe. It fills whatever frame it is given —
   this component's own, or the trip photo it takes over — so the route beside
   it is never covered. */
export function StopCard({ stop, index, total, gain, img, onPrev, onNext, onClose, className = '' }) {
  const calm = useReducedMotion();
  const when = splitWhen(stop.day);
  return (
    <motion.div
      className={`tr__card ${className}`.trim()}
      role="dialog"
      aria-label={`${stop.name} — what happens here`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: EASE }}
      drag={calm ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.24}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x < -56 || info.velocity.x < -520) onNext();
        else if (info.offset.x > 56 || info.velocity.x > 520) onPrev();
      }}
    >
      {/* the photograph cross-fades under the text as the van moves on */}
      <AnimatePresence initial={false}>
        <motion.div
          key={stop.name}
          className="tr__shot"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Image
            src={artFor(stop, img)}
            alt={stop.name}
            fill
            sizes="(max-width:900px) 100vw, 520px"
            placeholder="blur"
            blurDataURL={BLUR}
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="tr__card-body">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={stop.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <p className="tr__card-meta">
              {when.day && <span className="chip chip--sun">{when.day}</span>}
              {when.at && <span className="tr__eta">arrives {when.at}</span>}
              <span className="tr__alt"><Mountain size={12} aria-hidden="true" /> {fmt(stop.m)} m</span>
              {gain > 0 && <span className="tr__gain">+{fmt(gain)} m</span>}
            </p>
            <h4>{stop.name}</h4>
            {stop.note && <p className="tr__card-note">{stop.note}</p>}
            {stop.does?.length > 0 && (
              <ul className="tr__card-list">{stop.does.map((a) => <li key={a}>{a}</li>)}</ul>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="tr__card-nav">
          <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Previous stop"><ChevronLeft size={16} /></button>
          <span className="tr__card-count">Stop {index + 1} of {total}</span>
          <button type="button" onClick={onNext} disabled={index === total - 1} aria-label="Next stop"><ChevronRight size={16} /></button>
          <button type="button" className="tr__card-x" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
      </div>
    </motion.div>
  );
}

/* The tarmac already travelled. pathLength="1" turns the dash pattern into a
   plain fraction of the route, so the lit stretch tracks `run` exactly — no
   arc-length maths, and it stays correct at any width. */
function LitRoad({ d, run, stroke }) {
  const offset = useMotionValue(1);
  useMotionValueEvent(run, 'change', (p) => offset.set(1 - clamp(p, 0, 1)));
  useEffect(() => { offset.set(1 - clamp(run.get(), 0, 1)); }, [offset, run, d]);
  return (
    <>
      <motion.path d={d} pathLength="1" className="tr__lit" stroke={stroke} strokeDasharray="1 1" style={{ strokeDashoffset: offset }} />
      <motion.path d={d} pathLength="1" className="tr__spark" strokeDasharray="0.006 0.028" style={{ strokeDashoffset: offset }} />
    </>
  );
}
