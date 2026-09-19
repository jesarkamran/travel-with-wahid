'use client';
/* Shared motion primitives. Everything interactive on the site is built from
   these pieces, so the behaviour stays consistent and reduced-motion is
   honoured in exactly one place per primitive. */
import { useEffect, useRef, useState } from 'react';
import {
  motion, animate, useInView, useMotionValue, useSpring, useTransform,
  useReducedMotion, useScroll,
} from 'framer-motion';
import confetti from 'canvas-confetti';

/* --- smooth scroll -------------------------------------------------- */
export function SmoothScroll() {
  const calm = useReducedMotion();
  useEffect(() => {
    if (calm) return;
    let lenis, raf;
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
      const tick = (t) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    });
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  }, [calm]);
  return null;
}

/* --- reading progress: a hairline of ember across the top ----------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });
  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />;
}

/* --- entrance ------------------------------------------------------- */
export function Reveal({ children, delay = 0, y = 26, className, as = 'div', ...rest }) {
  const calm = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={calm ? false : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.22, 0.8, 0.3, 1] }}
      {...rest}
    >
      {children}
    </M>
  );
}

/* A line of display type wiped up from behind its own mask. */
export function MaskLine({ children, delay = 0, className }) {
  const calm = useReducedMotion();
  return (
    <span className={`mask ${className || ''}`}>
      <motion.span
        style={{ display: 'block' }}
        initial={calm ? false : { y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.1, delay, ease: [0.22, 0.8, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* --- magnetic pointer pull ------------------------------------------ */
export function Magnetic({ children, strength = 0.35, className }) {
  const calm = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const ref = useRef(null);

  const move = (e) => {
    if (calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onMouseMove={move}
      onMouseLeave={reset}
    >
      {children}
    </motion.span>
  );
}

/* --- counters -------------------------------------------------------- */
export function Counter({ to, duration = 1.6, format = (n) => Math.round(n).toLocaleString('en-US') }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '-10% 0px' });
  const calm = useReducedMotion();
  const [n, setN] = useState(calm ? to : 0);

  useEffect(() => {
    if (!seen || calm) return;
    const c = animate(0, to, { duration, ease: [0.22, 0.8, 0.3, 1], onUpdate: setN });
    return () => c.stop();
  }, [seen, to, duration, calm]);

  return <span ref={ref}>{format(n)}</span>;
}

/* --- 3D tilt --------------------------------------------------------- */
export function Tilt({ children, className, max = 7, style, ...rest }) {
  const calm = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const ref = useRef(null);

  const move = (e) => {
    if (calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={move}
      onMouseLeave={reset}
      style={calm ? style : { ...style, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* A radial glow that follows the cursor — CSS custom properties, no re-render. */
export function useCursorGlow() {
  return {
    onMouseMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
  };
}

/* --- parallax -------------------------------------------------------- */
/* Returns a motion value to hand straight to style.y. */
export function useParallax(ref, distance = 80) {
  const calm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return calm ? 0 : y;
}

/* --- conversion confetti --------------------------------------------- */
export function celebrate() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 42,
    origin: { y: 0.82 },
    colors: ['#D97736', '#F4A261', '#E76F51', '#F4F6F0', '#5E8C6E'],
    disableForReducedMotion: true,
  });
}
