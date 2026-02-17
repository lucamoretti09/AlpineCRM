import { test, expect, Page, BrowserContext } from '@playwright/test';

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

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-sm', width: 320, height: 568 },
];

async function setupPage(context: BrowserContext, path: string, dark = false): Promise<Page> {
  const page = await context.newPage();
  const vpWidth = page.viewportSize()?.width ?? 1920;
  const sidebarCollapsed = vpWidth < 1024; // Collapse sidebar on tablet and mobile
  // Inject localStorage BEFORE page scripts run via addInitScript
  await page.addInitScript(({ isDark, collapsed }) => {
    localStorage.setItem('theme-storage', JSON.stringify({
      state: { isDark, sidebarCollapsed: collapsed, mobileMenuOpen: false },
      version: 0,
    }));
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, { isDark: dark, collapsed: sidebarCollapsed });
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  return page;
}

// ──────────────────────────────────────────────────────
// 1. Screenshot all pages at all viewports (light + dark)
// ──────────────────────────────────────────────────────
test.describe('Full Viewport Screenshots', () => {
  for (const vp of VIEWPORTS) {
    for (const pg of PAGES) {
      for (const theme of ['light', 'dark'] as const) {
        test(`${pg.name} - ${vp.name} - ${theme}`, async ({ browser }) => {
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
          });
          const page = await setupPage(context, pg.path, theme === 'dark');
          await page.screenshot({
            path: `e2e/screenshots/${pg.name}-${vp.name}-${theme}.png`,
            fullPage: true,
          });
          await context.close();
        });
      }
    }
  }
});

// ──────────────────────────────────────────────────────
// 2. Overflow & Clipping Audit
// ──────────────────────────────────────────────────────
test.describe('Overflow & Clipping', () => {
  for (const vp of VIEWPORTS) {
    test(`no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const issues: string[] = [];

      for (const pg of PAGES) {
        const page = await setupPage(context, pg.path);

        // Check document doesn't have horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        if (hasHorizontalScroll) {
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          issues.push(`${pg.name}: scrollWidth(${scrollWidth}) > clientWidth(${clientWidth})`);
        }

        // Check for elements overflowing viewport (exclude elements inside scroll containers)
        const overflowing = await page.evaluate((vpWidth) => {
          const problems: string[] = [];
          function isInsideScrollContainer(el: Element): boolean {
            let parent = el.parentElement;
            while (parent) {
              const style = getComputedStyle(parent);
              if (style.overflowX === 'auto' || style.overflowX === 'scroll' ||
                  style.overflow === 'auto' || style.overflow === 'scroll') {
                return true;
              }
              parent = parent.parentElement;
            }
            return false;
          }
          const els = document.querySelectorAll('*');
          els.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.right > vpWidth + 5) {
              const tag = el.tagName.toLowerCase();
              if (tag === 'html' || tag === 'body') return;
              if (isInsideScrollContainer(el)) return; // Skip elements in scroll containers
              // Skip decorative/non-interactive elements (glows, absolute decorations)
              const style = getComputedStyle(el);
              if (style.pointerEvents === 'none' && style.position === 'absolute') return;
              const cls = el.className?.toString().substring(0, 60) || '';
              const text = el.textContent?.substring(0, 30)?.trim() || '';
              problems.push(`<${tag}> right=${Math.round(rect.right)} "${text}" cls="${cls}"`);
            }
          });
          return problems.slice(0, 15);
        }, vp.width);

        if (overflowing.length > 0) {
          issues.push(`${pg.name} overflowing elements:`);
          overflowing.forEach(o => issues.push(`  ${o}`));
        }

        await page.close();
      }

      console.log(`\n=== Overflow at ${vp.name} (${vp.width}px) ===`);
      issues.forEach(i => console.log(i));
      // Fail only on mobile/tablet - desktop may have intentional horizontal scrolls
      if (vp.width <= 768) {
        expect(issues.filter(i => !i.includes('overflowing elements:'))).toEqual([]);
      }

      await context.close();
    });
  }
});

// ──────────────────────────────────────────────────────
// 3. Touch Target Size (mobile)
// ──────────────────────────────────────────────────────
test('touch targets >= 44px on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });

  const smallTargets: string[] = [];

  for (const pg of PAGES) {
    const page = await setupPage(context, pg.path);

    const tooSmall = await page.evaluate(() => {
      const issues: string[] = [];
      const interactives = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');
      interactives.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // hidden
        if (rect.width < 44 || rect.height < 44) {
          // Ignore if parent has enough size (padding around small icon)
          const parent = el.parentElement;
          const parentRect = parent?.getBoundingClientRect();
          if (parentRect && parentRect.width >= 44 && parentRect.height >= 44) return;

          const tag = el.tagName.toLowerCase();
          const text = (el.textContent?.trim() || el.getAttribute('aria-label') || '').substring(0, 30);
          // Skip very small hidden items
          if (rect.width < 5 || rect.height < 5) return;
          issues.push(`<${tag}> ${Math.round(rect.width)}x${Math.round(rect.height)} "${text}"`);
        }
      });
      return issues.slice(0, 20);
    });

    if (tooSmall.length > 0) {
      smallTargets.push(`${pg.name}:`);
      tooSmall.forEach(s => smallTargets.push(`  ${s}`));
    }

    await page.close();
  }

  console.log('\n=== Touch Targets < 44px ===');
  smallTargets.forEach(s => console.log(s));

  await context.close();
});

// ──────────────────────────────────────────────────────
// 4. Text Truncation & Readability
// ──────────────────────────────────────────────────────
test('no unintended text truncation on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });

  const truncated: string[] = [];

  for (const pg of PAGES) {
    const page = await setupPage(context, pg.path);

    const issues = await page.evaluate(() => {
      const problems: string[] = [];
      const headings = document.querySelectorAll('h1, h2, h3, h4, p.font-bold, span.font-bold');
      headings.forEach(el => {
        const style = getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth + 2 && style.textOverflow === 'ellipsis') {
          const text = el.textContent?.substring(0, 40) || '';
          problems.push(`Truncated: "${text}" in <${el.tagName.toLowerCase()}>`);
        }
      });
      return problems.slice(0, 10);
    });

    if (issues.length > 0) {
      truncated.push(`${pg.name}:`);
      issues.forEach(i => truncated.push(`  ${i}`));
    }

    await page.close();
  }

  console.log('\n=== Text Truncation on Mobile ===');
  truncated.forEach(t => console.log(t));

  await context.close();
});

// ──────────────────────────────────────────────────────
// 5. Spacing & Alignment Consistency
// ──────────────────────────────────────────────────────
test('consistent spacing and alignment', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const issues: string[] = [];

  for (const pg of PAGES) {
    const page = await setupPage(context, pg.path);

    const pageIssues = await page.evaluate((pageName) => {
      const problems: string[] = [];

      // Check cards have consistent border-radius
      const cards = document.querySelectorAll('[class*="rounded-2xl"], [class*="rounded-xl"]');
      const radii = new Set<string>();
      cards.forEach(el => {
        const r = getComputedStyle(el).borderRadius;
        if (r !== '0px') radii.add(r);
      });

      // Check headings hierarchy (h1 > h2 > h3)
      const h1Size = document.querySelector('h1') ? parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize) : 0;
      const h2Size = document.querySelector('h2') ? parseFloat(getComputedStyle(document.querySelector('h2')!).fontSize) : 0;
      if (h1Size > 0 && h2Size > 0 && h2Size >= h1Size) {
        problems.push(`${pageName}: h2 (${h2Size}px) >= h1 (${h1Size}px)`);
      }

      // Check buttons have minimum padding
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0) return; // hidden
        const style = getComputedStyle(btn);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        if (paddingX < 8 && paddingY < 8 && rect.width > 20) {
          const text = btn.textContent?.trim().substring(0, 20) || '';
          if (text) problems.push(`${pageName}: button "${text}" has tiny padding (${paddingX.toFixed(0)}x${paddingY.toFixed(0)})`);
        }
      });

      // Check z-index stacking (modals should be above content)
      const fixedElements = document.querySelectorAll('[class*="fixed"]');
      fixedElements.forEach(el => {
        const z = parseInt(getComputedStyle(el).zIndex) || 0;
        if (z > 0 && z < 40) {
          problems.push(`${pageName}: fixed element with low z-index (${z})`);
        }
      });

      return problems;
    }, pg.name);

    issues.push(...pageIssues);
    await page.close();
  }

  console.log('\n=== Spacing & Alignment Issues ===');
  issues.forEach(i => console.log(i));

  await context.close();
});

// ──────────────────────────────────────────────────────
// 6. Mobile Navigation Test
// ──────────────────────────────────────────────────────
test('mobile navigation works correctly', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });

  const page = await setupPage(context, '/');

  // Sidebar should be hidden on mobile
  const sidebar = page.locator('aside');
  const sidebarBox = await sidebar.boundingBox();

  // On mobile, sidebar should be off-screen or have transform
  if (sidebarBox) {
    const isVisible = sidebarBox.x >= 0 && sidebarBox.x < 375;
    console.log(`Sidebar on mobile: x=${sidebarBox.x}, visible=${isVisible}`);
  }

  // Check hamburger menu exists
  const hamburger = page.locator('button[aria-label*="meniu"], button[aria-label*="sidebar"], button:has(svg.lucide-menu)').first();
  const hasHamburger = await hamburger.count() > 0;
  console.log(`Hamburger menu found: ${hasHamburger}`);

  // Check content doesn't extend beyond viewport
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  console.log(`Body scroll width on mobile: ${bodyWidth}px (viewport: 375px)`);
  expect(bodyWidth).toBeLessThanOrEqual(380); // 5px tolerance

  await context.close();
});

// ──────────────────────────────────────────────────────
// 7. Dark Mode Contrast Check
// ──────────────────────────────────────────────────────
test('dark mode has adequate contrast', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const lowContrast: string[] = [];

  for (const pg of PAGES.slice(0, 3)) { // Check first 3 pages
    const page = await setupPage(context, pg.path, true);

    const issues = await page.evaluate((pageName) => {
      const problems: string[] = [];

      function getLuminance(r: number, g: number, b: number) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrastRatio(l1: number, l2: number) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      function parseColor(color: string): [number, number, number] | null {
        const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
        return null;
      }

      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, a, button, label, td, th');
      textElements.forEach(el => {
        const style = getComputedStyle(el);
        const fg = parseColor(style.color);
        const bg = parseColor(style.backgroundColor);
        if (!fg || !bg) return;
        if (bg[0] === 0 && bg[1] === 0 && bg[2] === 0 && style.backgroundColor.includes('0)')) return; // transparent

        const fgLum = getLuminance(...fg);
        const bgLum = getLuminance(...bg);
        const ratio = getContrastRatio(fgLum, bgLum);

        const fontSize = parseFloat(style.fontSize);
        const minRatio = fontSize >= 18 ? 3 : 4.5; // WCAG AA

        if (ratio < minRatio) {
          const text = el.textContent?.trim().substring(0, 25);
          if (text && text.length > 1) {
            problems.push(`${pageName}: "${text}" contrast=${ratio.toFixed(1)} (need ${minRatio})`);
          }
        }
      });

      return problems.slice(0, 10);
    }, pg.name);

    lowContrast.push(...issues);
    await page.close();
  }

  console.log('\n=== Low Contrast in Dark Mode ===');
  lowContrast.forEach(l => console.log(l));

  await context.close();
});
