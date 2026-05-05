import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-07: Generate & Kirim Surat Jawaban Kesediaan
 * QA: Garis Rayya Rabbani
 */
test('HP-07: Generate & Kirim Surat Jawaban Kesediaan', async ({ page }) => {
  // Mengambil nama project dari shared state
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "ABC DEF"; 

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

  // Upload Dokumen Kesediaan menggunakan lokator spesifik
  await page.getByRole('tab', { name: 'Dokumen' }).click();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await page.locator('div[name="x_studio_surat_kesediaan_1"] input[type="file"]').setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  await docAction(page, "Upload Kesediaan", page.getByRole('button', { name: 'Upload Kesediaan' }), () => 
    page.getByRole('button', { name: 'Upload Kesediaan' }).click()
  );

  await docAction(page, "Ajukan Approval Kepala LPPM", page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }), () => 
    page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }).click()
  );

  // Navigasi ke Persetujuan Saya untuk "Menyerahkan" (Submit)
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  
  // Pilih request yang baru saja diajukan (dinamis berdasarkan nama project)
  const submitLink = page.getByRole('link', { name: new RegExp(`Persetujuan Surat Kesediaan - ${targetProjectName}`) });
  await docAction(page, "Select Request to Submit", submitLink, () => submitLink.click());
  
  await docAction(page, "Submit Request (Menyerahkan)", page.getByRole('button', { name: 'Menyerahkan' }), () => 
    page.getByRole('button', { name: 'Menyerahkan' }).click()
  );

  // 2. LOGOUT & LOGIN SEBAGAI KEPALA LPPM
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  // Approval di Modul Persetujuan
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  // Cari persetujuan berdasarkan nama project
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  const approvalRow = page.getByRole('cell', { name: /Persetujuan Surat Kesediaan/ }).first();
  await docAction(page, "Select Approval Request", approvalRow, () => approvalRow.click());
  
  await docAction(page, "Approve by Kepala LPPM", page.getByRole('button', { name: 'Setujui', exact: true }), () => 
    page.getByRole('button', { name: 'Setujui', exact: true }).click()
  );

  // 3. LOGOUT & LOGIN KEMBALI SEBAGAI TENDIK UNTUK KIRIM SURAT
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  // Klik Gunakan user lain jika muncul pilihan user
  const otherUserBtn = page.getByRole('button', { name: 'Gunakan user lain' });
  if (await otherUserBtn.isVisible()) {
    await otherUserBtn.click();
  }

  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_PASSWORD || 'tendik1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();

  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  await recordRow.click();

  await docAction(page, "Kirim Surat Kesediaan Final", page.getByRole('button', { name: 'Kirim Surat Kesediaan' }), () => 
    page.getByRole('button', { name: 'Kirim Surat Kesediaan' }).click()
  );

  console.log(`✅ HP-07: Full flow completed for ${targetProjectName}.`);
});
