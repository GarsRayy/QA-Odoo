import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-10: Kontrak Internal (SPK)
 * QA: Garis Rayya Rabbani
 */
test('HP-10: Kontrak Internal (SPK)', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('tab', { name: 'Dokumen' }).click();
  await page.waitForTimeout(2000);
  
  const uploadContainer = page.locator('.o_field_widget, .o_select_file_button').filter({ hasText: /TTD Kontrak Internal/i }).first();
  const fileInput = uploadContainer.locator('input[type="file"].o_input_file');
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(pdfPath);
    await page.waitForTimeout(3000);
  } else {
    await page.locator('input[type="file"].o_input_file').first().setInputFiles(pdfPath);
  }
  
  await page.getByRole('button', { name: 'TTD Kontrak Internal' }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText('TTD Kontrak Internal')).not.toBeVisible();
  
  console.log('✅ HP-10: Internal contract (SPK) signed.');
});