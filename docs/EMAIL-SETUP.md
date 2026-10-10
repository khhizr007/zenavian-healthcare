# Email setup

1. **Mailbox**: create info@yourdomain with Google Workspace or Zoho Mail (Zoho has a free tier). Add the MX records they give you at your DNS (Cloudflare DNS).
2. **SPF**: one TXT record on the root, e.g. `v=spf1 include:_spf.google.com include:amazonses.com ~all` (include your mailbox provider and Resend; keep to ONE SPF record).
3. **DKIM**: enable in the mailbox provider's admin console and add the TXT record it shows. Resend also gives you DKIM records.
4. **DMARC**: TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:info@yourdomain` to start; tighten to `quarantine` after a few weeks of clean reports.
5. **Resend**: create an account, Domains > Add domain, add the DNS records it lists, click Verify. Create an API key (sending access) and set `RESEND_API_KEY`. Set `FROM_EMAIL` to `ZenAvian Healthcare <noreply@yourdomain>` and `NOTIFY_EMAIL` to info@yourdomain.
6. **Test**: submit the contact form on the live site; check the notification and confirmation arrive (inbox, not spam). Test with mail-tester.com for a deliverability score.