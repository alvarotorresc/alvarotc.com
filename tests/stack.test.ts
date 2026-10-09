import { describe, it, expect } from 'vitest';
import { getStackGroups } from '../src/lib/stack';

describe('getStackGroups', () => {
  it('returns four groups for Spanish, with a translated data label', () => {
    const groups = getStackGroups('es');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Datos', 'Infra', 'Frontend']);
  });

  it('returns four groups for English, with an English data label', () => {
    const groups = getStackGroups('en');
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.label)).toEqual(['Backend', 'Data', 'Infra', 'Frontend']);
  });

  it('gives every group at least one item', () => {
    for (const group of getStackGroups('en')) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});
