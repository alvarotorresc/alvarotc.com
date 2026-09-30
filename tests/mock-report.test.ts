import { describe, it, expect } from 'vitest';
import { mockEntries } from '../src/lib/mock-report';

describe('mockEntries', () => {
  it('returns only ids flagged as mock', () => {
    const ids = mockEntries([
      { id: 'a', data: { mock: true } },
      { id: 'b', data: {} },
      { id: 'c', data: { mock: false } },
    ]);
    expect(ids).toEqual(['a']);
  });
});
