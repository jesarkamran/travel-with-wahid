'use client';
/* The route as an elevation trail. The lit stretch draws itself on scroll, then
   follows the pointer from stop to stop; tapping a stop pins it and opens a card
   with what happens there.

   The lit line is revealed by a clip rectangle whose right edge sits exactly on
   the active stop's x. An earlier build animated pathLength to i/(n-1) instead,
   but that fraction is measured along the curve's arc length, not across the
   chart — and non-scaling-stroke skews the dash maths further — so the line
   always ran past (or short of) the stop. Stops are strictly left-to-right, so
   clipping on x ends the line on the dot every time, at any width. */
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const W = 1000;
const EASE = [0.22, 0.8, 0.3, 1];
const TIP_W = 296;
const fmt = (n) => n.toLocaleString('en-US');

export default function Profile({ stops, tall = false, className = '' }) {
  const n = stops.length;
  const last = n - 1;
  const H = tall ? 130 : 92;
  const top = 18;
  const bot = 12;
  const ms = stops.map((s) => s.m);
  const lo = Math.min(...ms);
  const span = Math.max(Math.max(...ms) - lo, 1);
  const x = (i) => (i * W) / last;
  const y = (m) => top + (1 - (m - lo) / span) * (H - top - bot);
  const pts = stops.map((s, i) => [x(i), y(s.m)]);

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < n; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = (px + cx) / 2;
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }

  // A ridge silhouette behind the line, derived from the elevations so it
  // redraws with the data rather than drifting.
  const ridge = pts.flatMap(([px, py], i) => {
    const next = pts[i + 1];
    if (!next) return [[px, py]];
    const peak = Math.min(py, next[1]) - 8 - ((stops[i].m % 7) + 3);
    return [[px, py], [(px + next[0]) / 2, Math.max(peak, 2)]];
  });
  const ridgeD = `M 0 ${H} ${ridge.map(([a, b]) => `L ${a} ${b}`).join(' ')} L ${W} ${H} Z`;

  const uid = `pf${useId().replace(/[^\w-]/g, '')}`;
  const calm = useReducedMotion();
  const ref = useRef(null);
  const btns = useRef([]);
  const drag = useRef(null);
  const seen = useInView(ref, { once: true, margin: '-10% 0px' });

  const [hover, setHover] = useState(null); // pointer preview
  const [pick, setPick] = useState(null);   // pinned — the card is open
  const [intro, setIntro] = useState(true); // the first draw staggers the dots
  const [cw, setCw] = useState(0);

  const on = pick ?? hover ?? last;
  const drawn = seen || calm;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close on a tap outside, or Escape.
  useEffect(() => {
    if (pick == null) return;
    const away = (e) => { if (!ref.current?.contains(e.target)) setPick(null); };
    const esc = (e) => { if (e.key === 'Escape') { setPick(null); btns.current[pick]?.focus(); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [pick]);

  const nearest = (clientX) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return null;
    const f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    return Math.round(f * last);
  };
  const choose = (i) => { setIntro(false); setPick(i); };
  const step = (dir) => choose(Math.min(Math.max((pick ?? on) + dir, 0), last));

  /* Pointer model:
     mouse  — moving previews the nearest stop, clicking pins it.
     touch  — a tap pins a stop; dragging sideways scrubs along the route with
              the card following your finger. Vertical drags still scroll. */
  const onPointerDown = (e) => {
    // A swipe on the open card steps between stops (its own drag handler) —
    // it must not also scrub the route underneath.
    if (e.target.closest('.pf__tip')) return;
    if (e.pointerType !== 'mouse') drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse') {
      setIntro(false);
      setHover(nearest(e.clientX));
      return;
    }
    const g = drag.current;
    if (!g) return;
    if (!g.moved && Math.abs(e.clientX - g.x) > 8) g.moved = true;
    if (g.moved) choose(nearest(e.clientX));
  };
  const onPointerUp = () => { setTimeout(() => { drag.current = null; }, 0); };
  const onClick = (e) => {
    if (drag.current?.moved) return;
    if (e.target.closest('.pf__tip')) return;
    const i = nearest(e.clientX);
    if (i == null) return;
    setPick((p) => (p === i ? null : i));
    setIntro(false);
  };

  const onKeyDown = (e) => {
    if (e.target.closest('.pf__tip')) return;
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = Math.min(Math.max(on + dir, 0), last);
    choose(i);
    btns.current[i]?.focus();
  };

  // Tooltip geometry: centred over the stop, clamped inside the chart, with the
  // arrow still pointing at the dot when the card is pushed against an edge.
  const tw = Math.min(TIP_W, cw || TIP_W);
  const sx = pick == null ? 0 : (pts[pick][0] / W) * cw;
  const tipLeft = Math.min(Math.max(sx - tw / 2, 0), Math.max(cw - tw, 0));
  const arrow = Math.min(Math.max(sx - tipLeft, 18), tw - 18);
  const s = pick == null ? null : stops[pick];
  const gain = s ? s.m - stops[0].m : 0;

  const pct = (i) => ({ left: `${(pts[i][0] / W) * 100}%`, top: `${(pts[i][1] / H) * 100}%` });

  return (
    <div
      ref={ref}
      className={`pf${tall ? ' pf--tall' : ''}${pick != null ? ' has-pick' : ''}${drawn ? ' is-drawn' : ''} ${className}`}
      style={{ '--h': `${H}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; }}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="pf__bar">
        <p className="pf__read" aria-live="polite">
          <b>{stops[on].name}</b>
          <span>{fmt(stops[on].m)} m</span>
          {on > 0 && <span className="pf__gain">+{fmt(stops[on].m - stops[0].m)} m</span>}
        </p>
        <p className="pf__hint" aria-hidden="true">
          <span className="pf__hint-fine">Click a stop for details</span>
          <span className="pf__hint-touch">Tap or slide along the route</span>
        </p>
      </div>

      <div className="pf__plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="pf__svg">
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sun)" stopOpacity=".16" />
              <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-ridge`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sage-deep)" stopOpacity=".28" />
              <stop offset="100%" stopColor="var(--sage-deep)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-lit`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--ember)" />
              <stop offset="100%" stopColor="var(--sun)" />
            </linearGradient>
            <clipPath id={`${uid}-clip`} clipPathUnits="userSpaceOnUse">
              <motion.rect
                x={-40}
                y={-40}
                height={H + 80}
                initial={calm ? false : { width: 0 }}
                animate={{ width: drawn ? pts[on][0] + 40 : 0 }}
                transition={{ duration: intro ? 1.6 : 0.5, ease: EASE }}
              />
            </clipPath>
          </defs>

          <path d={ridgeD} fill={`url(#${uid}-ridge)`} />
          <path d={d} fill="none" stroke="var(--sage-deep)" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" opacity=".7" vectorEffect="non-scaling-stroke" />

          {/* everything travelled so far, clipped to end on the active stop */}
          <g clipPath={`url(#${uid}-clip)`}>
            <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${uid}-g)`} />
            <path d={d} fill="none" stroke={`url(#${uid}-lit)`} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="pf__lit" />
            <path d={d} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 16" vectorEffect="non-scaling-stroke" className="pf__flow" />
          </g>
        </svg>

        {/* a plumb line from the active stop down to the ground */}
        <span className="pf__drop" style={pct(on)} aria-hidden="true" />

        <div className="pf__marks">
          {stops.map((st, i) => (
            <button
              key={st.name}
              ref={(el) => { btns.current[i] = el; }}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIntro(false); setPick((p) => (p === i ? null : i)); }}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${st.name}, ${fmt(st.m)} metres${st.day ? `, ${st.day}` : ''}. Show details`}
              aria-expanded={pick === i}
              className={[
                'pf__stop',
                i === 0 && 'pf__stop--start',
                i === last && 'pf__stop--end',
                drawn && i <= on && 'is-lit',
                i === on && 'is-on',
              ].filter(Boolean).join(' ')}
              style={{ ...pct(i), '--d': intro && drawn ? `${(i / last) * 1.35}s` : '0s' }}
            >
              <span className="pf__dot" />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {s && cw > 0 && (
            <motion.div
              className="pf__tip"
              role="dialog"
              aria-label={`${s.name} — what happens here`}
              style={{ width: tw, left: tipLeft, bottom: `calc(${100 - (pts[pick][1] / H) * 100}% + 20px)`, '--arrow': `${arrow}px` }}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              drag={calm ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.28}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.x < -48) step(1);
                else if (info.offset.x > 48) step(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pick}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="pf__tip-meta">
                    {s.day && <span className="chip chip--sun">{s.day}</span>}
                    <span>{fmt(s.m)} m</span>
                    {gain > 0 && <span className="pf__gain">+{fmt(gain)} m</span>}
                  </p>
                  <h4>{s.name}</h4>
                  {s.note && <p className="pf__tip-note">{s.note}</p>}
                  {s.does?.length > 0 && (
                    <ul className="pf__tip-list">{s.does.map((a) => <li key={a}>{a}</li>)}</ul>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="pf__tip-nav">
                <button type="button" onClick={() => step(-1)} disabled={pick === 0} aria-label="Previous stop"><ChevronLeft size={16} /></button>
                <span className="pf__tip-count">Stop {pick + 1} of {n}</span>
                <button type="button" onClick={() => step(1)} disabled={pick === last} aria-label="Next stop"><ChevronRight size={16} /></button>
                <button type="button" className="pf__tip-x" onClick={() => setPick(null)} aria-label="Close"><X size={15} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* labels sit on their own axis under the plot, so a high stop's name
          never lands on top of the line */}
      <div className="pf__axis" aria-hidden="true">
        {stops.map((st, i) => (
          <span
            key={st.name}
            className={[
              'pf__tag',
              i === 0 && 'pf__tag--start',
              i === last && 'pf__tag--end',
              i === on && 'is-on',
            ].filter(Boolean).join(' ')}
            style={{ left: `${(pts[i][0] / W) * 100}%` }}
          >
            <span className="pf__num">{i + 1}</span>
            <b>{st.name}</b>
            <i>{fmt(st.m)} m</i>
          </span>
        ))}
      </div>
    </div>
  );
}
