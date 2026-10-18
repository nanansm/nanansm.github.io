import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = () =>
  new Response(`${site.llmsTxt}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
