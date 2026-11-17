// The whole product, in order: setup and claim, dashboard, sending provider, users, receiving,
// reading, replying with correct threading headers, search, and member isolation.
// With OI_SCREENSHOTS=1 it also refreshes the README screenshots in docs/screenshots.
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const MOCK = 'http://127.0.0.1:8790';
const APP = 'http://localhost:5174';
const PASSWORD = 'correct horse battery staple';
const shots = process.env.OI_SCREENSHOTS === '1';

function encryptionKey(): string {
  try {
    const vars = readFileSync('.dev.vars', 'utf8').match(/^ENCRYPTION_KEY=(.+)$/m);
    if (vars) return vars[1].trim();
  } catch {
    // no .dev.vars (CI): vite.config.ts provides the e2e key
  }
  return 'e2e-encryption-key-0123456789abcdef0123456789';
}

async function shot(page: Page, name: string) {
  if (!shots) return;
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screenshots/${name}.png` });
}

async function deliver(raw: string, from: string, to: string) {
  const res = await fetch(`${APP}/cdn-cgi/handler/email?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
    method: 'POST',
    body: raw.replace(/\r?\n/g, '\r\n'),
  });
  return res.status;
}

function mail(o: { from: string; to: string; subject: string; body: string; id: string; extra?: string }) {
  return [
    `From: ${o.from}`,
    `To: ${o.to}`,
    `Subject: ${o.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${o.id}>`,
    'Authentication-Results: mx.cloudflare.net; dkim=pass header.d=acme.test; dmarc=pass header.from=acme.test; spf=pass smtp.mailfrom=maya@acme.test',
    ...(o.extra ? [o.extra] : []),
    'Content-Type: text/plain; charset=utf-8',
    '',
    o.body,
    '',
  ].join('\n');
}

test.beforeAll(async () => {
  await fetch(`${MOCK}/__mock/reset`);
});

test('setup, send, receive, reply, search and isolate members', async ({ page, browser }) => {
  // 1. Setup: checks, admin email, domain automation.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to NECROS Mail' })).toBeVisible();
  // Setup and auth pages must offer a working theme switch even before the owner signs in.
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())).toBe('#212529');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe('#adb5bd');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim())).toBe('#343a40');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 30_000 });
  await shot(page, 'setup-checks');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('example.com does not receive mail yet')).toBeVisible();
  await page.locator('#name').fill('Sam Owner');
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#confirm').fill(PASSWORD);
  await page.locator('#key').fill('wrong key');
  await page.getByRole('button', { name: 'Create and set up' }).click();
  await expect(page.getByText('not the ENCRYPTION_KEY')).toBeVisible();
  await page.locator('#key').fill(encryptionKey());
  await shot(page, 'setup-admin');
  await page.getByRole('button', { name: 'Create and set up' }).click();
  await expect(page.getByText("You're all set")).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Open the dashboard' }).click();
  await expect(page.getByText('Mail traffic')).toBeVisible();
  await expect(page.getByText('Welcome aboard!')).toBeVisible();
  // A compact, accessible in-app notification center is available on all authenticated pages.
  const notifications = page.getByRole('button', { name: 'Notifications' });
  await expect(notifications).toBeVisible();
  await notifications.click();
  await expect(page.getByRole('region', { name: 'Recent notifications' })).toBeVisible();
  await notifications.click();

  // 2. Connect Resend: domain registered, DNS written, verified.
  await page.goto('/admin/integrations');
  await page.getByRole('button', { name: /Resend/ }).first().click();
  await page.locator('#apiKey').fill('re_e2e_key');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.getByText('Resend connected')).toBeVisible();
  await expect(page.getByText('Verified', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText('Verified for sending')).toBeVisible();

  // The sender logo dialog fixes what keeps mail apps from showing a logo: here the p=none DMARC
  // policy setup added.
  await page.goto('/admin/domains');
  await page.getByRole('button', { name: 'Add a logo' }).click();
  await expect(page.getByText("DMARC isn't enforced")).toBeVisible();
  await page.getByRole('button', { name: 'Fix' }).click();
  await expect(page.getByText('_dmarc.example.com becomes')).toContainText('v=DMARC1; p=quarantine');
  await page.getByRole('button', { name: 'Enforce DMARC' }).click();
  await expect(page.getByText('DMARC is enforced')).toBeVisible();
  // A logo can also come from an address; the server checks it first.
  await page.getByRole('textbox', { name: 'Logo address' }).fill('http://example.com/logo.svg');
  await page.getByRole('button', { name: 'Load' }).click();
  await expect(page.getByText('Use an https:// address.')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

  // 3. Add a member with their own inbox. The dialog loads the domains itself: while they are on
  // the way it must not submit without one.
  await page.route('**/api/admin/domains', async (route) => {
    await new Promise((r) => setTimeout(r, 1000));
    await route.continue();
  });
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Add a user' }).click();
  const addUserDialog = page.getByRole('dialog', { name: 'Add a user' });
  await expect(addUserDialog).toHaveAttribute('aria-modal', 'true');
  await expect(addUserDialog).toHaveAttribute('aria-describedby', /.+/);
  const dialogClose = addUserDialog.getByRole('button', { name: 'Close', exact: true });
  await dialogClose.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(addUserDialog.locator('button:not([disabled])').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialogClose).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(addUserDialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add a user' })).toBeFocused();
  await page.getByRole('button', { name: 'Add a user' }).click();
  await page.locator('#name').fill('Bob Member');
  await page.locator('#local').fill('bob');
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
  await expect(page.getByText('Share these sign-in details')).toBeVisible();
  await page.unroute('**/api/admin/domains');
  const bobPassword = (await page.getByRole('dialog').locator('.font-mono').textContent())!.trim();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText('bob@example.com').first()).toBeVisible();

  // A designed signature (#11): a table, a logo and a class styled from a <style> block.
  await page.goto('/settings/signature');
  await page.locator('textarea').first().fill(
    '<style>.role { color: #667788; font-style: italic }</style><table cellpadding="0" cellspacing="0"><tr><td bgcolor="#f5f7fa" style="padding:8px"><img src="https://cdn.example.com/logo.png" width="48" height="48" alt="Acme logo" style="display:block"></td><td style="padding-left:12px"><b>Sam Owner</b><br><span class="role">Founder</span></td></tr></table>',
  );
  await expect(page.locator('.rounded-lg table').getByText('Founder')).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved')).toBeVisible();

  // 4. Receive mail, read it, reply.
  expect(await deliver(mail({ from: 'Maya Chen <maya@acme.test>', to: 'admin@example.com', subject: 'Q4 planning agenda', body: 'Can we meet Thursday about the budget?', id: 'q4-1@acme.test' }), 'maya@acme.test', 'admin@example.com')).toBe(200);
  expect(await deliver(mail({ from: 'Maya Chen <maya@acme.test>', to: 'bob@example.com', subject: 'For Bob only', body: 'Private note for Bob.', id: 'bob-1@acme.test' }), 'maya@acme.test', 'bob@example.com')).toBe(200);
  expect(await deliver(mail({ from: 'x@acme.test', to: 'nobody@example.com', subject: 'x', body: 'x', id: 'x@acme.test' }), 'x@acme.test', 'nobody@example.com')).toBe(400);

  await page.goto('/mail/all/inbox');
  await expect(page).toHaveTitle(/NECROS Inbox · NECROS Mail/);
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'NECROS Inbox' })).toBeVisible();
  await expect(page.getByText('Q4 planning agenda')).toBeVisible();
  await expect(page.getByText('For Bob only')).toHaveCount(0);
  // A keyboard user must be able to open a message, and a failed read must be retryable.
  const failedReaderRoute = /\/api\/threads\/\d+(?:\?|$)/;
  await page.route(failedReaderRoute, async (route) => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'unavailable', message: 'Temporary failure' } }) });
  });
  const openConversation = page.getByRole('button', { name: 'Open conversation: Q4 planning agenda' });
  await openConversation.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert').getByText("Couldn't load conversation")).toBeVisible({ timeout: 30_000 });
  await page.unroute(failedReaderRoute);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('article').getByText('Can we meet Thursday about the budget?')).toBeVisible();
  await page.getByRole('button', { name: 'Reply', exact: true }).last().click();
  await expect(page.locator('.ProseMirror table img[alt="Acme logo"]')).toBeVisible();
  await page.locator('.ProseMirror p').first().click();
  await page.keyboard.type('Thursday works. See you then!');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  // Undo window, then it goes out.
  await expect(page.getByText('Message sent')).toBeVisible({ timeout: 20_000 });
  const state = await (await fetch(`${MOCK}/__mock/state`)).json();
  const sent = state.resend.emails.at(-1);
  expect(sent.to).toEqual(['Maya Chen <maya@acme.test>']);
  expect(sent.subject).toBe('Re: Q4 planning agenda');
  expect(sent.headers['In-Reply-To']).toBe('<q4-1@acme.test>');
  expect(sent.headers.References.split(' ').at(-1)).toBe(sent.headers['Message-ID']);
  expect(sent.html).toMatch(/<table[^>]*>.*<td bgcolor="#f5f7fa"[^>]*><img src="https:\/\/cdn\.example\.com\/logo\.png"/s);
  expect(sent.html).toMatch(/<span style="color: rgb\(102, 119, 136\); font-style: italic;?">Founder<\/span>/);
  expect(sent.html.indexOf('Thursday works')).toBeLessThan(sent.html.indexOf('data-oi-signature'));
  expect(sent.html.indexOf('data-oi-signature')).toBeLessThan(sent.html.indexOf('<blockquote'));

  // 5. The recipient replies (SES replaced our Message-ID; References still carries it).
  await deliver(
    mail({
      from: 'Maya Chen <maya@acme.test>',
      to: 'admin@example.com',
      subject: 'Re: Q4 planning agenda',
      body: 'Great, booked the room.',
      id: 'q4-2@acme.test',
      extra: `In-Reply-To: <ses-xyz@amazonses.com>\nReferences: <q4-1@acme.test> ${sent.headers['Message-ID']}`,
    }),
    'maya@acme.test',
    'admin@example.com',
  );
  await page.goto('/mail/all/inbox');
  await expect(page.locator('li').filter({ hasText: 'Q4 planning agenda' })).toHaveCount(1);
  await expect(page.locator('li').filter({ hasText: 'Q4 planning agenda' }).getByText('3', { exact: true })).toBeVisible();

  // 6. Search.
  await page.getByPlaceholder('Search mail').fill('booked');
  await page.getByPlaceholder('Search mail').press('Enter');
  await expect(page.getByText('Results for “booked”')).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Q4 planning agenda' })).toHaveCount(1);
  await page.goto('/mail/all/inbox');
  // Network errors must not be shown as an empty archive, and retry must recover.
  await page.route('**/api/threads?*', async (route) => {
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'unavailable', message: 'Temporary failure' } }) });
  });
  await page.goto('/mail/all/archive');
  await expect(page.getByRole('alert').getByText("Couldn't load conversations")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Nothing here')).toHaveCount(0);
  await page.unroute('**/api/threads?*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Nothing here')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  // The actual request is held open, showing the official Thinking Orb while refreshing.
  await page.route('**/api/threads?*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    await route.continue();
  });
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.locator('[data-thinking-orb]')).toBeVisible();
  await expect(page.getByText('Conversations up to date')).toBeVisible({ timeout: 20_000 });
  // Wait for every active delayed route handler before removing interception.
  // Removing it immediately can auto-continue a request that the handler still owns.
  await page.unrouteAll({ behavior: 'wait' });
  await notifications.click();
  await expect(page.getByRole('region', { name: 'Recent notifications' })).toContainText('Conversations up to date');
  await notifications.click();
  await page.goto('/mail/all/inbox');
  await page.goto('/admin');
  await expect(page.getByText('Mail traffic')).toBeVisible();

  // 7. Bob signs in: forced password change, only his inbox, no admin.
  const bobCtx = await browser.newContext();
  const bob = await bobCtx.newPage();
  await bob.goto(`${APP}/login`);
  await bob.locator('#email').fill('bob@example.com');
  await bob.locator('#password').fill(bobPassword);
  await bob.getByRole('button', { name: 'Sign in' }).click();
  await expect(bob.getByText('Choose your password')).toBeVisible();
  await bob.locator('#next').fill('bobs own new password');
  await bob.locator('#confirm').fill('bobs own new password');
  await bob.getByRole('button', { name: 'Save password' }).click();
  await expect(bob.getByText('For Bob only')).toBeVisible();
  await expect(bob.getByText('Q4 planning agenda')).toHaveCount(0);
  await expect(bob.getByRole('link', { name: 'NECROS Admin' })).toHaveCount(0);
  const adminApi = await bob.request.get(`${APP}/api/admin/overview`);
  expect(adminApi.status()).toBe(403);
  await bobCtx.close();
});


test('mobile Inbox navigation stays accessible on a phone viewport', async ({ browser }) => {
  // Keep this separate from the full mail-flow test so a mobile regression has its own timeout
  // and Playwright trace. The preceding test initializes the mock installation.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await ctx.newPage();
    await page.goto(`${APP}/login`);
    await expect(page.getByRole('heading', { name: 'Sign in to NECROS Inbox' })).toBeVisible();
    await page.locator('#email').fill('admin@example.com');
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click({ timeout: 10_000 });
    await page.goto(`${APP}/mail/all/inbox`);
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    await page.getByRole('button', { name: 'Refresh' }).click();
    const toast = page.locator('[data-necros-toast]').first();
    await expect(toast).toBeVisible();
    const toastBounds = await toast.boundingBox();
    expect(toastBounds).not.toBeNull();
    expect(toastBounds!.width).toBeLessThan(366); // Fits content; never the full 390px viewport.
    expect(toastBounds!.x).toBeGreaterThanOrEqual(12);
    expect(toastBounds!.y).toBeGreaterThan(600); // Anchored near bottom, not at the top.
    expect(toastBounds!.y + toastBounds!.height).toBeLessThanOrEqual(844);
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(menu).toBeVisible({ timeout: 15_000 });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click({ timeout: 10_000 });
    const drawer = page.locator('#mail-folders-drawer');
    const close = page.getByRole('button', { name: 'Close menu' });
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(drawer.getByRole('link', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveClass(/invisible -translate-x-full/);
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await close.click({ timeout: 10_000 });
    await expect(drawer).toHaveClass(/-translate-x-full/);
    await expect(menu).toBeFocused();
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'NECROS Inbox' })).toBeVisible();
  } finally {
    await ctx.close();
  }
});
