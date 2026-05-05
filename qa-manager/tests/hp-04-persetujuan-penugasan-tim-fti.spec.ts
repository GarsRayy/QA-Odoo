import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-04: Penugasan Team
 * QA: Garis Rayya Rabbani
 */
test('HP-04: Penugasan Team', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_FTI_USER || 'danielcalvin811@gmail.com');
  await page.fill('#password', process.env.ODOO_FTI_PASS || 'fti1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/approvals');
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  // Select first available record (latest)
  await page.getByRole('cell', { name: /#/ }).first().click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  
  await page.getByRole('button', { name: 'Tambahkan baris' }).click();
  await page.getByRole('textbox', { name: 'Name...' }).fill(data.teamName);
  await page.getByRole('combobox', { name: 'Ketua Tim' }).click();
  await page.getByRole('option', { name: 'Cari lebih...' }).click();
  await page.getByRole('cell', { name: 'Nanindya', exact: true }).click();
  await page.getByRole('textbox', { name: 'Program Studi' }).fill(data.prodi);
  
  // Upload surat_dummy.pdf secara otomatis
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await page.getByRole('dialog').locator('input[type="file"]').setInputFiles(pdfPath);
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  
  await page.getByRole('button', { name: 'Tugaskan Ketua Tim' }).click();
  await expect(page.getByText('Tugaskan Ketua Tim')).not.toBeVisible();
  
  console.log(`✅ HP-04: Team ${data.teamName} assigned.`);
});