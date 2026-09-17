export default function Mark({ className, ring = true }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {ring && <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".45" />}
      <circle cx="26" cy="14" r="3.4" fill="var(--amber)" />
      <path d="M6 29 L15.5 15 L21 23 L24.5 18 L34 29 Z" fill="currentColor" />
      <path d="M15.5 15 L12.2 19.9 L15.5 18.6 L18.3 20 Z" fill="var(--snow)" />
    </svg>
  );
}
