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

test('roas runner: buka dari manual, main, tutup', async ({ page }) => {
  const errs = watchConsole(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/?skin=manual');
  const opener = page.locator('[data-skin-root="manual"] [data-open-runner]');
  await opener.click();
  const dlg = page.locator('dialog.rr');
  await expect(dlg).toBeVisible();
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(opener).toBeFocused();
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

test('tv: keyboard map diam saat ROAS Runner terbuka', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?skin=tv');
  const root = page.locator('[data-skin-root="tv"]');
  await page.keyboard.press('Enter');
  await root.locator('[data-node="roas"]').click();
  await expect(page.locator('dialog.rr')).toBeVisible();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowUp');
  await expect(root.locator('[data-tv-view="panel"]')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.rr')).toBeHidden();
});
