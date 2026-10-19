// Chiptune SFX lewat WebAudio. Dimatikan sejak tombol SOUND dihapus (19 Okt 2026); ubah `enabled` untuk menyalakan lagi.
export type Sfx = 'select' | 'coin' | 'jump' | 'start';

type Note = [freq: number, dur: number];

const PATTERNS: Record<Sfx, { wave: OscillatorType; notes: Note[] }> = {
  select: { wave: 'square', notes: [[660, 0.05]] },
  coin: { wave: 'square', notes: [[988, 0.06], [1319, 0.18]] },
  jump: { wave: 'square', notes: [[392, 0.04], [523, 0.04], [659, 0.06]] },
  start: { wave: 'triangle', notes: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.2]] },
};

const enabled = false;
let ctx: AudioContext | null = null;

export function play(name: Sfx): void {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const { wave, notes } = PATTERNS[name];
    let t = ctx.currentTime;
    for (const [freq, dur] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    /* audio tidak tersedia */
  }
}
