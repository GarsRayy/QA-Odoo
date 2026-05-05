import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-08: Penyusunan Draft Kontrak & TTD PKS
 * QA: Garis Rayya Rabbani
 */
test('HP-08: Penyusunan Draft Kontrak & TTD PKS', async ({ page }) => {
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "ABC DEF"; 
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');

  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  
  // 1. LOGIN SEBAGAI TENDIK
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_PASSWORD || 'tendik1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo');
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  
  // Search & Select Record
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  const recordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record", recordRow, () => recordRow.click());

  await page.getByRole('tab', { name: 'Dokumen' }).click();
  
  // --- A. UPLOAD & APPROVAL DRAFT KONTRAK ---
  const fileInput = page.locator('input[type="file"].o_input_file').first();
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  await docAction(page, "Upload Draft Kontrak", page.getByRole('button', { name: 'Upload Draft Kontrak' }), () => 
    page.getByRole('button', { name: 'Upload Draft Kontrak' }).click()
  );

  await docAction(page, "Ajukan Approval Draft", page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }), () => 
    page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }).click()
  );

  // Submit Request di modul Persetujuan
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  
  // Pilih request yang baru saja diajukan (dinamis menggunakan regex yang lebih fleksibel)
  const submitLink = page.getByRole('link', { name: new RegExp(`Persetujuan Draft (PKS/)?Kontrak - .*${targetProjectName}`, 'i') });
  await docAction(page, "Select Draft Request", submitLink, () => submitLink.click());
  await page.getByRole('button', { name: 'Menyerahkan' }).click();

  // 2. APPROVAL OLEH KEPALA LPPM
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  
  // Mencari baris approval dengan regex yang fleksibel
  const approvalRow = page.getByRole('cell', { name: new RegExp(`Persetujuan Draft (PKS/)?Kontrak`, 'i') }).first();
  await approvalRow.click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();

  console.log(`✅ HP-08: Draft & PKS flow completed for ${targetProjectName}.`);
});