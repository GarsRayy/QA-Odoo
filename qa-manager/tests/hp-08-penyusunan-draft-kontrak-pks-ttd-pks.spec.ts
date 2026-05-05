import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-08: Kontrak PKS & Upload TTD
 * QA: Garis Rayya Rabbani
 */
test('HP-08: Kontrak PKS & Upload TTD', async ({ page }) => {
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
  
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  const fileInput = page.locator('input[type="file"].o_input_file').first();

  // --- UPLOAD 1: Draft Kontrak ---
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Susun Draft Kontrak' }).click();
  await page.waitForTimeout(3000);
  
  // --- UPLOAD 2: PKS TTD ---
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Upload PKS TTD' }).click();
  await page.waitForTimeout(4000);
  
  await expect(page.getByText('Upload PKS TTD')).not.toBeVisible();
  console.log('✅ HP-08: Contract draft and PKS uploaded.');
});