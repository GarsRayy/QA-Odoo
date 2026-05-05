import { test, expect } from '@playwright/test';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-14: Penyelesaian Kerjasama
 * QA: Garis Rayya Rabbani
 */
test('HP-14: Penyelesaian Kerjasama', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  
  await page.getByRole('button', { name: 'Selesai' }).click();
  await expect(page.getByText('Selesai')).not.toBeVisible();
  
  console.log('✅ HP-14: Partnership completed.');
});
