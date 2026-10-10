import { makeHandler, type Env } from '../_lib/handler';
import { enquirySchema } from '../../src/lib/schemas';

export const onRequestPost: PagesFunction<Env> = (ctx) =>
  makeHandler('enquiry', enquirySchema)(ctx);
// Only POST is routed above; any other method lands here.
export const onRequest: PagesFunction<Env> = async () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
