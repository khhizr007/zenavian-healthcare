import { test, expect, type Page } from '@playwright/test';
import { PAGES } from './pages';

const localLinks = async (page: Page) =>
  page.$$eval('a[href]', (as) =>
    as.map((a) => a.getAttribute('href')!).filter((h) => h.startsWith('/') && !h.startsWith('//')),
  );

test.describe('navigation and links', () => {
  test('every page loads with one H1, a title under 60 chars and a description under 160', async ({
    page,
  }) => {
    for (const path of PAGES) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator('h1'), path).toHaveCount(1);
      const title = await page.title();
      expect(title.length, `${path} title`).toBeLessThanOrEqual(60);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc!.length, `${path} description`).toBeLessThanOrEqual(160);
    }
  });

  test('all header, footer and in-page internal links resolve (no broken links)', async ({
    page,
    request,
  }) => {
    const seen = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      for (const href of await localLinks(page)) seen.add(href.split('#')[0].split('?')[0]);
    }
    seen.delete('');
    for (const href of seen) {
      const res = await request.get(href);
      expect(res.status(), `broken link ${href}`).toBeLessThan(400);
    }
  });

  test('sitemap lists every page', async ({ request }) => {
    const index = await (await request.get('/sitemap-index.xml')).text();
    const smUrl = index.match(/<loc>([^<]+)<\/loc>/)![1];
    const xml = await (await request.get(new URL(smUrl).pathname)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    for (const p of PAGES) expect(locs, p).toContain(p);
    expect(locs).not.toContain('/catalogue-print');
  });

  test('robots.txt and custom 404', async ({ request, page }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
    await page.goto('/404');
    await expect(page.locator('h1')).toContainText('could not find');
  });

  test('mobile menu opens, closes with Escape and is keyboard operable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Open menu' });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(
      page.locator('#mobile-menu').getByRole('link', { name: 'Products' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });
});

test.describe('global features', () => {
  test('floating WhatsApp button is well-formed on every page', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const a = page.locator('a[data-track="whatsapp-float"]');
      await expect(a).toHaveCount(1);
      const href = (await a.getAttribute('href'))!;
      const u = new URL(href);
      expect(u.hostname).toBe('wa.me');
      expect(u.searchParams.get('text')).toBe(
        'Hello ZenAvian Healthcare, I would like to know more about your products.',
      );
      const box = await a.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }
  });

  test('product pages use a product-specific WhatsApp prefill', async ({ page }) => {
    await page.goto('/products/cox-zen');
    const href = await page.locator('a[data-track="whatsapp-click"]').first().getAttribute('href');
    expect(new URL(href!).searchParams.get('text')).toContain('Cox Zen');
  });

  test('map iframe loads only after clicking "Load map"', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'Load map' }).click();
    await expect(page.locator('iframe')).toHaveCount(1);
  });

  test('catalogue PDF downloads', async ({ page, request }) => {
    const res = await request.get('/downloads/ZenAvian-Healthcare-Catalogue.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
    await page.goto('/product-catalogue');
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: /Download Catalogue/ }).click(),
    ]);
    expect(dl.suggestedFilename()).toBe('ZenAvian-Healthcare-Catalogue.pdf');
  });

  test('product filter works and stays usable', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('[data-product]:visible')).toHaveCount(4);
    await page.getByRole('button', { name: 'Anticoccidial' }).click();
    await expect(page.locator('[data-product]:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Anticoccidial' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'All', exact: true }).first().click();
    await expect(page.locator('[data-product]:visible')).toHaveCount(4);
  });
});

test.describe('forms (endpoint mocked)', () => {
  const cases = [
    { path: '/distributor-enquiry', form: '#enquiry-form', api: '/api/enquiry' },
    { path: '/contact', form: '#contact-form', api: '/api/contact' },
    { path: '/report-adverse-event', form: '#adverse-form', api: '/api/adverse' },
  ];

  for (const c of cases) {
    test(`${c.path}: shows accessible inline errors, then submits`, async ({ page }) => {
      let calls = 0;
      await page.route(`**${c.api}`, async (route) => {
        calls++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
      });
      await page.goto(c.path);
      const form = page.locator(c.form);
      await form.getByRole('button', { name: /submit|send/i }).click();
      expect(calls).toBe(0);
      await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
      await expect(form.locator('#err-consent')).toContainText('consent');

      if (c.form === '#enquiry-form') {
        await form.getByLabel('Full name *').fill('Test Person');
        await form.getByLabel('Company / firm name *').fill('Test Traders');
        await form.getByLabel('Business type *').selectOption('Distributor / Dealer');
        await form.getByLabel('State *').fill('Maharashtra');
        await form.getByLabel('District / City *').fill('Pune');
        await form.getByLabel('Phone *').fill('+91 9876543210');
        await form.getByLabel('Email *').fill('test@example.com');
        await form.getByLabel('Cox Zen').check();
      } else if (c.form === '#contact-form') {
        await form.getByLabel('Name *').fill('Test Person');
        await form.getByLabel('Phone *').fill('9876543210');
        await form.getByLabel('Email *').fill('test@example.com');
        await form.getByLabel('Subject *').fill('Hello');
        await form.getByLabel('Message *').fill('A test message');
      } else {
        await form.getByLabel('Your name *').fill('Test Person');
        await form.getByLabel('Phone *').fill('9876543210');
        await form.getByLabel('Email *').fill('test@example.com');
        await form.getByLabel('Product name *').selectOption('Pulmo Zen');
        await form.getByLabel('Description of the event or feedback *').fill('Observation text');
      }
      await form.getByRole('checkbox', { name: /I agree/ }).check();
      await form.getByRole('button', { name: /submit|send/i }).click();
      await expect(form.locator('[data-status]')).toContainText('Thank you');
      expect(calls).toBe(1);
    });
  }

  test('invalid email is rejected client-side; server failure shows fallback contact', async ({
    page,
  }) => {
    await page.route('**/api/contact', (r) =>
      r.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'boom' }),
      }),
    );
    await page.goto('/contact');
    const form = page.locator('#contact-form');
    await form.getByLabel('Name *').fill('A');
    await form.getByLabel('Phone *').fill('9876543210');
    await form.getByLabel('Email *').fill('not-an-email');
    await form.getByLabel('Subject *').fill('S');
    await form.getByLabel('Message *').fill('M');
    await form.getByRole('checkbox', { name: /I agree/ }).check();
    await form.getByRole('button', { name: /send/i }).click();
    await expect(form.locator('[data-err="email"]')).toContainText('valid email');
    await form.getByLabel('Email *').fill('ok@example.com');
    await form.getByRole('button', { name: /send/i }).click();
    await expect(form.locator('[data-status]')).toContainText('WhatsApp');
  });
});

test.describe('content rules and quality', () => {
  test('no console errors, no TODO_CLIENT text, no fowlpox, no horizontal scroll', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    for (const path of PAGES) {
      await page.goto(path);
      const text = (await page.locator('body').innerText()).toLowerCase();
      expect(text, `${path} leaks placeholder`).not.toContain('todo_client');
      expect(text, `${path} mentions fowlpox`).not.toMatch(/fowl\s?pox/);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${path} horizontal overflow`).toBe(false);
    }
    expect(errors).toEqual([]);
  });

  test('product pages never invent label data and show the label-reference text', async ({
    page,
  }) => {
    for (const slug of ['cox-zen', 'pulmo-zen', 'bact-t-drop', 'allbact-z']) {
      await page.goto(`/products/${slug}`);
      await expect(
        page.getByText(
          'as approved on the product label. Please refer to the product label or contact us.',
        ),
      ).toBeVisible();
      await expect(page.getByText('Important information')).toBeVisible();
    }
  });

  for (const [w, h] of [
    [360, 640],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [1920, 1080],
  ] as const) {
    test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      for (const path of ['/', '/products', '/distributor-enquiry', '/product-catalogue']) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${path} @${w}`).toBe(false);
      }
    });
  }

  test('structured data: Organization, Product (no price), FAQPage, Breadcrumb, ContactPage', async ({
    page,
  }) => {
    const ld = async (path: string) => {
      await page.goto(path);
      return (
        await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent!))
      ).join('\n');
    };
    expect(await ld('/')).toContain('"Organization"');
    const prod = await ld('/products/cox-zen');
    expect(prod).toContain('"Product"');
    expect(prod).not.toMatch(/"(price|offers|aggregateRating|review)"/);
    expect(prod).toContain('BreadcrumbList');
    expect(await ld('/poultry-healthcare-solutions')).toContain('FAQPage');
    expect(await ld('/contact')).toContain('ContactPage');
  });
});
