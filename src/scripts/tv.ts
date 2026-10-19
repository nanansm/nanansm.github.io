import { createBackStack } from './back-stack';
import { play } from './sfx';

type Kind = '1-1' | '1-2' | '2-1' | '2-2' | '3-1' | '3-2' | 'game-over' | 'faq' | 'contact';
type ViewName = 'boot' | 'map' | 'panel';

const SEQ: readonly Kind[] = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', 'game-over', 'faq', 'contact'];

const LOGICAL_W = 320;
const LOGICAL_H = 240;
const MAX_SCALE = 4;
const SAFETY_PX = 4;
const SWAP_MS = 200;
const WIPE_MS = 400;
const INSERT_MS = 300;
const WIPE_COLS = 8;
const WIPE_ROWS = 6;

const isKind = (v: string | undefined): v is Kind => SEQ.some((k) => k === v);
const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init(): void {
  const root = document.querySelector<HTMLElement>('[data-skin-root="tv"]');
  if (!root) return;

  const stage = root.querySelector<HTMLElement>('[data-tv-stage]');
  const frame = root.querySelector<HTMLElement>('[data-tv-frame]');
  const body = root.querySelector<HTMLElement>('[data-tv-body]');
  const screen = root.querySelector<HTMLElement>('[data-tv-screen]');
  const hud = root.querySelector<HTMLElement>('[data-tv-hud]');
  const hudLevel = root.querySelector<HTMLElement>('[data-hud-level]');
  const bootView = root.querySelector<HTMLElement>('[data-tv-view="boot"]');
  const mapView = root.querySelector<HTMLElement>('[data-tv-view="map"]');
  const panelView = root.querySelector<HTMLElement>('[data-tv-view="panel"]');
  const sprite = root.querySelector<SVGElement>('[data-sprite]');
  const caption = root.querySelector<HTMLElement>('[data-tv-caption]');
  const scroll = root.querySelector<HTMLElement>('[data-tv-scroll]');
  const back = root.querySelector<HTMLButtonElement>('[data-tv-back]');
  const next = root.querySelector<HTMLButtonElement>('[data-tv-next]');
  const wipe = root.querySelector<HTMLElement>('[data-wipe]');
  const rack = root.querySelector<HTMLElement>('[data-cart-rack]');
  if (
    !stage || !frame || !body || !screen || !hud || !hudLevel || !bootView || !mapView ||
    !panelView || !sprite || !caption || !scroll || !back || !next || !wipe || !rack
  ) {
    return;
  }

  const nodes = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-node]'));
  const nodeIds = nodes.map((n) => n.dataset['node'] ?? '');
  const carts = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cart]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-cart-card]'));
  const slotCarts = Array.from(root.querySelectorAll<HTMLElement>('[data-slot-cart]'));
  const sections = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-tv-scroll] > [data-view]').forEach((s) => {
    sections.set(s.dataset['view'] ?? '', s);
  });
  if (nodes.length === 0) return;

  for (let r = 0; r < WIPE_ROWS; r += 1) {
    for (let c = 0; c < WIPE_COLS; c += 1) {
      const cell = document.createElement('span');
      cell.style.setProperty('--d', String(r + c));
      wipe.appendChild(cell);
    }
  }

  let current: ViewName = 'boot';
  let sel = 0;
  let kind: Kind | null = null;
  let cartIdx = -1;
  let inserting = false;
  let wiping = false;
  let timers: number[] = [];
  let revealTimer = 0;
  let rafId = 0;

  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  const clearTimers = (): void => {
    timers.forEach((t) => {
      window.clearTimeout(t);
    });
    timers = [];
    wiping = false;
    inserting = false;
    wipe.classList.remove('is-on');
  };

  const applyScale = (): void => {
    if (screen.offsetWidth === 0) return;
    const cs = window.getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const chromeW = body.offsetWidth - screen.offsetWidth;
    const chromeH = frame.offsetHeight - screen.offsetHeight;
    const availW = root.clientWidth - padX - chromeW;
    const availH = window.innerHeight - padY - chromeH - SAFETY_PX;
    const s = Math.floor(Math.min(availW / LOGICAL_W, availH / LOGICAL_H));
    const clamped = Number.isFinite(s) ? Math.max(1, Math.min(MAX_SCALE, s)) : 2;
    root.style.setProperty('--scale', String(clamped));
  };

  const scheduleScale = (): void => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(applyScale);
  };

  const updateHud = (): void => {
    let text = '';
    if (current === 'map') {
      text = nodes[sel]?.dataset['hud'] ?? '';
    } else if (current === 'panel' && kind) {
      text = sections.get(kind)?.dataset['hud'] ?? '';
    }
    if (text !== '') hudLevel.textContent = text;
  };

  const showOnly = (name: ViewName): void => {
    current = name;
    bootView.hidden = name !== 'boot';
    mapView.hidden = name !== 'map';
    panelView.hidden = name !== 'panel';
    hud.hidden = name === 'boot';
    updateHud();
  };

  const setSel = (i: number, focus: boolean): void => {
    const n = nodes[i];
    if (!n) return;
    sel = i;
    nodes.forEach((el, idx) => {
      if (idx === i) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    sprite.style.left = n.style.left;
    sprite.style.top = n.style.top;
    caption.textContent = n.dataset['caption'] ?? '';
    updateHud();
    if (focus) n.focus({ preventScroll: true });
  };

  const swap = (fn: () => void): void => {
    // aksi baru di tengah wipe: batalkan aksi lama yang masih antre, aksi terakhir yang menang
    if (wiping) clearTimers();
    if (reduceMotion()) {
      fn();
      return;
    }
    wiping = true;
    wipe.classList.add('is-on');
    later(fn, SWAP_MS);
    later(() => {
      wipe.classList.remove('is-on');
      wiping = false;
    }, WIPE_MS);
  };

  const closeCard = (focus: boolean): void => {
    const i = cartIdx;
    cartIdx = -1;
    inserting = false;
    window.clearTimeout(revealTimer);
    carts.forEach((c) => {
      c.classList.remove('is-inserting');
    });
    cards.forEach((c) => {
      c.hidden = true;
    });
    slotCarts.forEach((c) => {
      c.hidden = true;
    });
    rack.hidden = false;
    if (focus) carts[i]?.focus({ preventScroll: true });
  };

  const openCard = (i: number): void => {
    const btn = carts[i];
    const card = cards[i];
    const slotCart = slotCarts[i];
    if (!btn || !card || !slotCart || inserting) return;
    play('select');
    slotCart.hidden = false;
    const reveal = (): void => {
      inserting = false;
      btn.classList.remove('is-inserting');
      rack.hidden = true;
      card.hidden = false;
      cartIdx = i;
      scroll.scrollTop = 0;
      card.focus({ preventScroll: true });
    };
    if (reduceMotion()) {
      reveal();
      return;
    }
    inserting = true;
    btn.classList.add('is-inserting');
    revealTimer = window.setTimeout(reveal, INSERT_MS);
  };

  const syncSel = (k: Kind): void => {
    const id = k === 'game-over' || k === 'faq' ? '3-2' : k;
    const idx = nodeIds.indexOf(id);
    if (idx >= 0) setSel(idx, false);
  };

  const showMap = (): void => {
    swap(() => {
      backStack.leave();
      kind = null;
      showOnly('map');
      setSel(sel, true);
    });
  };

  const openPanel = (k: Kind): void => {
    swap(() => {
      backStack.enter();
      kind = k;
      showOnly('panel');
      sections.forEach((s, key) => {
        s.hidden = key !== k;
      });
      closeCard(false);
      next.hidden = SEQ.indexOf(k) >= SEQ.length - 1;
      scroll.scrollTop = 0;
      syncSel(k);
      updateHud();
      play('select');
      document.getElementById(`t-${k}-h`)?.focus({ preventScroll: true });
    });
  };

  const openNode = (i: number): void => {
    const id = nodeIds[i];
    if (id === 'checkout') {
      play('coin');
      window.dispatchEvent(new CustomEvent('checkoutrun:open'));
      return;
    }
    if (isKind(id)) openPanel(id);
  };

  const backStack = createBackStack('tv', () => {
    closeCard(false);
    showMap();
  });

  const goBack = (): void => {
    if (kind === '2-2' && cartIdx >= 0) {
      closeCard(true);
      return;
    }
    showMap();
  };

  const start = (): void => {
    if (current !== 'boot') return;
    play('start');
    showMap();
  };

  const reset = (): void => {
    backStack.leave();
    clearTimers();
    closeCard(false);
    kind = null;
    sel = 0;
    showOnly('boot');
    setSel(0, false);
    scheduleScale();
  };

  bootView.addEventListener('click', start);

  nodes.forEach((n, idx) => {
    n.addEventListener('click', () => {
      setSel(idx, false);
      openNode(idx);
    });
  });

  back.addEventListener('click', goBack);
  next.addEventListener('click', () => {
    if (!kind) return;
    const nk = SEQ[SEQ.indexOf(kind) + 1];
    if (nk) openPanel(nk);
  });

  scroll.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const go = e.target.closest<HTMLElement>('[data-goto]');
    if (go) {
      const k = go.dataset['goto'];
      if (isKind(k)) {
        e.preventDefault();
        openPanel(k);
      }
      return;
    }
    const cartBtn = e.target.closest<HTMLElement>('[data-cart]');
    if (cartBtn) {
      openCard(Number(cartBtn.dataset['cart']));
      return;
    }
    if (e.target.closest('[data-cart-back]')) closeCard(true);
  });

  document.addEventListener('keydown', (e) => {
    if (document.documentElement.dataset['skin'] !== 'tv') return;
    // modal game pegang keyboard sendiri
    if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    const t = e.target;
    if (
      t instanceof HTMLElement &&
      (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')
    ) {
      return;
    }
    const interactive = t instanceof HTMLElement && t.closest('a, button, summary') !== null;
    const activate = e.key === 'Enter' || e.key === ' ';

    if (current === 'boot') {
      if (activate && !interactive) {
        e.preventDefault();
        start();
      }
      return;
    }
    if (current === 'map') {
      const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      if (forward || backward) {
        e.preventDefault();
        const target = Math.max(0, Math.min(nodes.length - 1, sel + (forward ? 1 : -1)));
        if (target !== sel) {
          setSel(target, true);
          play('select');
        } else {
          setSel(sel, true);
        }
        return;
      }
      if (activate && !interactive) {
        e.preventDefault();
        openNode(sel);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      goBack();
    }
  });

  window.addEventListener('skinchange', reset);
  window.addEventListener('resize', scheduleScale);

  setSel(0, false);
  scheduleScale();
}

init();
