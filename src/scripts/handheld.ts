import { createBackStack } from './back-stack';
import { play, type Sfx } from './sfx';

const KINDS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', 'game-over', 'faq', 'contact'] as const;
type Kind = (typeof KINDS)[number];
type State = 'boot' | 'menu' | 'egg' | Kind;
type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

const BTNS: readonly Btn[] = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
const LEVEL_COUNT = 6;
const EGG_PRESSES = 5;
const EGG_WINDOW_MS = 3000;
const BOOT_DELAY_MS = 600;

const isKind = (v: string | null | undefined): v is Kind => KINDS.some((k) => k === v);
const isBtn = (v: string | undefined): v is Btn => BTNS.some((b) => b === v);

function init(): void {
  const root = document.querySelector<HTMLElement>('[data-skin-root="handheld"]');
  if (!root) return;
  const scroller = root.querySelector<HTMLElement>('[data-hh-scroll]');
  const wipe = root.querySelector<HTMLElement>('[data-hh-wipe]');
  const indicator = root.querySelector<HTMLElement>('[data-hh-ind]');
  if (!scroller || !wipe || !indicator) return;

  const screens = Array.from(root.querySelectorAll<HTMLElement>('.hh__screen'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-menu]'));
  const hudLevel = root.dataset['hudLevel'] ?? '';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let state: State = 'boot';
  let sel = 0;
  let aTimes: number[] = [];
  let bootTimer = 0;

  const screenOf = (name: string): HTMLElement | undefined =>
    screens.find((s) => s.dataset['screen'] === name);

  const levelIndex = (): number => KINDS.findIndex((k) => k === state);

  const updateIndicator = (): void => {
    const i = levelIndex();
    const id = KINDS[i];
    indicator.textContent = i >= 0 && i < LEVEL_COUNT && id ? `${hudLevel} ${id}` : '';
  };

  const markSelected = (): void => {
    items.forEach((el, i) => {
      const on = i === sel;
      el.classList.toggle('is-sel', on);
      if (on) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
  };

  const runWipe = (): void => {
    if (reduce.matches) return;
    wipe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: 'steps(6, end)' });
  };

  const backStack = createBackStack('handheld', () => {
    show('menu', 'select');
  });

  const show = (next: State, sound: Sfx | null): void => {
    const target = screenOf(next);
    if (!target) return;
    window.clearTimeout(bootTimer);
    bootTimer = 0;
    for (const s of screens) s.hidden = s !== target;
    if (isKind(next)) backStack.enter();
    else backStack.leave();
    state = next;
    scroller.scrollTop = 0;
    updateIndicator();
    if (next === 'menu') markSelected();
    if (sound) {
      runWipe();
      play(sound);
      if (next === 'menu') {
        items[sel]?.focus({ preventScroll: true });
      } else if (isKind(next)) {
        target.querySelector<HTMLElement>(`#h-${next}-h`)?.focus({ preventScroll: true });
      }
    }
  };

  const reset = (): void => {
    aTimes = [];
    sel = 0;
    show('boot', null);
  };

  const setSel = (i: number): void => {
    sel = Math.min(Math.max(i, 0), items.length - 1);
    markSelected();
    items[sel]?.focus();
  };

  const step = (delta: number, wrap: boolean): boolean => {
    const i = levelIndex();
    if (i < 0) return false;
    const n = wrap ? (i + delta + KINDS.length) % KINDS.length : i + delta;
    const k = KINDS[n];
    if (k) show(k, 'select');
    return true;
  };

  const bootA = (): void => {
    const now = Date.now();
    aTimes = aTimes.filter((t) => now - t <= EGG_WINDOW_MS);
    aTimes.push(now);
    window.clearTimeout(bootTimer);
    if (aTimes.length >= EGG_PRESSES) {
      aTimes = [];
      show('egg', 'coin');
      return;
    }
    bootTimer = window.setTimeout(() => {
      aTimes = [];
      show('menu', 'start');
    }, BOOT_DELAY_MS);
  };

  const scrollScreen = (dir: 1 | -1): void => {
    scroller.scrollBy({
      top: dir * scroller.clientHeight * 0.6,
      behavior: reduce.matches ? 'auto' : 'smooth',
    });
  };

  const press = (btn: Btn): boolean => {
    const inLevel = levelIndex() >= 0;
    switch (btn) {
      case 'a': {
        if (state === 'boot') {
          bootA();
        } else if (state === 'menu') {
          const k = items[sel]?.dataset['menu'];
          if (isKind(k)) show(k, 'select');
        } else {
          screenOf(state)?.querySelector<HTMLElement>('[data-primary]')?.click();
        }
        return true;
      }
      case 'b': {
        if (inLevel) {
          sel = levelIndex();
          show('menu', 'select');
          return true;
        }
        if (state === 'egg') {
          show('boot', 'select');
          return true;
        }
        return false;
      }
      case 'start': {
        if (state === 'menu') return true;
        show('menu', state === 'boot' ? 'start' : 'select');
        return true;
      }
      case 'select':
        return step(1, true);
      case 'up':
      case 'down': {
        const dir = btn === 'up' ? -1 : 1;
        if (state === 'menu') {
          setSel(sel + dir);
          return true;
        }
        if (inLevel || state === 'egg') {
          scrollScreen(dir);
          return true;
        }
        return false;
      }
      case 'left':
        return step(-1, false);
      case 'right':
        return step(1, false);
    }
  };

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const key = t.closest<HTMLElement>('[data-btn]');
    if (key) {
      const b = key.dataset['btn'];
      if (isBtn(b)) press(b);
      return;
    }
    const item = t.closest<HTMLElement>('[data-menu]');
    if (item) {
      const k = item.dataset['menu'];
      const i = items.indexOf(item);
      if (isKind(k) && i >= 0) {
        sel = i;
        show(k, 'select');
      }
      return;
    }
    if (state === 'boot' && t.closest('[data-screen="boot"]')) {
      show('menu', 'start');
      return;
    }
    const go = t.closest<HTMLElement>('[data-goto]');
    const g = go?.getAttribute('data-goto');
    if (go && isKind(g)) {
      e.preventDefault();
      show(g, 'select');
    }
  });

  let sx = 0;
  let sy = 0;
  scroller.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0];
      if (!t) return;
      sx = t.clientX;
      sy = t.clientY;
    },
    { passive: true },
  );
  scroller.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0];
      if (!t || levelIndex() < 0) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1, false);
    },
    { passive: true },
  );

  window.addEventListener('keydown', (e) => {
    if (document.documentElement.dataset['skin'] !== 'handheld') return;
    // modal ROAS Runner pegang keyboard sendiri
    if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const t = e.target;
    if (t instanceof HTMLElement) {
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    }
    let btn: Btn | null = null;
    switch (e.key) {
      case 'ArrowUp':
        btn = 'up';
        break;
      case 'ArrowDown':
        btn = 'down';
        break;
      case 'ArrowLeft':
        btn = 'left';
        break;
      case 'ArrowRight':
        btn = 'right';
        break;
      case 'Escape':
      case 'Backspace':
        btn = 'b';
        break;
      case 'Enter':
        if (t instanceof Element && t.closest('a, button')) return;
        btn = state === 'boot' ? 'start' : 'a';
        break;
      default:
        return;
    }
    if (press(btn)) e.preventDefault();
  });

  window.addEventListener('skinchange', reset);
  reset();
}

init();
