// Dev helper: screenshot full-page tiap skin x lebar ke tests/screens/. Pakai: node tests/shot.mjs <baseURL> [skin,...] [width,...]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
const skins = (process.argv[3] ?? 'manual,handheld,tv').split(',');
const widths = (process.argv[4] ?? '360,768,1440').split(',').map(Number);
mkdirSync('tests/screens', { recursive: true });
const browser = await chromium.launch();
for (const skin of skins) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(`${base}/?skin=${skin}`, { waitUntil: 'load' }); await page.waitForTimeout(1200);
    const over = await page.evaluate(() => {
      const out = [];
      const sw = document.documentElement.scrollWidth;
      if (sw > innerWidth) out.push(`page scrollWidth ${sw} > ${innerWidth}`);
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('[data-marquee]') || el.classList.contains('sr-only')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || el.clientWidth <= 1 || getComputedStyle(el).display === 'none') continue;
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'auto' && el.clientWidth > 0)
          out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${el.scrollWidth}>${el.clientWidth}`);
      }
      return out.slice(0, 15);
    });
    await page.screenshot({ path: `tests/screens/${skin}-${w}.png`, fullPage: true });
    console.log(skin, w, 'errs:', errs.length ? errs : 0, 'overflow:', over.length ? over : 0);
    await page.close();
  }
}
await browser.close();
