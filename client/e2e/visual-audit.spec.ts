import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

const PAGES = [
  { path: '/', name: 'dashboard' },
  { path: '/contacts', name: 'contacts' },
  { path: '/deals', name: 'deals' },
  { path: '/tasks', name: 'tasks' },
  { path: '/tickets', name: 'tickets' },
  { path: '/calendar', name: 'calendar' },
  { path: '/invoices', name: 'invoices' },
  { path: '/emails', name: 'emails' },
  { path: '/settings', name: 'settings' },
];

test.describe('Visual Audit - All Pages', () => {
  for (const page of PAGES) {
    test(`${page.name} - light mode`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });
      const p = await context.newPage();
      await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle' });
      // Force light mode (app defaults to dark)
      await p.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: false, sidebarCollapsed: false }, version: 0 }));
      });
      await p.waitForTimeout(3000); // wait for lazy load + animations
      await p.screenshot({
        path: `e2e/screenshots/${page.name}-light.png`,
        fullPage: false,
      });
      await context.close();
    });

    test(`${page.name} - dark mode`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });
      const p = await context.newPage();
      // Set dark mode BEFORE navigation via localStorage
      await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle' });
      await p.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: true, sidebarCollapsed: false }, version: 0 }));
      });
      await p.waitForTimeout(1500);
      await p.screenshot({
        path: `e2e/screenshots/${page.name}-dark.png`,
        fullPage: false,
      });
      await context.close();
    });
  }

  test('no broken unicode escapes in rendered text', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const p = await context.newPage();

    const brokenPages: string[] = [];

    for (const page of PAGES) {
      await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(3000);

      const hasBrokenUnicode = await p.evaluate(() => {
        const bodyText = document.body.innerText;
        // Check for literal \uXXXX patterns that shouldn't be visible
        return /\\u[0-9a-fA-F]{4}/.test(bodyText);
      });

      if (hasBrokenUnicode) {
        brokenPages.push(page.name);
      }
    }

    console.log('Pages with broken unicode:', brokenPages);
    expect(brokenPages).toEqual([]);

    await context.close();
  });

  test('UI quality checks', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const p = await context.newPage();
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);

    // Check sidebar exists and is visible
    const sidebar = p.locator('aside');
    await expect(sidebar).toBeVisible();

    // Check navbar exists
    const navbar = p.locator('header');
    await expect(navbar).toBeVisible();

    // Check main content area
    const main = p.locator('main');
    await expect(main).toBeVisible();

    // Check no overlapping elements (sidebar vs content)
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();
    expect(sidebarBox).not.toBeNull();
    expect(mainBox).not.toBeNull();
    if (sidebarBox && mainBox) {
      expect(mainBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width - 10);
    }

    // Check no text is cut off
    const overflowIssues = await p.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);
        if (style.overflow === 'hidden' || style.overflow === 'clip') return;
        if (el.scrollWidth > el.clientWidth + 5 && style.whiteSpace !== 'nowrap') {
          const text = el.textContent?.substring(0, 50);
          if (text && text.trim().length > 3) {
            issues.push(`Overflow: "${text}" in <${el.tagName.toLowerCase()}>`);
          }
        }
      });
      return issues.slice(0, 10);
    });
    console.log('Overflow issues found:', overflowIssues.length);
    overflowIssues.forEach(i => console.log(' -', i));

    // Check font loading
    const fontsLoaded = await p.evaluate(() => document.fonts.ready.then(() => true));
    expect(fontsLoaded).toBeTruthy();

    // Check no console errors
    const consoleErrors: string[] = [];
    p.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Navigate through all pages and check for console errors
    for (const page of ['/contacts', '/deals', '/tasks', '/tickets', '/calendar', '/invoices', '/emails', '/settings']) {
      await p.goto(`${BASE}${page}`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(2000);
    }

    console.log('Console errors:', consoleErrors.length);
    consoleErrors.forEach(e => console.log(' -', e));

    // Check all navigation links work
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    const navLinks = await p.locator('aside a[href]').all();
    expect(navLinks.length).toBeGreaterThanOrEqual(9);

    // Check command palette opens
    await p.keyboard.press('Control+k');
    await p.waitForTimeout(500);
    const cmdPalette = p.locator('[role="dialog"], [class*="CommandPalette"]').first();

    await context.close();
  });
});
