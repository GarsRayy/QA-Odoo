import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-05: Submission Proposal & RAB
 * QA: Garis Rayya Rabbani
 */
test('HP-05: Submission Proposal & RAB', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_NANINDYA_USER || 'nanindya.123240019@student.itera.ac.id');
  await page.fill('#password', process.env.ODOO_NANINDYA_PASS || 'testing1234');
  await page.click('button.btn-primary');
  
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  await page.getByRole('cell', { name: /#/ }).first().click();
  
  await page.getByRole('tab', { name: 'Keuangan (RAB + LPJ)' }).click();
  await page.getByRole('button', { name: 'Tambahkan baris' }).click();
  await page.getByRole('textbox', { name: 'Name...' }).fill(`(Proposal) & ${data.subject}`);
  
  // Tipe RAB & Nama File
  await page.getByRole('textbox', { name: 'Tipe RAB' }).click();
  await page.getByText('Penawaran', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Nama File' }).fill(`Dokumen ${data.subject}`);
  
  // Optimal Upload Logic
  const fileInput = page.locator('label.o_select_file_button input[type="file"]').first();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(3000);
  
  await page.getByRole('textbox', { name: 'Nilai RAB' }).fill('150000000');
  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  
  await page.getByRole('button', { name: 'Ajukan Proposal dan RAB (FTI)' }).click();
  await expect(page.getByText('Ajukan Proposal dan RAB (FTI)')).not.toBeVisible();

  // Navigation to Approvals
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  await page.getByRole('link', { name: /Akan Diajukan/ }).first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Menyerahkan' }).click();
  
  await expect(page.getByText('Menyerahkan')).not.toBeVisible();
  console.log(`✅ HP-05: Proposal submitted for ${data.subject}`);
});
