import { describe, expect, it } from 'vitest';
import { LEVEL, validateLevel } from '../src/scripts/checkout-level';

describe('CHECKOUT RUN level', () => {
  it('lolos validasi fisika (jurang, tangga, simbol)', () => {
    expect(validateLevel(LEVEL)).toEqual([]);
  });

  it('validator menangkap jurang yang terlalu lebar', () => {
    const rows = LEVEL.map((r, y) => (y >= 9 ? `${r.slice(0, 20)}......${r.slice(26)}` : r));
    expect(validateLevel(rows).length).toBeGreaterThan(0);
  });
});
