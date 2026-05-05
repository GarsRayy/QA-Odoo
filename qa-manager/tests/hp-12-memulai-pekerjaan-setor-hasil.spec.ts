import { test, expect } from '@playwright/test';
import path from 'path';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-12: Memulai Pekerjaan & Setor Hasil (Full Approval Flow)
 * QA: Garis Rayya Rabbani
 */
test('HP-12: Memulai Pekerjaan & Setor Hasil', async ({ page }) => {
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "PROJECT V6M3I"; 
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

  // Set Tanggal Mulai & Selesai
  await page.getByRole('textbox', { name: 'Tanggal Mulai :' }).click();
  await page.getByText('5', { exact: true }).first().click();
  
  await page.getByRole('textbox', { name: 'Tanggal Selesai :' }).click();
  const nextMonthBtn = page.locator('.o_next');
  if (await nextMonthBtn.isVisible()) await nextMonthBtn.click();
  await page.getByText('26', { exact: true }).first().click();

  await docAction(page, "Mulai Pekerjaan", page.getByRole('button', { name: 'Mulai Pekerjaan' }), () => 
    page.getByRole('button', { name: 'Mulai Pekerjaan' }).click()
  );

  // --- A. UPLOAD LAPORAN HASIL (Tab Dokumen) ---
  await page.getByRole('tab', { name: 'Dokumen' }).click();
  const laporanInput = page.locator('div.o_field_file input[type="file"], div.o_field_binary input[type="file"]').first();
  await laporanInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);

  // --- B. UPLOAD LPJ (Tab Keuangan) ---
  await page.getByRole('tab', { name: 'Keuangan (RAB + LPJ)' }).click();
  await docAction(page, "Tambah LPJ", page.getByRole('button', { name: 'Tambahkan baris' }), () => 
    page.getByRole('button', { name: 'Tambahkan baris' }).click()
  );

  await page.getByRole('textbox', { name: 'Name...' }).fill(`LPJ - ${targetProjectName}`);
  
  // Upload File LPJ di Dialog
  const lpjInput = page.locator('div[name="x_studio_dokumen_lpj"] input[type="file"]');
  await lpjInput.setInputFiles(pdfPath);
  await page.waitForTimeout(1000);

  // Upload Bukti Belanja
  const buktiInput = page.locator('div[name="x_studio_bukti_belanja"] input[type="file"]');
  await buktiInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);

  await page.getByRole('textbox', { name: 'Nominal' }).fill('150000000');
  await page.getByRole('combobox', { name: 'IDR IDR' }).click();
  await page.getByRole('option', { name: 'IDR' }).click();
  
  await page.getByRole('textbox', { name: 'Status LPJ' }).click();
  await page.getByText('Diserahkan ke LPPM').click();

  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  await page.waitForTimeout(2000);

  // Submit Approval Laporan Hasil & LPJ
  await docAction(page, "Ajukan Approval Laporan Hasil", page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }), () => 
    page.getByRole('button', { name: 'Ajukan Approval Kepala LPPM' }).click()
  );

  // --- SUBMIT REQUEST DI MODUL PERSETUJUAN ---
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  // Pilih request yang baru saja diajukan
  const submitLink = page.getByRole('link', { name: new RegExp(`(Akan Diajukan|Persetujuan Laporan Hasil).*${targetProjectName}`, 'i') }).first();
  await docAction(page, "Select Laporan Request", submitLink, () => submitLink.click());
  await page.getByRole('button', { name: 'Menyerahkan' }).click();

  // 2. APPROVAL OLEH KEPALA LPPM (Garis)
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
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
  const approvalRow = page.getByRole('cell', { name: /Persetujuan Laporan Hasil/ }).first();
  await approvalRow.click();
  await docAction(page, "Final Approve Laporan & LPJ", page.getByRole('button', { name: 'Setujui', exact: true }), () => 
    page.getByRole('button', { name: 'Setujui', exact: true }).click()
  );

  console.log(`✅ HP-12: Laporan Hasil & LPJ Full Flow completed for ${targetProjectName}.`);
});