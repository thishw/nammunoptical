import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async (context) => {
  const guides = (await getCollection('guide')).sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf());
  return rss({
    title: '남문안경 안경 가이드',
    description: '1988년 개업 부천역 남문안경이 정리한 안경·렌즈·시력 정보',
    site: context.site!,
    items: guides.map((g) => ({
      title: g.data.title,
      description: g.data.description,
      pubDate: g.data.published,
      link: `/guide/${g.id}/`,
    })),
    customData: '<language>ko-kr</language>',
  });
};
