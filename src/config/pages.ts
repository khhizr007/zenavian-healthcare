/**
 * SEO + page registry (title < 60 chars, description < 160 chars).
 * Kept as structured data so Hindi/Marathi versions can be added later (e.g. pages.hi.ts, /hi/ routes).
 * Product pages take their SEO fields from the products collection instead.
 */
export interface PageMeta {
  title: string;
  description: string;
  /** Short heading used on the generated OG image */
  og: string;
}

export const pages = {
  home: {
    title: 'ZenAvian Healthcare - Poultry Healthcare in India',
    description:
      'ZenAvian Healthcare is a poultry-focused veterinary pharmaceutical and nutritional company supporting farmers, veterinarians and distributors across India.',
    og: 'Advancing Poultry Health',
  },
  about: {
    title: 'About ZenAvian Healthcare | Poultry Health Company',
    description:
      'Learn about ZenAvian Healthcare: a poultry-focused veterinary pharmaceutical and nutritional company built on quality, innovation, reliability and trust.',
    og: 'About ZenAvian Healthcare',
  },
  products: {
    title: 'Poultry Healthcare Products | ZenAvian Healthcare',
    description:
      'Explore Cox Zen, Pulmo Zen, Bact-T Drop and Allbact-Z: poultry healthcare products for coccidiosis, respiratory and bacterial health challenges.',
    og: 'Poultry Healthcare Products',
  },
  quality: {
    title: 'Quality & Manufacturing | ZenAvian Healthcare',
    description:
      'ZenAvian Healthcare sources poultry healthcare products from carefully selected international manufacturing partners, with a focus on quality and compliance.',
    og: 'Quality You Can Trust',
  },
  solutions: {
    title: 'Poultry Healthcare Solutions | ZenAvian Healthcare',
    description:
      'Educational guidance on coccidiosis, respiratory health, gut health, E. coli and coryza in poultry, and how ZenAvian Healthcare supports farms.',
    og: 'Poultry Healthcare Solutions',
  },
  catalogue: {
    title: 'Product Catalogue (PDF) | ZenAvian Healthcare',
    description:
      'Download the ZenAvian Healthcare product catalogue and compare Cox Zen, Pulmo Zen, Bact-T Drop and Allbact-Z at a glance.',
    og: 'Product Catalogue',
  },
  distributor: {
    title: 'Poultry Distributor Enquiry India | ZenAvian Healthcare',
    description:
      'Partner with ZenAvian Healthcare to supply veterinarians and poultry farmers. Send a distributor or business enquiry online.',
    og: 'Become a Distributor',
  },
  contact: {
    title: 'Contact ZenAvian Healthcare',
    description:
      'Contact ZenAvian Healthcare by phone, WhatsApp, email or the enquiry form. Find our address and business hours.',
    og: 'Contact Us',
  },
  adverse: {
    title: 'Report an Adverse Event | ZenAvian Healthcare',
    description:
      'Report an adverse event or give feedback on a ZenAvian Healthcare product. Share the product name, batch number and details.',
    og: 'Report an Adverse Event',
  },
  privacy: {
    title: 'Privacy Policy | ZenAvian Healthcare',
    description:
      'How ZenAvian Healthcare collects, uses and protects personal data submitted through this website.',
    og: 'Privacy Policy',
  },
  terms: {
    title: 'Terms of Use | ZenAvian Healthcare',
    description: 'Terms of use for the ZenAvian Healthcare website.',
    og: 'Terms of Use',
  },
  disclaimer: {
    title: 'Disclaimer | ZenAvian Healthcare',
    description:
      'Information on this website is for general awareness. Use products only as per the approved label and veterinary advice.',
    og: 'Disclaimer',
  },
  notFound: {
    title: 'Page not found | ZenAvian Healthcare',
    description: 'The page you were looking for could not be found.',
    og: 'Page not found',
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;

export const pagePaths: Record<PageKey, string> = {
  home: '/',
  about: '/about',
  products: '/products',
  quality: '/quality-manufacturing',
  solutions: '/poultry-healthcare-solutions',
  catalogue: '/product-catalogue',
  distributor: '/distributor-enquiry',
  contact: '/contact',
  adverse: '/report-adverse-event',
  privacy: '/privacy-policy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  notFound: '/404',
};
