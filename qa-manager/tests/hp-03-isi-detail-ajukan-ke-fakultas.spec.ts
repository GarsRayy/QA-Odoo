import { test, expect } from '@playwright/test';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-03: Detailing Project
 * QA: Garis Rayya Rabbani
 * //NOTES: Menggunakan ID Studio untuk stabilitas input tanggal dan fakultas.
 */
test('HP-03: Detailing Project', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary');
  
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  // In dynamic mode, we search for the project we just created or use the first one if it's a generic run
  await page.getByRole('cell', { name: /#/ }).first().click(); 
  await page.waitForTimeout(3000);
  
  // Fill No Surat Mitra
  await page.getByRole('textbox', { name: 'No. Surat Mitra :' }).fill(data.letterNumber);
  
  // Handle Date Picker robustly
  const dateField = page.locator('[name="x_studio_tanggal_surat_"], #x_studio_tanggal_surat__0').first();
  await dateField.click();
  await page.waitForTimeout(1000);
  await page.locator('.o_datetime_picker .o_today, .o_datepicker .today').first().click();
  
  // Fill Fakultas (Defaults to FTI for HP-03, but can be randomized)
  const fakultasInput = page.locator('div[name="x_studio_fakultas"] input, #x_studio_fakultas_0').first();
  await fakultasInput.fill('FTI');
  await page.waitForTimeout(2000);
  await page.locator('.o-autocomplete--dropdown-menu li').first().click();
  
  await page.getByRole('button', { name: 'Ajukan Persetujuan (FTI)' }).click();
  await page.waitForTimeout(4000);
  
  // Transition to Approvals Module
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/approvals');
  await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
  await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
  
  // Submit for approval
  await page.getByRole('link', { name: /Akan Diajukan/ }).first().click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Menyerahkan' }).click();
  
  await expect(page.getByText('Menyerahkan')).not.toBeVisible();
  console.log(`✅ Detailing & Submission completed for: ${data.projectName}`);
});
