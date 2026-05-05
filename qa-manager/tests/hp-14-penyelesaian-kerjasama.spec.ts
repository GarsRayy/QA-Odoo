import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-14: Penyelesaian Kerjasama (Pencairan Dana & Selesai)
 * QA: Garis Rayya Rabbani
 */
test('HP-14: Penyelesaian Kerjasama', async ({ page }) => {
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "PROJECT PLIZT"; 
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');

  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  
  // 1. LOGIN SEBAGAI TENDIK (Daniel)
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_PASSWORD || 'tendik1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo');
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  
  // Search & Select Record
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  const recordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record", recordRow, () => recordRow.click());

  // --- A. TAB PENCAIRAN DANA ---
  await page.getByRole('tab', { name: 'Pencairan Dana' }).click();
  
  // 1. Tambahkan baris baru
  await docAction(page, "Tambah Baris Pencairan", page.getByRole('button', { name: 'Tambahkan baris' }), () => 
    page.getByRole('button', { name: 'Tambahkan baris' }).click()
  );

  // 2. Isi Nama di Dialog
  await page.getByRole('textbox', { name: 'Name...' }).fill(`Pencairan - ${targetProjectName}`);
  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  await page.waitForTimeout(2000);

  // 3. Upload File Bukti Transfer
  const fileInput = page.locator('div[name="x_studio_bukti_transfer_mitra"] input[type="file"]');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);

  // 4. Klik Selesai
  await docAction(page, "Klik Selesai", page.getByRole('button', { name: 'Selesai' }), () => 
    page.getByRole('button', { name: 'Selesai' }).click()
  );

  await page.waitForTimeout(3000);
  await expect(page.getByRole('button', { name: 'Selesai' })).not.toBeVisible();
  
  console.log(`✅ HP-14: Partnership completed for ${targetProjectName}.`);
});
