# nanansm.github.io

Web portofolio Nanan Somanan. Astro 5 (static) + Cloudflare Workers Static Assets. Tiga skin dari data yang sama (`src/data/site.ts`): TV console (desktop), handheld (mobile), manual (tanpa JS / reduced motion). Pilih manual lewat `?skin=tv|handheld|manual`.

## Prasyarat

- Node 22 (arm64 di Mac Apple Silicon).
- `npm install`

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Astro dev server (tanpa worker API) |
| `npm run build` | Build statis ke `dist/` |
| `npm run preview` | Build + `wrangler dev` di http://localhost:8787 (worker `/api/*` aktif, Turnstile test key) |
| `npm run check` | astro check + tsc + eslint + stylelint + vitest (worker) |
| `npm run test:e2e` | Playwright: 3 skin x 5 lebar, axe, keyboard, form contact |
| `npm run og` | Render `/og` jadi `public/og.png` (butuh `preview` jalan) |

## Struktur

- `src/data/site.ts`: semua teks + angka. Komponen cuma baca dari sini.
- `src/components/{manual,handheld,tv,shared}/`: tiga skin + panel bersama.
- `src/worker.ts`: `/api/where`, `/api/contact`, `/api/hit`, `/api/mcp`, header keamanan.
- `wrangler.jsonc`: binding KV `HITS`, `CONTACT`. Secret produksi `TURNSTILE_SECRET` diset lewat `wrangler secret put`.

## Deploy

Belum otomatis. Setelah KV dibuat dan ID-nya diisi di `wrangler.jsonc`: `npx wrangler deploy`.
