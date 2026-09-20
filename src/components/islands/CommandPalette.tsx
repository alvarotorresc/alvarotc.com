import { useCallback, useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { t, type Locale } from '../../i18n/translations';
import { searchItems, type SearchItem } from '../../lib/search';

export default function CommandPalette({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const results = searchItems(items ?? [], query, lang);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('command-palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('command-palette:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    if (items === null) {
      fetch('/search.json')
        .then((response) => response.json())
        .then((data: unknown) => setItems(Array.isArray(data) ? (data as SearchItem[]) : []))
        .catch(() => setItems([]));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, items]);

  useEffect(() => setActive(0), [query]);

  function go(url: string) {
    setOpen(false);
    void navigate(url);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = results[active];
      if (item) go(item.url);
    }
  }

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    if (document.activeElement === closeRef.current) inputRef.current?.focus();
    else closeRef.current?.focus();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/80 px-4 pt-[12vh]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.search', lang)}
        className="card w-full max-w-[560px] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onDialogKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-results"
            aria-activedescendant={results.length > 0 ? `palette-${active}` : undefined}
            placeholder={t('search.placeholder', lang)}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="h-12 flex-1 bg-transparent text-base outline-none"
          />
          <button
            ref={closeRef}
            type="button"
            aria-label={t('search.close', lang)}
            onClick={close}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-faint"
          >
            Esc
          </button>
        </div>

        <ul id="palette-results" role="listbox" aria-label={t('nav.search', lang)}>
          {results.map((item, index) => (
            <li
              key={item.url}
              id={`palette-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(item.url)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                index === active ? 'bg-surface-2' : ''
              }`}
            >
              <span className="rounded-md bg-surface-2 px-1.5 text-[11px] font-bold text-muted">
                {t(`search.kind.${item.kind}`, lang)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{item.title}</span>
                <span className="line-clamp-1 text-[13px] text-muted">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>

        {items !== null && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">{t('search.empty', lang)}</p>
        )}

        <p className="border-t border-border px-4 py-2 text-[11px] text-faint">
          {t('search.hint', lang)}
        </p>
      </div>
    </div>
  );
}
