import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-09 & HP-10: Kontrak Tertandatangani, SK Rektor, & Kontrak Internal Flow
 * QA: Garis Rayya Rabbani
 */
test('HP-09-10: Kontrak & Internal Contract Approval Flow', async ({ page }) => {
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "PROJECT PLIZT"; 
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
  await page.waitForTimeout(1000);
  const recordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record", recordRow, () => recordRow.click());

  await page.getByRole('tab', { name: 'Dokumen' }).click();

  // --- A. UPLOAD KONTRAK & SK REKTOR ---
  // Upload Kontrak Tertandatangani
  const kontrakInput = page.locator('div[name="x_studio_kontrakpks_tertandatangani_1"] input[type="file"]');
  await kontrakInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000); // Wait for Odoo to process the file
  await docAction(page, "Upload Kontrak Tertandatangani", page.getByRole('button', { name: 'Upload Kontrak Tertandatangani' }), () => 
    page.getByRole('button', { name: 'Upload Kontrak Tertandatangani' }).click()
  );

  // Upload SK Rektor
  const skRektorInput = page.locator('div[name="x_studio_sk_rektor_1"] input[type="file"]');
  await skRektorInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000); // Wait for Odoo to process the file
  await docAction(page, "Upload SK Rektor", page.getByRole('button', { name: 'Upload SK Rektor' }), () => 
    page.getByRole('button', { name: 'Upload SK Rektor' }).click()
  );

  // --- B. KONTRAK INTERNAL ---
  await docAction(page, "Membuat Kontrak Internal", page.getByRole('button', { name: 'Membuat Kontrak Internal' }), () => 
    page.getByRole('button', { name: 'Membuat Kontrak Internal' }).click()
  );

  await docAction(page, "Ajukan Approval Kontrak Internal", page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }), () => 
    page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }).click()
  );

  // Submit di modul Persetujuan Saya
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  
  const submitLink = page.getByRole('link', { name: new RegExp(`Persetujuan Kontrak Internal - .*${targetProjectName}`, 'i') });
  await docAction(page, "Select Internal Contract Request", submitLink, () => submitLink.click());
  await page.getByRole('button', { name: 'Menyerahkan' }).click();

  // 2. APPROVAL OLEH KEPALA LPPM
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  // Login Kepala LPPM
  const otherUserBtn = page.getByRole('button', { name: 'Gunakan user lain' });
  if (await otherUserBtn.isVisible()) await otherUserBtn.click();
  
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  const approvalRow = page.getByRole('cell', { name: /Persetujuan Kontrak Internal/ }).first();
  await approvalRow.click();
  await docAction(page, "Final Approve Kontrak Internal", page.getByRole('button', { name: 'Setujui', exact: true }), () => 
    page.getByRole('button', { name: 'Setujui', exact: true }).click()
  );

  await page.getByRole('link', { name: 'Menu Home' }).click();
  console.log(`✅ HP-09-10: Internal Contract Flow completed for ${targetProjectName}.`);
});
