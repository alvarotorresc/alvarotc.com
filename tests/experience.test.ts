import { describe, it, expect } from 'vitest';
import { formatPeriod, sortExperience } from '../src/lib/experience';

const entry = (id: string, start: string) =>
  ({ id, data: { start } }) as unknown as Parameters<typeof sortExperience>[0][number];

describe('formatPeriod', () => {
  it('shows only years', () => {
    expect(formatPeriod('2022-03', '2024-06', 'en')).toBe('2022, 2024');
  });
  it('uses now when there is no end', () => {
    expect(formatPeriod('2024-07', undefined, 'en')).toBe('2024, now');
    expect(formatPeriod('2024-07', undefined, 'es')).toBe('2024, actualidad');
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
});
