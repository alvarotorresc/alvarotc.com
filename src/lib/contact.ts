export type ContactFields = { from: string; subject: string; body: string };

export type ContactFieldError = 'invalid_email' | 'subject_length' | 'body_length';

export type ContactErrorCode =
  ContactFieldError | 'too_fast' | 'rate_limited' | 'network' | 'generic';

export type ContactPayload = {
  from: string;
  subject: string;
  body: string;
  website: string;
  elapsed: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const BODY_MIN = 10;
const BODY_MAX = 4000;

const PASS_THROUGH = [
  'invalid_email',
  'subject_length',
  'body_length',
  'too_fast',
  'rate_limited',
] as const;

export function validateContact(fields: ContactFields): ContactFieldError | null {
  const from = fields.from.trim();
  const subject = fields.subject.trim();
  const body = fields.body.trim();
  if (!EMAIL.test(from)) return 'invalid_email';
  if (subject.length < SUBJECT_MIN || subject.length > SUBJECT_MAX) return 'subject_length';
  if (body.length < BODY_MIN || body.length > BODY_MAX) return 'body_length';
  return null;
}

export function buildContactPayload(
  fields: ContactFields,
  website: string,
  elapsed: number,
): ContactPayload {
  return {
    from: fields.from.trim(),
    subject: fields.subject.trim(),
    body: fields.body.trim(),
    website,
    elapsed,
  };
}

export function toErrorCode(serverError: unknown): ContactErrorCode {
  if (typeof serverError !== 'string') return 'generic';
  return PASS_THROUGH.find((code) => code === serverError) ?? 'generic';
}
