import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type TimelineEntry = {
  period: string;
  title: string;
  summaryHtml: string;
  current: boolean;
};

const READING_LINE = 0.6;

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const firstDotRef = useRef<HTMLSpanElement>(null);
  const lastDotRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [trackInset, setTrackInset] = useState<{ top: number; bottom: number } | null>(null);
  const scaleY = useMotionValue(reduced ? 1 : 0);
  const offsetsRef = useRef<{ first: number; last: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (reduced) return;
    const container = ref.current;
    const firstDot = firstDotRef.current;
    const lastDot = lastDotRef.current;
    if (!container || !firstDot || !lastDot) return;

    const dotCenterOffset = (dot: HTMLSpanElement) => {
      const li = dot.offsetParent as HTMLElement | null;
      const liOffset = li ? li.offsetTop : 0;
      return liOffset + dot.offsetTop + dot.offsetHeight / 2;
    };

    let frame = 0;

    const measure = () => {
      const first = dotCenterOffset(firstDot);
      const last = dotCenterOffset(lastDot);
      offsetsRef.current = { first, last };
      setTrackInset({ top: first, bottom: Math.max(container.offsetHeight - last, 0) });
      updateProgress();
    };

    const updateProgress = () => {
      const offsets = offsetsRef.current;
      if (!offsets) return;
      const containerTop = container.getBoundingClientRect().top;
      const line = window.innerHeight * READING_LINE;
      const span = offsets.last - offsets.first;
      const progress = span > 0 ? (line - (containerTop + offsets.first)) / span : 1;
      scaleY.set(Math.min(Math.max(progress, 0), 1));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateProgress();
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', measure);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', measure);
    };
  }, [reduced, mounted, entries.length]);

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="absolute left-[5px] w-0.5 bg-surface-2 md:left-[125px]"
        style={
          trackInset
            ? { top: `${trackInset.top}px`, bottom: `${trackInset.bottom}px` }
            : { top: '0.375rem', bottom: '0.75rem' }
        }
      >
        <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY }} />
      </div>

      <ol key={mounted ? 'live' : 'ssr'}>
        {entries.map((entry, index) => (
          <motion.li
            key={`${entry.period} ${entry.title}`}
            className="relative grid grid-cols-1 gap-x-4 pb-10 pl-8 last:pb-0 md:grid-cols-[120px_minmax(0,1fr)] md:pl-0"
            initial={mounted && !reduced ? { opacity: 0, y: 12 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span
              className={`font-mono text-[13px] md:pr-8 ${entry.current ? 'text-accent' : 'text-faint'}`}
            >
              {entry.period}
            </span>
            <span
              ref={
                index === 0 ? firstDotRef : index === entries.length - 1 ? lastDotRef : undefined
              }
              aria-hidden
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full md:left-[120px] ${
                entry.current ? 'bg-accent ring-4 ring-accent/25' : 'border-2 border-border bg-bg'
              }`}
            />
            <div className="flex flex-col gap-1.5 md:pl-8">
              <h3 className="text-[17px] font-bold">{entry.title}</h3>
              <p
                className="max-w-[640px] text-sm leading-relaxed text-muted"
                dangerouslySetInnerHTML={{ __html: entry.summaryHtml }}
              />
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
