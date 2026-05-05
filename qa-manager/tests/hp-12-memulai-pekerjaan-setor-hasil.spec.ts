import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-12: Memulai Pekerjaan & Setor Hasil
 * QA: Garis Rayya Rabbani
 */
test('HP-12: Memulai Pekerjaan & Setor Hasil', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_NANINDYA_USER || 'nanindya.123240019@student.itera.ac.id');
  await page.fill('#password', process.env.ODOO_NANINDYA_PASS || 'testing1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  
  await page.getByRole('button', { name: 'Mulai Pekerjaan' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('tab', { name: 'Dokumen' }).click();
  
  // Upload Laporan Akhir
  const fileInput = page.locator('input[type="file"].o_input_file').first();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Setor Hasil' }).click();
  await expect(page.getByText('Setor Hasil')).not.toBeVisible();
  
  console.log('✅ HP-12: Work started and results submitted.');
});