/**
 * Single source of truth for company facts.
 * Every unknown value is the literal string `TODO_CLIENT:<what is needed>`.
 * Run `npm run check:placeholders` to list what is still missing.
 * UI code must use the helpers below (isTodo / has) so TODO strings never reach visitors.
 */
export const site = {
  name: 'ZenAvian Healthcare',
  shortName: 'ZenAvian',
  tagline: 'Healthy Birds. Better Performance. Stronger Future.',
  description:
    'ZenAvian Healthcare is a poultry-focused veterinary pharmaceutical and nutritional products company serving veterinarians, farmers and distributors across India.',
  /** Production origin, e.g. https://www.example.com (no trailing slash) */
  domain: 'TODO_CLIENT:production domain, e.g. https://www.zenavian.in',
  /** Used only while domain is unknown so canonical/sitemap URLs stay valid. */
  fallbackOrigin: 'https://zenavian-healthcare.pages.dev',
  phone: 'TODO_CLIENT:phone number with country code, e.g. +91 98XXXXXXXX',
  whatsapp: 'TODO_CLIENT:WhatsApp number, digits only with country code, e.g. 9198XXXXXXXX',
  email: 'TODO_CLIENT:info@ company email address',
  adverseEventEmail: 'TODO_CLIENT:adverse-event / pharmacovigilance email (may be same as info@)',
  address: {
    line1: 'TODO_CLIENT:registered office address line 1',
    line2: '',
    city: 'TODO_CLIENT:city',
    state: 'TODO_CLIENT:state',
    postalCode: 'TODO_CLIENT:PIN code',
    country: 'IN',
  },
  businessHours: 'TODO_CLIENT:business hours, e.g. Mon-Sat, 9:30 am - 6:00 pm IST',
  map: {
    lat: 'TODO_CLIENT:latitude',
    lng: 'TODO_CLIENT:longitude',
    /** Google Maps "Embed a map" iframe src URL */
    embedUrl: 'TODO_CLIENT:Google Maps embed URL (share > embed a map > src)',
    placeUrl: 'TODO_CLIENT:Google Maps place URL',
  },
  social: {
    linkedin: 'TODO_CLIENT:LinkedIn page URL',
    facebook: 'TODO_CLIENT:Facebook page URL',
    instagram: 'TODO_CLIENT:Instagram URL',
    youtube: 'TODO_CLIENT:YouTube channel URL',
  },
  gst: 'TODO_CLIENT:GSTIN',
  cin: 'TODO_CLIENT:CIN / registration number',
  logo: { svg: '/brand/logo.svg', mark: '/brand/mark.svg' },
  /** Optional sections. Empty array / TODO => section hidden. */
  about: {
    foundingYear: 'TODO_CLIENT:founding year',
    founderMessage: 'TODO_CLIENT:founder message (approx. 80-150 words) and founder name',
    team: [] as { name: string; role: string }[],
  },
  /** Real certificates only. Leave empty until documents are supplied. */
  certifications: [] as { name: string; issuer: string; file?: string }[],
  /** Real numbers only. Stats strip is rendered only if this has entries. */
  stats: [] as { value: string; label: string }[],
  enquiryReplyTime: 'within 2 working days',
  analytics: {
    /** Cloudflare Web Analytics token (cookieless). */
    cloudflareToken: 'TODO_CLIENT:Cloudflare Web Analytics token',
    turnstileSiteKey: 'TODO_CLIENT:Turnstile site key (public)',
  },
  catalogue: { version: 'v1.0', date: 'October 2026' },
} as const;

export const isTodo = (v: unknown): boolean =>
  typeof v === 'string' && v.startsWith('TODO_CLIENT:');
export const has = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && !isTodo(v);

export const origin = (): string =>
  has(site.domain) ? site.domain.replace(/\/$/, '') : site.fallbackOrigin;

export const phoneHref = (): string | null =>
  has(site.phone) ? `tel:${site.phone.replace(/[^+\d]/g, '')}` : null;

export const emailHref = (subject?: string): string | null =>
  has(site.email)
    ? `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    : null;

export const DEFAULT_WA_MESSAGE =
  'Hello ZenAvian Healthcare, I would like to know more about your products.';

/** wa.me link. Without a number, wa.me/?text= lets the user choose a contact. */
export const waLink = (message: string = DEFAULT_WA_MESSAGE): string => {
  const digits = has(site.whatsapp) ? site.whatsapp.replace(/\D/g, '') : '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

export const mapsDirectionsUrl = (): string | null =>
  has(site.map.lat) && has(site.map.lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${site.map.lat},${site.map.lng}`
    : null;

export const hasAddress = (): boolean => has(site.address.line1) && has(site.address.city);

export const formattedAddress = (): string =>
  [
    site.address.line1,
    site.address.line2,
    site.address.city,
    site.address.state,
    site.address.postalCode,
  ]
    .filter(has)
    .join(', ');

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Quality & Manufacturing', href: '/quality-manufacturing' },
  { label: 'Poultry Healthcare Solutions', href: '/poultry-healthcare-solutions' },
  { label: 'Catalogue', href: '/product-catalogue' },
  { label: 'Contact', href: '/contact' },
] as const;
