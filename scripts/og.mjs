// Render halaman /og jadi public/og.png (1200x630). Butuh `npm run preview` jalan di 8787.
import { chromium } from 'playwright';

const base = process.env.OG_BASE ?? 'http://localhost:8787';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`${base}/og`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('.og').screenshot({ path: 'public/og.png' });
await browser.close();
console.log('public/og.png ok');
