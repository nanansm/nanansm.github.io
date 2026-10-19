import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SKINS = ['tv', 'handheld', 'manual'] as const;
const WIDTHS = [360, 390, 768, 1024, 1440];
const KINDS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', 'game-over', 'faq', 'contact'];

// Kumpulkan console error/warning + pageerror selama test.
const watchConsole = (page: Page): string[] => {
  const errs: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => errs.push(String(e)));
  return errs;
};

// Elemen teks visible di dalam root yang isinya tumpah keluar box-nya sendiri.
const textOverflow = (page: Page, rootSel: string): Promise<string[]> =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [`root ${sel} tidak ada`];
    const out: string[] = [];
    for (const el of root.querySelectorAll<HTMLElement>('*')) {
      if (el.closest('[data-marquee], .sr-only, [hidden]')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || el.clientWidth <= 1) continue;
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim())) continue;
      if (el.scrollWidth > el.clientWidth + 1) {
        out.push(`${el.tagName.toLowerCase()}.${el.className} "${(el.textContent ?? '').trim().slice(0, 40)}"`);
      }
    }
    return out;
  }, rootSel);

const axeSerious = async (page: Page, include: string): Promise<string[]> => {
  const res = await new AxeBuilder({ page }).include(include).analyze();
  return res.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
};

for (const skin of SKINS) {
  for (const width of WIDTHS) {
    test(`${skin} @${width}: tanpa error, tanpa overflow, axe bersih`, async ({ page }) => {
      const errs = watchConsole(page);
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/?skin=${skin}`);
      await page.waitForLoadState('load');
      await expect(page.locator('html')).toHaveAttribute('data-skin', skin);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(sw).toBeLessThanOrEqual(0);
      expect(await textOverflow(page, `[data-skin-root="${skin}"]`)).toEqual([]);
      expect(await axeSerious(page, `[data-skin-root="${skin}"]`)).toEqual([]);
      // skin lain wajib inert
      for (const other of SKINS.filter((s) => s !== skin)) {
        expect(await page.locator(`[data-skin-root="${other}"]`).evaluate((el) => (el as HTMLElement).inert)).toBe(true);
      }
      expect(errs).toEqual([]);
    });
  }
}

test('switch cartridge: siklus skin + localStorage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  const html = page.locator('html');
  await page.locator('[data-skin-switch]').click();
  await expect(html).toHaveAttribute('data-skin', 'handheld');
  await page.locator('[data-skin-switch]').click();
  await expect(html).toHaveAttribute('data-skin', 'manual');
  expect(await page.evaluate(() => localStorage.getItem('skin'))).toBe('manual');
  await page.goto('/');
  await expect(html).toHaveAttribute('data-skin', 'manual');
});

test('handheld: keyboard buka semua screen, panel tidak overflow', async ({ page }) => {
  const errs = watchConsole(page);
  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto('/?skin=handheld');
  await page.locator('[data-btn="start"]').click();
  const menu = page.locator('[data-skin-root="handheld"] [data-screen="menu"]');
  await expect(menu).toBeVisible();
  for (const kind of KINDS) {
    await menu.locator(`[data-menu="${kind}"]`).click();
    const screen = page.locator(`[data-skin-root="handheld"] [data-screen="${kind}"]`);
    await expect(screen).toBeVisible();
    await expect(page.locator(`#h-${kind}-h`)).toBeFocused();
    expect(await textOverflow(page, `[data-skin-root="handheld"] [data-screen="${kind}"]`)).toEqual([]);
    expect(await axeSerious(page, `[data-skin-root="handheld"] [data-screen="${kind}"]`)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();
  }
  // kanan = level berikutnya
  await menu.locator('[data-menu="1-1"]').click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-skin-root="handheld"] [data-screen="1-2"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('handheld: easter egg A 5x di boot', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/?skin=handheld');
  const a = page.locator('[data-btn="a"]');
  for (let i = 0; i < 5; i += 1) await a.click();
  await expect(page.locator('[data-skin-root="handheld"] [data-screen="egg"]')).toBeVisible();
});

test('tv: map → semua level, NEXT berantai, cartridge, BACK', async ({ page }) => {
  const errs = watchConsole(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  const root = page.locator('[data-skin-root="tv"]');
  await page.keyboard.press('Enter');
  // caption map masuk ke bar bawah, bukan ke tombol node
  await expect(root.locator('[data-tv-caption]')).not.toHaveText('');
  await expect(root.locator('[data-node="1-1"]')).toHaveText('1-1');
  for (const kind of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']) {
    await root.locator(`[data-node="${kind}"]`).click();
    await expect(page.locator(`#t-${kind}-h`)).toBeVisible();
    expect(await textOverflow(page, '[data-skin-root="tv"] [data-tv-view="panel"]')).toEqual([]);
    expect(await axeSerious(page, '[data-skin-root="tv"] [data-tv-view="panel"]')).toEqual([]);
    if (kind === '2-2') {
      await root.locator('[data-cart="0"]').click();
      await expect(root.locator('[data-cart-card="0"]')).toBeVisible();
      await root.locator('[data-cart-card="0"] [data-cart-back]').click();
      await expect(root.locator('[data-cart="0"]')).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(root.locator(`[data-node="${kind}"]`)).toBeVisible();
  }
  await root.locator('[data-node="3-2"]').click();
  for (const kind of ['game-over', 'faq', 'contact']) {
    await root.locator('[data-tv-next]').click();
    await expect(page.locator(`#t-${kind}-h`)).toBeVisible();
    expect(await textOverflow(page, '[data-skin-root="tv"] [data-tv-view="panel"]')).toEqual([]);
    expect(await axeSerious(page, '[data-skin-root="tv"] [data-tv-view="panel"]')).toEqual([]);
  }
  expect(errs).toEqual([]);
});

test('form contact manual: submit sukses (Turnstile test key)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/?skin=manual');
  const form = page.locator('[data-skin-root="manual"] [data-contact-form]');
  for (const field of await form.locator('input:not([name="website"]):not([type="hidden"]), textarea').all()) {
    const name = (await field.getAttribute('name')) ?? '';
    await field.fill(name === 'kontak' ? '081234567890' : 'Tes e2e Playwright');
  }
  // Turnstile test sitekey selalu lolos; tunggu token terisi
  await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('', { timeout: 15_000 });
  await form.locator('button[type="submit"]').click();
  const status = form.locator('[data-status]');
  await expect(status).toHaveText((await status.getAttribute('data-msg-success')) ?? '', { timeout: 15_000 });
});

test('back browser: handheld level → menu, tv panel → map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/?skin=handheld');
  await page.locator('[data-btn="start"]').click();
  const menu = page.locator('[data-skin-root="handheld"] [data-screen="menu"]');
  await menu.locator('[data-menu="2-1"]').click();
  await expect(page.locator('[data-skin-root="handheld"] [data-screen="2-1"]')).toBeVisible();
  await page.goBack();
  await expect(menu).toBeVisible();
  expect(new URL(page.url()).searchParams.get('skin')).toBe('handheld');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  const root = page.locator('[data-skin-root="tv"]');
  await page.keyboard.press('Enter');
  await root.locator('[data-node="1-2"]').click();
  await expect(page.locator('#t-1-2-h')).toBeVisible();
  await page.goBack();
  await expect(root.locator('[data-node="1-2"]')).toBeVisible();
});

test('deep link #anchor buka manual, switch membuang ?skin dari URL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#faq');
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'manual');
  await page.goto('/?skin=tv');
  await page.locator('[data-skin-switch]').click();
  expect(new URL(page.url()).searchParams.has('skin')).toBe(false);
});

test('tv: keyboard map diam saat Checkout Run terbuka', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  const root = page.locator('[data-skin-root="tv"]');
  await page.keyboard.press('Enter');
  await root.locator('[data-node="checkout"]').click();
  await expect(page.locator('dialog.cr')).toBeVisible();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowUp');
  await expect(root.locator('[data-tv-view="panel"]')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.cr')).toBeHidden();
});

// --- CHECKOUT RUN ---------------------------------------------------------

interface CrState {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  mode: string;
  retries: number;
  cpReached: boolean;
  need: boolean;
}

// Baca state lewat hook ?crdebug, plus keputusan "perlu lompat" dari tile & musuh di depan.
const crState = (page: Page): Promise<CrState> =>
  page.evaluate(() => {
    type Raw = Omit<CrState, 'need'> & {
      grid: string[][];
      enemies: { x: number; y: number; alive: boolean }[];
    };
    const s = (window as unknown as { __checkoutRun: () => Raw }).__checkoutRun();
    const T = 16;
    const solid = (c: number, r: number): boolean => '#B?U'.includes(s.grid[r]?.[c] ?? '.');
    const feet = Math.floor((s.y + 15) / T);
    const body = Math.floor((s.y + 7) / T);
    const head = Math.floor(s.y / T);
    let need = !solid(Math.floor((s.x + 13) / T), feet);
    for (const dx of [14, 22, 30]) {
      const c = Math.floor((s.x + dx) / T);
      if (solid(c, body) || solid(c, head)) need = true;
    }
    for (const e of s.enemies) {
      if (e.alive && e.x - s.x > 0 && e.x - s.x < 44 && Math.abs(e.y - s.y) < 20) need = true;
    }
    return { x: s.x, y: s.y, vy: s.vy, onGround: s.onGround, mode: s.mode, retries: s.retries, cpReached: s.cpReached, need };
  });

test('checkout run: buka dari manual, TV, handheld; Esc tutup + fokus balik', async ({ page }) => {
  const errs = watchConsole(page);
  const dlg = page.locator('dialog.cr');

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/?skin=manual');
  const opener = page.locator('[data-skin-root="manual"] [data-open-checkout]');
  const footerGame = page.locator('[data-skin-root="manual"] .footer__game');
  await expect(footerGame).toBeVisible();
  await expect(footerGame).toContainText('MAIN GAME');
  await expect(page.locator('dialog.rr')).toHaveCount(0);
  await opener.click();
  await expect(dlg).toBeVisible();
  expect(await axeSerious(page, 'dialog.cr')).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(opener).toBeFocused();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-skin-root="tv"] .tv-zone-sign')).toBeVisible();
  await expect(page.locator('[data-skin-root="tv"] .tv-zone-sign')).toContainText('MAIN GAME');
  await expect(page.locator('[data-node="roas"]')).toHaveCount(0);
  await page.locator('[data-skin-root="tv"] [data-node="checkout"]').click();
  await expect(dlg).toBeVisible();
  // dialog harus di tengah viewport, bukan nempel kiri-atas
  const box = await dlg.boundingBox();
  expect(box && Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(4);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();

  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto('/?skin=handheld');
  await page.locator('[data-btn="start"]').click();
  await expect(page.locator('[data-skin-root="handheld"] .hh__group').filter({ hasText: 'MAIN GAME' })).toBeVisible();
  await page.locator('[data-skin-root="handheld"] [data-menu="checkout"]').click();
  await expect(dlg).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  expect(errs).toEqual([]);
});

test('checkout run: bot tamat level → layar CTA WhatsApp', async ({ page }) => {
  test.setTimeout(150_000);
  const errs = watchConsole(page);
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/?skin=manual&crdebug');
  await page.locator('[data-skin-root="manual"] [data-open-checkout]').click();
  await page.keyboard.press('Space');
  await page.keyboard.down('ArrowRight');
  const t0 = Date.now();
  let jumpUntil = 0;
  let st = await crState(page);
  while (st.mode !== 'clear' && Date.now() - t0 < 120_000) {
    const now = Date.now();
    if (now > jumpUntil && st.onGround && st.need) {
      await page.keyboard.down('Space');
      jumpUntil = now + 380;
    } else if (now > jumpUntil) {
      await page.keyboard.up('Space');
    }
    await page.waitForTimeout(16);
    st = await crState(page);
  }
  await page.keyboard.up('ArrowRight');
  expect(st.mode).toBe('clear');
  expect(st.cpReached).toBe(true);
  const clear = page.locator('[data-cr-clear]');
  await expect(clear).toBeVisible();
  await expect(clear.locator('a')).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  await expect(clear.locator('a')).toBeFocused();
  expect(Number(await page.locator('[data-cr-high]').textContent())).toBeGreaterThan(0);
  expect(await axeSerious(page, 'dialog.cr')).toEqual([]);
  // main lagi: reset ke awal level
  await page.locator('[data-cr-replay]').click();
  await expect(clear).toBeHidden();
  expect((await crState(page)).x).toBeLessThan(80);
  expect(errs).toEqual([]);
});

test.describe('checkout run: HP', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });

  test('tombol ◀ ▶ A jalan + lompat', async ({ page }) => {
    const errs = watchConsole(page);
    await page.goto('/?skin=manual&crdebug');
    await page.locator('[data-skin-root="manual"] [data-open-checkout]').click();
    const jump = page.locator('[data-cr-pad="jump"]');
    const right = page.locator('[data-cr-pad="right"]');
    await expect(jump).toBeVisible();
    await expect(right).toBeVisible();
    await jump.tap(); // mulai
    await expect.poll(async () => (await crState(page)).mode).toBe('run');
    const x0 = (await crState(page)).x;
    await right.hover();
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    expect((await crState(page)).x).toBeGreaterThan(x0 + 20);
    await jump.tap();
    await expect.poll(async () => (await crState(page)).onGround, { timeout: 1000 }).toBe(false);
    expect(errs).toEqual([]);
  });
});
