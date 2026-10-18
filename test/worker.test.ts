/// <reference types="@cloudflare/vitest-pool-workers/types" />
import { SELF, env, reset } from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../src/worker';

type WorkerEnv = Env;

declare global {
  namespace Cloudflare {
    interface Env extends WorkerEnv {}
  }
}

const realFetch = globalThis.fetch;

const mockSiteverify = (success: boolean): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith('https://challenges.cloudflare.com/')) {
      return new Response(JSON.stringify({ success }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    return realFetch(input, init);
  });
};

const post = (path: string, body: unknown, ip = '1.2.3.4'): Promise<Response> =>
  SELF.fetch(`https://example.com${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const validBody = { nama: 'Budi', bisnis: 'Kopi', kebutuhan: 'Iklan', kontak: '0812', token: 'tok' };

const typedEnv: Env = env;

beforeEach(async () => {
  await reset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('worker', () => {
  it('GET /api/where tanpa cf balas {}', async () => {
    const res = await SELF.fetch('https://example.com/api/where');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });

  it('header CSP ada di /api/where', async () => {
    const res = await SELF.fetch('https://example.com/api/where');
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('POST /api/contact body invalid balas 400', async () => {
    const res = await post('/api/contact', { nama: 'Budi' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid' });
  });

  it('honeypot balas ok tanpa tulis KV', async () => {
    const res = await post('/api/contact', { ...validBody, website: 'spam.example' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const list = await typedEnv.CONTACT.list();
    expect(list.keys).toHaveLength(0);
  });

  it('token ditolak siteverify balas 403', async () => {
    mockSiteverify(false);
    const res = await post('/api/contact', validBody);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: 'captcha_failed' });
    const list = await typedEnv.CONTACT.list({ prefix: 'msg:' });
    expect(list.keys).toHaveLength(0);
  });

  it('token valid balas 200 dan simpan 1 pesan', async () => {
    mockSiteverify(true);
    const res = await post('/api/contact', validBody);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const list = await typedEnv.CONTACT.list({ prefix: 'msg:' });
    expect(list.keys).toHaveLength(1);
  });

  it('request ke-6 dari IP sama balas 429', async () => {
    mockSiteverify(true);
    for (let i = 0; i < 5; i++) {
      const ok = await post('/api/contact', validBody, '9.9.9.9');
      expect(ok.status).toBe(200);
    }
    const res = await post('/api/contact', validBody, '9.9.9.9');
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate_limited' });
  });

  it('POST /api/hit dua kali menghasilkan count 2', async () => {
    await post('/api/hit', '');
    const res = await post('/api/hit', '');
    expect(await res.json()).toEqual({ count: 2 });
    const get = await SELF.fetch('https://example.com/api/hit');
    expect(await get.json()).toEqual({ count: 2 });
  });

  it('/api/mcp tools/list balas 4 tools', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const data = (await res.json()) as { result: { tools: unknown[] } };
    expect(data.result.tools).toHaveLength(4);
  });

  it('/api/mcp notifikasi balas 202', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(res.status).toBe(202);
  });

  it('/api/mcp method tak dikenal balas -32601', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 2, method: 'nope' });
    const data = (await res.json()) as { error: { code: number } };
    expect(data.error.code).toBe(-32601);
  });

  it('/api/* lain balas 404 not_found', async () => {
    const res = await SELF.fetch('https://example.com/api/unknown');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: 'not_found' });
  });
});
