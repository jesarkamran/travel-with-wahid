export default function Mark({ className, size = 34 }) {
  return (
    <svg className={className} viewBox="0 0 36 36" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="18" cy="18" r="17" fill="none" stroke="currentColor" strokeWidth=".9" opacity=".28" />
      <circle cx="24.5" cy="13" r="3.1" fill="var(--sun)" opacity=".9" />
      <path d="M5.5 25.5 L13.5 12.5 L18.6 20.6 L21.8 15.8 L30.5 25.5 Z" fill="currentColor" opacity=".9" />
      <path d="M13.5 12.5 L10.6 17.2 L13.5 16 L16 17.3 Z" fill="var(--ink)" opacity=".95" />
    </svg>
  );
}
