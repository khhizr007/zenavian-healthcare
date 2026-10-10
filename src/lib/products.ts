import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

export const LABEL_REFERENCE_TEXT =
  'Composition, dosage and withdrawal period are as approved on the product label. Please refer to the product label or contact us.';

export async function getProducts(): Promise<Product[]> {
  return (await getCollection('products')).sort((a, b) => a.data.order - b.data.order);
}

/** Real pack-shot if /public/images/products/<slug>.webp exists (checked at build time), else neutral placeholder. */
export function productImage(slug: string): { src: string; isPlaceholder: boolean } {
  const real = `/images/products/${slug}.webp`;
  if (existsSync(join(process.cwd(), 'public', real))) return { src: real, isPlaceholder: false };
  return { src: '/images/products/placeholder.svg', isPlaceholder: true };
}
