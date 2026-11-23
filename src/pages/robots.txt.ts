import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      'User-agent: Yeti',
      'Allow: /',
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', site).toString()}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
