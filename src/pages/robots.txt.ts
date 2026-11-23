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
      // 다음(Daum) 웹마스터도구 소유확인 (2026-11-23)
      '#DaumWebMasterTool:5b849d833b427f66f15b9fa6c576cfd0896cf89fd2c6cc42951ea533ee1cb567:upewRfgI5y6IkdBZlCoHBQ==',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
