import { site, origin, has, hasAddress, formattedAddress } from '@/config/site';

type Json = Record<string, unknown>;
const abs = (p: string) => `${origin()}${p}`;

export function organizationSchema(): Json {
  const sameAs = Object.values(site.social).filter(has);
  const contactPoint: Json[] = [];
  if (has(site.phone) || has(site.email)) {
    contactPoint.push({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
      ...(has(site.phone) && { telephone: site.phone }),
      ...(has(site.email) && { email: site.email }),
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: site.name,
    url: abs('/'),
    logo: abs(site.logo.svg),
    description: site.description,
    slogan: site.tagline,
    ...(contactPoint.length && { contactPoint }),
    ...(sameAs.length && { sameAs }),
  };
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: abs('/'),
    name: site.name,
    publisher: { '@id': abs('/#organization') },
    inLanguage: 'en-IN',
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'Home', href: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: abs(it.href),
    })),
  };
}

export function productSchema(p: {
  slug: string;
  name: string;
  summary: string;
  category: string;
}): Json {
  // Deliberately no price, offers or review fields.
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.summary,
    category: p.category,
    url: abs(`/products/${p.slug}`),
    image: abs(`/og/products/${p.slug}.png`),
    brand: { '@type': 'Brand', name: site.name },
  };
}

export function faqSchema(items: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function contactPageSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${site.name}`,
    url: abs('/contact'),
  };
}

/** Only emitted when a real address is supplied. */
export function localBusinessSchema(): Json | null {
  if (!hasAddress()) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    url: abs('/'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [site.address.line1, site.address.line2].filter(has).join(', '),
      addressLocality: site.address.city,
      ...(has(site.address.state) && { addressRegion: site.address.state }),
      ...(has(site.address.postalCode) && { postalCode: site.address.postalCode }),
      addressCountry: site.address.country,
    },
    ...(has(site.phone) && { telephone: site.phone }),
    ...(has(site.email) && { email: site.email }),
    description: formattedAddress(),
  };
}
