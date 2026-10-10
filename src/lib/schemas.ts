/** Shared zod schemas: used by the browser (inline errors) AND by the Pages Functions (authoritative). */
import { z } from 'zod';

export const PRODUCT_NAMES = ['Cox Zen', 'Pulmo Zen', 'Bact-T Drop', 'Allbact-Z'] as const;
export const BUSINESS_TYPES = [
  'Distributor / Dealer',
  'Veterinarian / Clinic',
  'Poultry farm / Integrator',
  'Feed mill / Nutritionist',
  'Other',
] as const;

const text = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const phone = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-]{8,16}$/, 'Enter a valid phone number');
const consent = z.literal(true, {
  errorMap: () => ({ message: 'Please tick the consent box to continue' }),
});
const honeypot = z.string().max(0).optional().default('');

export const enquirySchema = z.object({
  fullName: text('Full name', 100),
  company: text('Company / firm name', 150),
  businessType: z.enum(BUSINESS_TYPES, { errorMap: () => ({ message: 'Select a business type' }) }),
  state: text('State', 80),
  city: text('District / City', 80),
  phone,
  whatsapp: z
    .string()
    .trim()
    .regex(/^([+]?[\d\s-]{8,16})?$/, 'Enter a valid WhatsApp number')
    .optional()
    .default(''),
  email: z.string().trim().email('Enter a valid email address').max(200),
  existingBusiness: z.string().trim().max(500).optional().default(''),
  products: z.array(z.enum(PRODUCT_NAMES)).default([]),
  message: z.string().trim().max(2000).optional().default(''),
  consent,
  website: honeypot,
  turnstileToken: z.string().optional().default(''),
});

export const contactSchema = z.object({
  fullName: text('Name', 100),
  phone,
  email: z.string().trim().email('Enter a valid email address').max(200),
  subject: text('Subject', 150),
  message: text('Message', 2000),
  consent,
  website: honeypot,
  turnstileToken: z.string().optional().default(''),
});

export const adverseSchema = z.object({
  fullName: text('Name', 100),
  phone,
  email: z.string().trim().email('Enter a valid email address').max(200),
  product: z.enum(PRODUCT_NAMES, { errorMap: () => ({ message: 'Select the product' }) }),
  batch: z.string().trim().max(60).optional().default(''),
  message: text('Description', 3000),
  consent,
  website: honeypot,
  turnstileToken: z.string().optional().default(''),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type AdverseInput = z.infer<typeof adverseSchema>;
export type FormKind = 'enquiry' | 'contact' | 'adverse';
