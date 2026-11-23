// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 운영 도메인 (2026-11-23 확정). 이 한 줄이 canonical·OG·sitemap·JSON-LD·llms.txt 의 기준이다.
export const SITE_URL = 'https://nammunoptical.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
