import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { navigate } from 'astro:transitions/client';
import type { Locale } from '../../i18n/translations';
import { cvPdfPath } from '../../lib/cv';
import { getStackGroups } from '../../lib/stack';

type Line = { kind: 'cmd' | 'out' | 'muted' | 'err'; text: string };

const SECTIONS: { id: string; slug: Record<Locale, string> }[] = [
  { id: 'about', slug: { en: 'about', es: 'sobre-mi' } },
  { id: 'projects', slug: { en: 'projects', es: 'proyectos' } },
  { id: 'experience', slug: { en: 'experience', es: 'experiencia' } },
  { id: 'writing', slug: { en: 'writing', es: 'articulos' } },
  { id: 'stats', slug: { en: 'stack', es: 'stack' } },
  { id: 'offclock', slug: { en: 'off-the-clock', es: 'fuera-del-teclado' } },
  { id: 'contact', slug: { en: 'contact', es: 'contacto' } },
];

const STRINGS = {
  en: {
    label: 'Interactive terminal',
    input: 'Command',
    hint: '# type help',
    notFound: (cmd: string) => `${cmd}: command not found`,
    noDir: (dir: string) => `cd: ${dir}: no such section`,
    noFile: (file: string) => `cat: ${file}: no such file`,
    help: [
      'help          this list',
      'ls            list sections',
      'cd <section>  go to a section',
      'cat stack     what I work with',
      'cv            open the CV',
      'lang en|es    switch language',
      'theme         toggle theme',
      'clear         clear screen',
    ],
    sudo: 'alvaro is not in the sudoers file. This incident will be reported.',
    rm: 'nice try. everything here is free software, fork it instead.',
  },
  es: {
    label: 'Terminal interactiva',
    input: 'Comando',
    hint: '# escribe help',
    notFound: (cmd: string) => `${cmd}: orden no encontrada`,
    noDir: (dir: string) => `cd: ${dir}: no existe esa sección`,
    noFile: (file: string) => `cat: ${file}: no existe ese fichero`,
    help: [
      'help          esta lista',
      'ls            listar secciones',
      'cd <sección>  ir a una sección',
      'cat stack     con qué trabajo',
      'cv            abrir el CV',
      'lang en|es    cambiar idioma',
      'theme         cambiar tema',
      'clear         limpiar pantalla',
    ],
    sudo: 'alvaro no está en el fichero sudoers. Este incidente será notificado.',
    rm: 'buen intento. todo esto es software libre, mejor haz un fork.',
  },
} as const;

function initialLines(lang: Locale): Line[] {
  return [
    { kind: 'cmd', text: 'whoami' },
    { kind: 'out', text: 'alvaro' },
    { kind: 'muted', text: STRINGS[lang].hint },
  ];
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function HeroTerminal({ lang, email }: { lang: Locale; email: string }) {
  const s = STRINGS[lang];
  const [lines, setLines] = useState<Line[]>(() => initialLines(lang));
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  function run(raw: string): Line[] {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    const out = (text: string): Line => ({ kind: 'out', text });
    const err = (text: string): Line => ({ kind: 'err', text });

    switch (cmd) {
      case '':
        return [];
      case 'help':
        return s.help.map(out);
      case 'whoami':
        return [out('alvaro')];
      case 'ls':
        return [out(SECTIONS.map((sec) => `${sec.slug[lang]}/`).join('  '))];
      case 'cd': {
        const target = arg.replace(/\/$/, '');
        const section = SECTIONS.find(
          (sec) => sec.id === target || sec.slug.en === target || sec.slug.es === target,
        );
        if (!section) return [err(s.noDir(arg || '~'))];
        const el = document.getElementById(section.id);
        el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        window.history.replaceState(null, '', `#${section.id}`);
        return [];
      }
      case 'cat':
        if (arg === 'stack' || arg === 'stack.txt') {
          return getStackGroups(lang).map((g) => out(`${g.label}: ${g.items.join(', ')}`));
        }
        return [err(s.noFile(arg))];
      case 'cv':
        window.location.assign(cvPdfPath(lang));
        return [];
      case 'lang':
        if (arg === 'en' || arg === 'es') {
          void navigate(arg === 'es' ? '/es/' : '/');
          return [];
        }
        return [out(lang)];
      case 'theme': {
        const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const next =
          arg === 'dark' || arg === 'light' ? arg : current === 'dark' ? 'light' : 'dark';
        if (typeof window.__applyTheme === 'function') window.__applyTheme(next);
        else document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem('theme', next);
        } catch {
          /* private mode */
        }
        return [];
      }
      case 'clear':
        return [];
      case 'sudo':
        return [err(s.sudo)];
      case 'rm':
        return [err(s.rm)];
      default:
        return [err(s.notFound(cmd))];
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const raw = value;
    const trimmed = raw.trim();
    setValue('');
    setCursor(-1);
    if (trimmed) setHistory((h) => [...h, trimmed]);
    if (trimmed === 'clear') {
      setLines([]);
      return;
    }
    setLines((prev) => [...prev, { kind: 'cmd', text: raw }, ...run(raw)]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (event.key === 'ArrowDown' && cursor !== -1) {
      event.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    }
  }

  return (
    <div
      role="group"
      aria-label={s.label}
      className="terminal flex w-full flex-col overflow-hidden rounded-xl text-[13px] leading-snug"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-bar flex items-center gap-1.5 px-2.5 py-2">
        <span className="h-2 w-2 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="terminal-muted ml-2 text-[11px]">{email}</span>
      </div>
      <div
        ref={bodyRef}
        className="flex h-[172px] flex-col gap-1.5 overflow-y-auto px-4 py-3.5 [scrollbar-color:#2c313b_transparent] [scrollbar-width:thin] md:h-[188px]"
      >
        <div aria-live="polite" className="flex flex-col gap-1.5">
          {lines.map((line, i) =>
            line.kind === 'cmd' ? (
              <p key={i} className="flex gap-1.5">
                <span className="terminal-muted">~</span>
                <span className="terminal-prompt">$</span>
                <span className="break-all">{line.text}</span>
              </p>
            ) : (
              <p
                key={i}
                className={
                  line.kind === 'muted'
                    ? 'terminal-muted'
                    : line.kind === 'err'
                      ? 'terminal-error'
                      : 'whitespace-pre-wrap break-words'
                }
              >
                {line.text}
              </p>
            ),
          )}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-1.5">
          <span className="terminal-muted" aria-hidden="true">
            ~
          </span>
          <span className="terminal-prompt" aria-hidden="true">
            $
          </span>
          {!focused && value === '' && (
            <span
              className="hero-cursor inline-block h-[1em] w-[0.6em] bg-[#e7e9ee]"
              aria-hidden="true"
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label={s.input}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[#e7e9ee] outline-none"
            style={{ caretColor: '#e7e9ee', fontFamily: 'var(--font-mono)' }}
          />
        </form>
      </div>
    </div>
  );
}
