import { describe, it, expect } from 'vitest';
import { buildContactPayload, toErrorCode, validateContact } from '../src/lib/contact';

const valid = { from: 'ana@example.com', subject: 'Hola', body: 'Un mensaje largo de prueba.' };

describe('validateContact', () => {
  it('accepts a well formed message', () => {
    expect(validateContact(valid)).toBeNull();
  });

  it('rejects a malformed email before anything else', () => {
    expect(validateContact({ ...valid, from: 'ana@example', subject: 'a', body: 'x' })).toBe(
      'invalid_email',
    );
    expect(validateContact({ ...valid, from: 'ana example.com' })).toBe('invalid_email');
    expect(validateContact({ ...valid, from: '' })).toBe('invalid_email');
  });

  it('checks the subject length after trimming', () => {
    expect(validateContact({ ...valid, subject: '  ab  ' })).toBe('subject_length');
    expect(validateContact({ ...valid, subject: 'abc' })).toBeNull();
    expect(validateContact({ ...valid, subject: 'a'.repeat(120) })).toBeNull();
    expect(validateContact({ ...valid, subject: 'a'.repeat(121) })).toBe('subject_length');
  });

  it('checks the body length after trimming', () => {
    expect(validateContact({ ...valid, body: '  123456789  ' })).toBe('body_length');
    expect(validateContact({ ...valid, body: '1234567890' })).toBeNull();
    expect(validateContact({ ...valid, body: 'a'.repeat(4000) })).toBeNull();
    expect(validateContact({ ...valid, body: 'a'.repeat(4001) })).toBe('body_length');
  });
});

describe('buildContactPayload', () => {
  it('trims the three fields and carries the honeypot and the elapsed time', () => {
    expect(
      buildContactPayload(
        { from: '  ana@example.com ', subject: '  Hola  ', body: '  Un mensaje largo.  ' },
        '',
        4200,
      ),
    ).toEqual({
      from: 'ana@example.com',
      subject: 'Hola',
      body: 'Un mensaje largo.',
      website: '',
      elapsed: 4200,
    });
  });
});

describe('toErrorCode', () => {
  it('passes through the codes the user can act on', () => {
    for (const code of [
      'invalid_email',
      'subject_length',
      'body_length',
      'too_fast',
      'rate_limited',
    ]) {
      expect(toErrorCode(code)).toBe(code);
    }
  });

  it('collapses everything else into generic', () => {
    expect(toErrorCode('send_failed')).toBe('generic');
    expect(toErrorCode('honeypot')).toBe('generic');
    expect(toErrorCode('clock_skew')).toBe('generic');
    expect(toErrorCode(undefined)).toBe('generic');
    expect(toErrorCode(42)).toBe('generic');
    expect(toErrorCode({ error: 'rate_limited' })).toBe('generic');
  });
});
