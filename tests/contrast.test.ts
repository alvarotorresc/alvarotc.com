import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../src/lib/contrast';

describe('contrastRatio', () => {
  it('black on white is 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#4f8ef7', '#0f1115')).toBeCloseTo(contrastRatio('#0f1115', '#4f8ef7'), 5);
  });

  it('same color is 1', () => {
    expect(contrastRatio('#abcdef', '#abcdef')).toBeCloseTo(1, 5);
  });
});
