import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-11: Upload RAB Final & Pelaksanaan Kerjasama (Full Approval Flow)
 * QA: Garis Rayya Rabbani
 */
test('HP-11: Upload RAB Final & Pelaksanaan Kerjasama', async ({ page }) => {
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "PROJECT PLIZT"; 
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');

  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  
  // 1. LOGIN SEBAGAI RESEARCHER (Nanindya)
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_NANINDYA_USER || 'nanindya.123240019@student.itera.ac.id');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_NANINDYA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo');
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  
  // Search & Select Record
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  const recordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record", recordRow, () => recordRow.click());

  await page.getByRole('tab', { name: 'Keuangan (RAB + LPJ)' }).click();

  await docAction(page, "Tambah RAB Final", page.getByRole('button', { name: 'Tambahkan baris' }), () => 
    page.getByRole('button', { name: 'Tambahkan baris' }).click()
  );

  // Isi Dialog RAB
  await page.getByRole('textbox', { name: 'Name...' }).fill(`RAB Final - ${targetProjectName}`);
  await page.getByRole('textbox', { name: 'Tipe RAB' }).click();
  await page.getByRole('menuitem', { name: 'Final' }).click();
  
  // Upload File RAB
  const fileInput = page.locator('div[name="x_studio_file_rab"] input[type="file"]');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);

  await page.getByRole('textbox', { name: 'Nilai RAB' }).fill('150000000');
  await page.getByRole('combobox', { name: 'IDR IDR' }).click();
  await page.getByRole('option', { name: 'IDR' }).click();
  
  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  await page.waitForTimeout(2000);

  // Submit RAB Final
  await docAction(page, "Submit RAB Final", page.getByRole('button', { name: 'Submit RAB Final' }), () => 
    page.getByRole('button', { name: 'Submit RAB Final' }).click()
  );

  // --- SUBMIT REQUEST DI MODUL PERSETUJUAN ---
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  
  const submitLink = page.getByRole('link', { name: new RegExp(`Persetujuan RAB: .*${targetProjectName}`, 'i') });
  await docAction(page, "Select RAB Request", submitLink, () => submitLink.click());
  await page.getByRole('button', { name: 'Menyerahkan' }).click();

  // 2. APPROVAL OLEH TENDIK (Daniel)
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  const otherUserBtn = page.getByRole('button', { name: 'Gunakan user lain' });
  if (await otherUserBtn.isVisible()) await otherUserBtn.click();

  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_PASSWORD || 'tendik1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  const approvalRow1 = page.getByRole('cell', { name: /Persetujuan RAB:/ }).first();
  await approvalRow1.click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();

  // 3. APPROVAL OLEH KEPALA LPPM (Garis)
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();

  await page.getByRole('button', { name: 'Gunakan user lain' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  const approvalRow2 = page.getByRole('cell', { name: /Persetujuan RAB:/ }).first();
  await approvalRow2.click();
  await docAction(page, "Final Approve RAB", page.getByRole('button', { name: 'Setujui', exact: true }), () => 
    page.getByRole('button', { name: 'Setujui', exact: true }).click()
  );

  console.log(`✅ HP-11: RAB Final Full Flow completed for ${targetProjectName}.`);
});