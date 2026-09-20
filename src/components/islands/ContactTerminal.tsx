import { useRef, useState, type FormEvent } from 'react';
import { t, type Locale } from '../../i18n/translations';
import {
  buildContactPayload,
  toErrorCode,
  validateContact,
  type ContactErrorCode,
} from '../../lib/contact';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface Props {
  lang: Locale;
  endpoint: string;
}

export default function ContactTerminal({ lang, endpoint }: Props) {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<ContactErrorCode | null>(null);
  const openedAt = useRef(Date.now());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = { from, subject, body };
    const invalid = validateContact(fields);
    if (invalid) {
      setError(invalid);
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildContactPayload(fields, website, Date.now() - openedAt.current)),
      });
      if (response.ok) {
        setFrom('');
        setSubject('');
        setBody('');
        setStatus('sent');
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      const code =
        typeof payload === 'object' && payload !== null && 'error' in payload
          ? payload.error
          : null;
      setError(toErrorCode(code));
      setStatus('error');
    } catch {
      setError('network');
      setStatus('error');
    }
  }

  function reset() {
    setError(null);
    setStatus('idle');
    openedAt.current = Date.now();
  }

  return (
    <form onSubmit={onSubmit} className="terminal flex flex-col overflow-hidden">
      <div className="terminal-bar flex items-center gap-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2c313b]" aria-hidden="true" />
        <span className="terminal-muted ml-2 text-xs">alvarotc.com, mail</span>
      </div>
      <div className="flex flex-col gap-2.5 p-4 text-[13px] leading-relaxed">
        <p className="flex gap-2.5">
          <span className="terminal-prompt">$</span>
          <span>mail alvaro</span>
        </p>
        <fieldset disabled={status === 'sending'} className="contents">
          <div className="flex items-center gap-2.5">
            <label htmlFor="c-from" className="terminal-muted w-[60px]">
              {t('contact.from', lang)}
            </label>
            <input
              id="c-from"
              name="from"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="terminal-input h-[30px] flex-1 px-2.5 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <label htmlFor="c-subject" className="terminal-muted w-[60px]">
              {t('contact.subject', lang)}
            </label>
            <input
              id="c-subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="terminal-input h-[30px] flex-1 px-2.5 text-[13px]"
            />
          </div>
          <div className="flex items-start gap-2.5">
            <label htmlFor="c-body" className="terminal-muted w-[60px] pt-1.5">
              {t('contact.body', lang)}
            </label>
            <textarea
              id="c-body"
              name="body"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="terminal-input flex-1 resize-y px-2.5 py-2 text-[13px]"
            />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p role="status" aria-live="polite" className="flex items-center gap-2.5 text-xs">
              {status === 'sent' && (
                <>
                  <span className="terminal-prompt">{t('contact.sent', lang)}</span>
                  <button
                    type="button"
                    onClick={reset}
                    className="terminal-button h-7 px-2.5 text-xs"
                  >
                    {t('contact.another', lang)}
                  </button>
                </>
              )}
              {status === 'error' && error !== null && (
                <span className="terminal-error">{t(`contact.error.${error}`, lang)}</span>
              )}
              {(status === 'idle' || status === 'sending') && (
                <span className="terminal-muted">{t('contact.note', lang)}</span>
              )}
            </p>
            {status !== 'sent' && (
              <button type="submit" className="terminal-button h-8 px-3.5 text-xs">
                {status === 'sending' ? t('contact.sending', lang) : t('contact.send', lang)} ↵
              </button>
            )}
          </div>
        </fieldset>
      </div>
    </form>
  );
}
