import { EmailMessage } from 'cloudflare:email';
import {
  contactInfo,
  site,
  type AboutLevel,
  type CasesLevel,
  type ServicesLevel,
} from './data/site';

export interface Env {
  ASSETS: Fetcher;
  HITS: KVNamespace;
  CONTACT: KVNamespace;
  TURNSTILE_SECRET: string;
  TURNSTILE_SITEKEY: string;
  EMAIL?: SendEmail;
  CONTACT_TO?: string;
}

const MAX_BODY = 8 * 1024;
const RATE_LIMIT = 5;
const BANDUNG = { lat: -6.9175, lon: 107.6191 };
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
};

type JsonRpcId = string | number | null;

const json = (data: unknown, status = 200, extra: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const withSecurityHeaders = (res: Response): Response => {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const handleWhere = (req: Request): Response => {
  const headers = { 'Cache-Control': 'no-store' };
  if (req.method !== 'GET') return json({ ok: false, error: 'method_not_allowed' }, 405, headers);
  const cf = req.cf;
  if (!cf) return json({}, 200, headers);
  const lat = Number(cf.latitude);
  const lon = Number(cf.longitude);
  const city = cf.city;
  const country = cf.country;
  if (
    typeof cf.latitude !== 'string' ||
    typeof cf.longitude !== 'string' ||
    typeof city !== 'string' ||
    typeof country !== 'string' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    return json({}, 200, headers);
  }
  const distanceKm = Math.round(haversineKm(lat, lon, BANDUNG.lat, BANDUNG.lon));
  return json({ city, country, distanceKm }, 200, headers);
};

interface ContactInput {
  nama: string;
  bisnis: string;
  kebutuhan: string;
  kontak: string;
  token: string;
}

const readField = (body: Record<string, unknown>, key: string, max: number, required: boolean): string | null => {
  const raw = body[key];
  if (raw === undefined || raw === null) return required ? null : '';
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (v.length > max) return null;
  if (required && v.length === 0) return null;
  return v;
};

const parseContact = (body: Record<string, unknown>): ContactInput | null => {
  const nama = readField(body, 'nama', 80, false);
  const bisnis = readField(body, 'bisnis', 120, false);
  const kebutuhan = readField(body, 'kebutuhan', 1000, false);
  const kontak = readField(body, 'kontak', 120, true);
  const token = body['token'];
  if (nama === null || bisnis === null || kebutuhan === null || kontak === null) return null;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return null;
  return { nama, bisnis, kebutuhan, kontak, token };
};

const verifyTurnstile = async (env: Env, token: string, ip: string): Promise<boolean> => {
  try {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token);
    if (ip !== 'unknown') form.append('remoteip', ip);
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form });
    const data: unknown = await res.json();
    return isRecord(data) && data['success'] === true;
  } catch {
    return false;
  }
};

const headerSafe = (s: string): string => s.replace(/[\r\n]+/g, ' ').slice(0, 200);

// RFC 2047: header email wajib ASCII, nama ber-aksen dikirim sebagai base64 UTF-8.
const encodeHeader = (s: string): string => {
  let bin = '';
  new TextEncoder().encode(s).forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return `=?UTF-8?B?${btoa(bin)}?=`;
};

// Baca body maksimal MAX_BODY byte; null kalau lebih (termasuk body chunked tanpa Content-Length).
const readBody = async (req: Request): Promise<string | null> => {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_BODY) return null;
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) {
    all.set(c, off);
    off += c.byteLength;
  }
  return new TextDecoder().decode(all);
};

const sendEmail = async (env: Env, msg: ContactInput, ip: string): Promise<void> => {
  if (!env.EMAIL || !env.CONTACT_TO) return;
  try {
    const from = 'noreply@nanansm.com';
    const raw = [
      `From: ${from}`,
      `To: ${headerSafe(env.CONTACT_TO)}`,
      `Subject: ${encodeHeader(`Pesan baru dari ${headerSafe(msg.nama || msg.kontak)}`)}`,
      `Message-ID: <${crypto.randomUUID()}@nanansm.com>`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      `Nama: ${msg.nama}`,
      `Bisnis: ${msg.bisnis}`,
      `Kontak: ${msg.kontak}`,
      `IP: ${ip}`,
      '',
      msg.kebutuhan,
      '',
    ].join('\r\n');
    await env.EMAIL.send(new EmailMessage(from, env.CONTACT_TO, raw));
  } catch {
    // email gagal tidak boleh menggagalkan respons
  }
};

const handleContact = async (req: Request, env: Env): Promise<Response> => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  const invalid = (): Response => json({ ok: false, error: 'invalid' }, 400);

  const text = await readBody(req);
  if (text === null) return invalid();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return invalid();
  }
  if (!isRecord(body)) return invalid();

  const honeypot = body['website'];
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) return json({ ok: true });

  const input = parseContact(body);
  if (!input) return invalid();

  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
  const hour = new Date().toISOString().slice(0, 13).replace(/[-T]/g, '');
  const rlKey = `rl:${ip}:${hour}`;
  const used = Number((await env.CONTACT.get(rlKey)) ?? '0');
  if (Number.isFinite(used) && used >= RATE_LIMIT) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }
  await env.CONTACT.put(rlKey, String((Number.isFinite(used) ? used : 0) + 1), { expirationTtl: 3600 });

  if (!(await verifyTurnstile(env, input.token, ip))) {
    return json({ ok: false, error: 'captcha_failed' }, 403);
  }

  const at = new Date().toISOString();
  const record = {
    nama: input.nama,
    bisnis: input.bisnis,
    kebutuhan: input.kebutuhan,
    kontak: input.kontak,
    ip,
    ua: req.headers.get('User-Agent') ?? '',
    at,
  };
  await env.CONTACT.put(`msg:${at}:${crypto.randomUUID()}`, JSON.stringify(record));
  await sendEmail(env, input, ip);
  return json({ ok: true });
};

const handleHit = async (req: Request, env: Env): Promise<Response> => {
  const headers = { 'Cache-Control': 'no-store' };
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405, headers);
  }
  const current = Number((await env.HITS.get('total')) ?? '0');
  let count = Number.isFinite(current) ? current : 0;
  if (req.method === 'POST') {
    // satu hit per IP per hari: counter tidak bisa digelembungkan & write KV tetap kecil
    const ip = req.headers.get('cf-connecting-ip') ?? 'local';
    const seenKey = `seen:${ip}:${new Date().toISOString().slice(0, 10)}`;
    if ((await env.HITS.get(seenKey)) === null) {
      await env.HITS.put(seenKey, '1', { expirationTtl: 86400 });
      count += 1;
      await env.HITS.put('total', String(count));
    }
  }
  return json({ count }, 200, headers);
};

const toolData = (name: string): unknown => {
  switch (name) {
    case 'get_profile': {
      const about = site.levels.find((l): l is AboutLevel => l.id === '1-1');
      return { ...site.hero, paragraphs: about?.paragraphs ?? [], stats: about?.stats ?? [] };
    }
    case 'get_services': {
      const level = site.levels.find((l): l is ServicesLevel => l.id === '1-2');
      return level?.cards ?? [];
    }
    case 'get_case_studies': {
      const level = site.levels.find((l): l is CasesLevel => l.id === '2-1');
      return (level?.cases ?? []).map(({ client, title, intro, lesson }) => ({
        client,
        title,
        intro,
        lesson,
      }));
    }
    case 'contact_links':
      return contactInfo;
    default:
      return undefined;
  }
};

const TOOLS = [
  { name: 'get_profile', description: 'Profil singkat Nanan Somanan' },
  { name: 'get_services', description: 'Daftar layanan' },
  { name: 'get_case_studies', description: 'Case study klien' },
  { name: 'contact_links', description: 'Kontak dan tautan profil' },
].map((t) => ({ ...t, inputSchema: { type: 'object', properties: {} } }));

const rpcResult = (id: JsonRpcId, result: unknown): Response =>
  json({ jsonrpc: '2.0', id, result });

const rpcError = (id: JsonRpcId, code: number, message: string): Response =>
  json({ jsonrpc: '2.0', id, error: { code, message } });

const handleMcp = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  const text = await readBody(req);
  if (text === null) return rpcError(null, -32600, 'invalid_request');
  let msg: unknown;
  try {
    msg = JSON.parse(text);
  } catch {
    return rpcError(null, -32700, 'parse_error');
  }
  if (!isRecord(msg) || typeof msg['method'] !== 'string') {
    return rpcError(null, -32600, 'invalid_request');
  }
  if (!('id' in msg)) return new Response(null, { status: 202 });

  const rawId = msg['id'];
  const id: JsonRpcId = typeof rawId === 'string' || typeof rawId === 'number' ? rawId : null;
  const params = isRecord(msg['params']) ? msg['params'] : {};

  switch (msg['method']) {
    case 'initialize':
      return rpcResult(id, {
        protocolVersion: '2025-06-18',
        serverInfo: { name: 'nanansm', version: '1.0.0' },
        capabilities: { tools: {} },
      });
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'tools/call': {
      const name = params['name'];
      const data = typeof name === 'string' ? toolData(name) : undefined;
      if (data === undefined) return rpcError(id, -32602, 'unknown_tool');
      return rpcResult(id, { content: [{ type: 'text', text: JSON.stringify(data) }] });
    }
    default:
      return rpcError(id, -32601, 'method_not_found');
  }
};

const route = async (req: Request, env: Env): Promise<Response> => {
  const { pathname } = new URL(req.url);
  switch (pathname) {
    case '/api/where':
      return handleWhere(req);
    case '/api/contact':
      return handleContact(req, env);
    case '/api/hit':
      return handleHit(req, env);
    case '/api/mcp':
      return handleMcp(req);
    default:
      if (pathname === '/api' || pathname.startsWith('/api/')) {
        return json({ ok: false, error: 'not_found' }, 404);
      }
      return env.ASSETS.fetch(req);
  }
};

export default {
  async fetch(req, env, _ctx): Promise<Response> {
    try {
      return withSecurityHeaders(await route(req, env));
    } catch {
      // KV/binding gagal: tetap balas JSON supaya klien bisa tampilkan pesan error
      return withSecurityHeaders(json({ ok: false, error: 'server' }, 500));
    }
  },
} satisfies ExportedHandler<Env>;
