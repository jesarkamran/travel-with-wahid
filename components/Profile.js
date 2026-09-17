// The route drawn as its elevation profile — a hairline, not a chart.
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
  const uid = stops.map((s) => s.name).join('').replace(/\W/g, '').slice(0, 10);

  return (
    <div className={`pf${tall ? ' pf--tall' : ''} ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="pf__svg">
        <defs>
          <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sage)" stopOpacity=".26" />
            <stop offset="100%" stopColor="var(--sage)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`url(#g-${uid})`} />
        <path d={d} fill="none" stroke="var(--sage-deep)" strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="pf__marks">
        {stops.map((s, i) => (
          <div
            key={s.name}
            className={`pf__stop${i === 0 ? ' pf__stop--start' : ''}${i === stops.length - 1 ? ' pf__stop--end' : ''}`}
            style={{ left: `${(pts[i][0] / W) * 100}%`, top: `${(pts[i][1] / H) * 100}%` }}
          >
            <span className="pf__dot" />
            <span className="pf__tag">
              <b>{s.name}</b>
              <i>{s.m.toLocaleString('en-US')} m</i>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
