import { enquirySchema, contactSchema, adverseSchema, type FormKind } from '@/lib/schemas';

const schemas = { enquiry: enquirySchema, contact: contactSchema, adverse: adverseSchema } as const;

function collect(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const data: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).map(String);
    data[key] = key === 'products' ? all : all[0];
  }
  if (!data.products && form.querySelector('[name="products"]')) data.products = [];
  data.consent = (form.elements.namedItem('consent') as HTMLInputElement | null)?.checked === true;
  data.turnstileToken = String(fd.get('cf-turnstile-response') ?? '');
  return data;
}

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[data-err]').forEach((e) => (e.textContent = ''));
  form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
}

function showErrors(
  form: HTMLFormElement,
  issues: { path: (string | number)[]; message: string }[],
) {
  let first: HTMLElement | null = null;
  for (const issue of issues) {
    const name = String(issue.path[0]);
    const slot = form.querySelector<HTMLElement>(`[data-err="${name}"]`);
    const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
    if (slot && !slot.textContent) slot.textContent = issue.message;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
  }
  first?.focus();
}

function setStatus(form: HTMLFormElement, tpl: 'success' | 'error', msg?: string) {
  const box = form.querySelector<HTMLElement>('[data-status]')!;
  const t = form.querySelector<HTMLTemplateElement>(`[data-tpl-${tpl}]`)!;
  box.replaceChildren(t.content.cloneNode(true));
  if (msg) box.querySelector('[data-error-msg]')!.textContent = msg;
  box.focus();
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
  const kind = form.dataset.kind as FormKind;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;

  const same = form.querySelector<HTMLInputElement>('#same-wa');
  same?.addEventListener('change', () => {
    const wa = form.elements.namedItem('whatsapp') as HTMLInputElement;
    const ph = form.elements.namedItem('phone') as HTMLInputElement;
    if (same.checked) {
      wa.value = ph.value;
      wa.readOnly = true;
    } else wa.readOnly = false;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    form.querySelector<HTMLElement>('[data-status]')!.replaceChildren();
    const parsed = schemas[kind].safeParse(collect(form));
    if (!parsed.success) {
      showErrors(form, parsed.error.issues);
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(`/api/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (res.ok && body.ok) {
        form.reset();
        setStatus(form, 'success');
        (window as unknown as { plausible?: (n: string) => void }).plausible?.(`form-${kind}`);
      } else {
        if (body.fields)
          showErrors(
            form,
            Object.entries(body.fields).map(([k, m]) => ({ path: [k], message: m })),
          );
        setStatus(form, 'error', body.error);
        (window as unknown as { turnstile?: { reset(): void } }).turnstile?.reset();
      }
    } catch {
      setStatus(form, 'error', 'Network error. Please check your connection and try again.');
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
});
