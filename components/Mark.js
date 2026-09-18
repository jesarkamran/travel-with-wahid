import Image from 'next/image';

/* The real badge. It carries the wordmark inside the illustration, but at brand
   size that reads as an emblem — the text beside it is what you actually read.
   Served from a 240px copy: the export build does not resize, and the full
   500px original is 253KB for a badge this size. The original still backs the
   favicon, the manifest and the schema.org logo.

   The rendered size is CSS (.mark), not a prop, so it can scale with the
   viewport and shrink in the dock on a narrow phone. width/height here are the
   intrinsic ratio next/image needs, not the display size. */
export default function Mark({ className = '', priority = false }) {
  return (
    <Image
      className={`mark ${className}`.trim()}
      src="/logo-mark.png"
      alt=""
      width={240}
      height={240}
      priority={priority}
      style={{ height: 'auto' }}
    />
  );
}
