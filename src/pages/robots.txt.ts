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
      // 다음(Daum) 웹마스터도구 소유확인 (2026-11-24 PIN 재발급)
      '#DaumWebMasterTool:ac03800880fa86c97c00f952dcffe94ebd2d468b440d3e864481e89bbc43c1d0:4djnnmDYbaXJEU0i2qqWPQ==',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
