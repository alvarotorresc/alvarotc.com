import { describe, it, expect } from 'vitest';
import { formatPeriod, hasMockExperience, sortExperience } from '../src/lib/experience';

const entry = (id: string, start: string, mock = false) =>
  ({ id, data: { start, mock } }) as unknown as Parameters<typeof sortExperience>[0][number];

describe('formatPeriod', () => {
  it('shows a year range with a hyphen', () => {
    expect(formatPeriod('2022-03', '2024-06', 'en')).toBe('2022 - 2024');
  });
  it('uses now when there is no end', () => {
    expect(formatPeriod('2024-07', undefined, 'en')).toBe('2024 - now');
    expect(formatPeriod('2024-07', undefined, 'es')).toBe('2024 - actualidad');
  });
  it('collapses same year', () => {
    expect(formatPeriod('2021-01', '2021-11', 'en')).toBe('2021');
  });
});

describe('sortExperience', () => {
  it('sorts newest first', () => {
    const list = [entry('a', '2017-09'), entry('b', '2024-07'), entry('c', '2022-03')];
    expect(sortExperience(list).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('keeps a stable, symmetric order for equal start dates', () => {
    expect(sortExperience([entry('a', '2024-07'), entry('b', '2024-07')]).map((e) => e.id)).toEqual(
      ['a', 'b'],
    );
  });
});

describe('hasMockExperience', () => {
  it('is false for an empty list', () => {
    expect(hasMockExperience([])).toBe(false);
  });

  it('is false when every entry is real', () => {
    expect(hasMockExperience([entry('a', '2024-07'), entry('b', '2022-03')])).toBe(false);
  });

  it('is true when any entry is flagged as mock', () => {
    expect(hasMockExperience([entry('a', '2024-07'), entry('b', '2022-03', true)])).toBe(true);
  });
});
