import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guide = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/guide' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().min(40).max(200),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    keywords: z.array(z.string()).default([]),
    summary: z.string(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })).min(1),
  }),
});

export const collections = { guide };
