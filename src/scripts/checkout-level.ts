export const TILE = 16;
export const VIEW_W = 320;
export const VIEW_H = 176;
export const GRAVITY = 900;
export const JUMP_V = -300;
export const MAX_RUN = 90;
export const ACCEL = 600;
export const FRICTION = 700;
export const COYOTE = 0.08;
export const JUMP_BUFFER = 0.1;
export const ENEMY_SPEED = 30;
export const TIME_PAR = 90;

const COLS = 180;
const ROWS = 11;
const ALLOWED = '#B?oePCF.';
const SOLID = '#B?';

const build = (): string[] => {
  const g: string[][] = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => '.'));
  const put = (r: number, c: number, ch: string): void => {
    const row = g[r];
    if (row) row[c] = ch;
  };
  const gap = (c0: number, c1: number): void => {
    for (let c = c0; c <= c1; c++) {
      put(9, c, '.');
      put(10, c, '.');
    }
  };
  const stack = (c: number, n: number): void => {
    for (let i = 0; i < n; i++) put(8 - i, c, 'B');
  };

  for (let c = 0; c < COLS; c++) {
    put(9, c, '#');
    put(10, c, '#');
  }

  // 0-30 tutorial
  put(8, 3, 'P');
  put(8, 9, 'o');
  put(8, 11, 'o');
  put(6, 14, '?');
  put(7, 19, 'o');
  put(8, 26, 'e');

  // 30-70 jurang + tangga
  gap(36, 37);
  put(7, 36, 'o');
  put(7, 37, 'o');
  stack(44, 1);
  stack(45, 2);
  stack(46, 2);
  stack(47, 1);
  gap(52, 54);
  put(7, 53, 'o');
  put(6, 62, '?');
  put(8, 64, 'o');
  put(8, 66, 'o');

  // checkpoint
  put(8, 75, 'C');

  // 80-140 musuh + platform
  put(8, 84, 'e');
  stack(88, 1);
  for (let c = 90; c <= 94; c++) put(6, c, 'B');
  put(5, 91, 'o');
  put(5, 93, 'o');
  put(8, 100, 'e');
  for (let c = 104; c <= 108; c++) put(6, c, '?');
  put(8, 112, 'o');
  put(8, 113, 'o');
  put(8, 118, 'e');
  gap(124, 126);
  put(7, 125, 'o');

  // 140-180 tangga ke finish
  put(8, 141, 'o');
  put(8, 143, 'o');
  for (let k = 1; k <= 5; k++) stack(147 + k, k);
  for (let c = 153; c < COLS; c++) stack(c, 5);
  put(3, 156, 'o');
  put(3, 158, 'o');
  put(3, 160, 'o');
  put(2, 157, 'o');
  put(2, 159, 'o');
  for (let r = 0; r <= 3; r++) put(r, 168, 'F');

  return g.map((row) => row.join(''));
};

export const LEVEL: readonly string[] = build();

export function validateLevel(rows: readonly string[]): string[] {
  const issues: string[] = [];
  const width = rows[0]?.length ?? 0;
  const h = rows.length;
  let starts = 0;
  let checks = 0;
  const finCols = new Set<number>();

  rows.forEach((row, r) => {
    if (row.length !== width) issues.push(`row ${r}: length ${row.length} != ${width}`);
    for (let c = 0; c < row.length; c++) {
      const ch = row[c] ?? '.';
      if (!ALLOWED.includes(ch)) issues.push(`row ${r} col ${c}: unknown symbol ${ch}`);
      if (ch === 'P') starts += 1;
      if (ch === 'C') checks += 1;
      if (ch === 'F') finCols.add(c);
    }
  });
  if (starts !== 1) issues.push(`P count ${starts} != 1`);
  if (checks !== 1) issues.push(`C count ${checks} != 1`);
  if (finCols.size !== 1) issues.push(`F columns ${finCols.size} != 1`);

  const heights: number[] = [];
  for (let c = 0; c < width; c++) {
    let n = 0;
    for (let r = h - 1; r >= 0; r--) {
      if (!SOLID.includes(rows[r]?.[c] ?? '.')) break;
      n += 1;
    }
    heights.push(n);
  }

  let run = 0;
  for (let c = 0; c <= width; c++) {
    if (c < width && heights[c] === 0) {
      run += 1;
      continue;
    }
    if (run > 3) issues.push(`gap width ${run} ending before col ${c}`);
    run = 0;
  }
  for (let c = 1; c < width; c++) {
    const diff = Math.abs((heights[c] ?? 0) - (heights[c - 1] ?? 0));
    if (diff > 2) issues.push(`height jump ${diff} at col ${c}`);
  }
  return issues;
}
