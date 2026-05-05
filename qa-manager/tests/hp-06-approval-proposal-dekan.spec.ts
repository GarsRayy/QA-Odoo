import { test, expect } from '@playwright/test';
import { docAction } from './utils/doc-helper';
import { getState } from './utils/state-helper';

/**
 * HP-06: Persetujuan Akhir Proposal
 * QA: Garis Rayya Rabbani
 */
test('HP-06: Persetujuan Akhir Proposal', async ({ page }) => {
  // Mengambil data lengkap dari HP sebelumnya agar sinkron
  const sharedData = getState('lastTestData');
  const targetProjectName = sharedData?.projectName || "ABC DEF"; 

  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  
  // Login sebagai Tendik
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_PASSWORD || 'tendik1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();
  
  // Navigasi ke Persetujuan
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  // --- SEARCH LOGIC AGAR AKURAT ---
  const searchInput = page.locator('.o_searchview_input');
  await searchInput.fill(targetProjectName);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Pilih record & Approve
  const recordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record (Tendik)", recordRow, () => recordRow.click());
  
  const approveBtn = page.getByRole('button', { name: 'Setujui', exact: true });
  await docAction(page, "Approve by Tendik", approveBtn, () => approveBtn.click());
  
  // Logout
  await page.getByRole('link', { name: 'Menu Home' }).click();
  await page.getByRole('button', { name: /Pengguna User/ }).click();
  await page.getByRole('menuitem', { name: 'Log keluar' }).click();
  
  // Login sebagai Kepala LPPM (garisrayya@gmail.com)
  await page.getByRole('link', { name: 'Sign in' }).click();
  // Jika muncul list user, klik user yang sesuai atau isi manual
  const userOption = page.getByRole('button', { name: 'garisrayya@gmail.com DUMMY' });
  if (await userOption.isVisible()) {
    await userOption.click();
  } else {
    await page.getByRole('textbox', { name: 'Email' }).fill(process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  }
  
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.getByRole('button', { name: 'Log masuk' }).click();
  
  // Navigasi ulang untuk Approval Final
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();

  // Search ulang
  await page.locator('.o_searchview_input').fill(targetProjectName);
  await page.keyboard.press('Enter');
  
  const finalRecordRow = page.getByRole('cell', { name: targetProjectName }).first();
  await docAction(page, "Select Record (Kepala LPPM)", finalRecordRow, () => finalRecordRow.click());
  
  const finalApproveBtn = page.getByRole('button', { name: 'Setujui', exact: true });
  await docAction(page, "Final Approval by Kepala LPPM", finalApproveBtn, () => finalApproveBtn.click());
  
  await page.getByRole('link', { name: 'Menu Home' }).click();
  console.log(`✅ HP-06: Final approval completed for ${targetProjectName}.`);
});