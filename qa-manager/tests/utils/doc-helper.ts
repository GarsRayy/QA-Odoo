import { Page, Locator } from '@playwright/test';

/**
 * Helper to enhance visual feedback during Documentation Mode
 */
export async function docAction(page: Page, actionName: string, locator: Locator, action: () => Promise<void>) {
  const isDocMode = process.env.DOC_MODE === 'true';

  if (isDocMode) {
    // 1. Highlight the element with a bright border
    await locator.evaluate((el) => {
      el.style.outline = '5px solid #3b82f6';
      el.style.outlineOffset = '2px';
      el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // 2. Wait a bit so the user/screenshot can see the highlight
    await page.waitForTimeout(1000);
    
    // 3. Perform the action
    await action();
    
    // 4. Take a screenshot for the documentation
    const screenshotName = actionName.replace(/\s+/g, '-').toLowerCase();
    await page.screenshot({ path: `test-results/doc-${screenshotName}.png`, fullPage: false });
    
    // 5. Remove highlight
    await locator.evaluate((el) => {
      el.style.outline = '';
      el.style.backgroundColor = '';
    });
  } else {
    // Normal execution
    await action();
  }
}
