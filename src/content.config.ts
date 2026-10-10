import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Product schema. Every "?" field in the brief is nullable: when null the UI shows the
 * label-reference text. NEVER invent composition, dosage, withdrawal period or pack sizes.
 */
const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    tagline: z.string(),
    category: z.enum([
      'Anticoccidial',
      'Respiratory Healthcare',
      'Antibacterial / Respiratory Healthcare',
      'Antibacterial / Poultry Healthcare',
    ]),
    targetSpecies: z.array(z.string()),
    focusAreas: z.array(z.string()),
    summary: z.string(),
    keyPoints: z.array(z.string()),
    educationalNote: z.string().nullable().default(null),
    labelNote: z.string().nullable().default(null),
    composition: z.string().nullable().default(null),
    dosage: z.string().nullable().default(null),
    withdrawalPeriod: z.string().nullable().default(null),
    packSizes: z.string().nullable().default(null),
    dosageForm: z.string().nullable().default(null),
    storage: z.string().nullable().default(null),
    regulatoryNote: z.string().nullable().default(null),
    image: z.string().nullable().default(null),
    brochurePdf: z.string().nullable().default(null),
    related: z.array(z.string()).default([]),
    order: z.number().default(0),
    seoTitle: z.string().max(60),
    seoDescription: z.string().max(160),
  }),
});

export const collections = { products };
