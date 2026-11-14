import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({ es: z.string(), gl: z.string() });
const url = z.url();
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

// Hidden features (site.features): these collections are only rendered when their flag is on.
// getCollection() order is not the file order (entries come back by id): always sort by `date`.
const tour = defineCollection({
  loader: file('src/content/tour.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    city: localized,
    province: z.string(),
    zone: z.enum(['ourense', 'galicia', 'espana']),
    venue: z.string(),
    event: localized,
    ticketUrl: url.optional(),
    status: z.enum(['onsale', 'soldout', 'free']),
  }),
});

const releases = defineCollection({
  loader: file('src/content/releases.yaml'),
  schema: z.object({
    title: z.string(),
    type: z.enum(['single', 'remix', 'ep', 'album']),
    date: z.coerce.date(),
    bg: hex,
    fg: hex,
    links: z
      .object({
        spotify: url.optional(),
        apple: url.optional(),
        beatport: url.optional(),
        soundcloud: url.optional(),
        youtube: url.optional(),
      })
      .optional(),
  }),
});

const sets = defineCollection({
  loader: file('src/content/sets.yaml'),
  schema: z.object({
    title: localized,
    date: z.coerce.date(),
    duration: z.string(),
    image: z.string(),
    url: url.optional(),
  }),
});

export const collections = { tour, releases, sets };
