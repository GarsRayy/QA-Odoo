import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-09: Upload SK Rektor
 * QA: Garis Rayya Rabbani
 */
test('HP-09: Upload SK Rektor', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  
  await page.getByRole('tab', { name: 'Dokumen' }).click();
  
  // Upload SK Rektor
  const fileInput = page.locator('input[type="file"].o_input_file').first();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Upload SK Rektor' }).click();
  await expect(page.getByText('Upload SK Rektor')).not.toBeVisible();
  
  console.log('✅ HP-09: SK Rektor uploaded.');
});