import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type TimelineEntry = {
  period: string;
  title: string;
  summary: string;
  current: boolean;
};

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.75'] });
  const scaleY = reduced ? 1 : scrollYProgress;

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="absolute bottom-3 left-[5px] top-1.5 w-0.5 bg-surface-2 md:left-[125px]"
      >
        <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY }} />
      </div>

      <ol key={mounted ? 'live' : 'ssr'}>
        {entries.map((entry) => (
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
              aria-hidden
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full md:left-[120px] ${
                entry.current ? 'bg-accent ring-4 ring-accent/25' : 'border-2 border-border bg-bg'
              }`}
            />
            <div className="flex flex-col gap-1.5 md:pl-8">
              <h3 className="text-[17px] font-bold">{entry.title}</h3>
              <p className="max-w-[640px] text-sm leading-relaxed text-muted">{entry.summary}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
