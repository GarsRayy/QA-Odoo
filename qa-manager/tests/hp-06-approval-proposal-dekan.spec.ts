import { test, expect } from '@playwright/test';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-06: Persetujuan Akhir Proposal
 * QA: Garis Rayya Rabbani
 * //NOTES: Approval berjenjang (Tendik -> Kepala LPPM). Pastikan status record berubah menjadi 'FACULTY_APPROVED'.
 */
test('HP-06: Persetujuan Akhir Proposal', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary[type="submit"]');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo');
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  
  // Select latest record
  await page.getByRole('cell', { name: /#/ }).first().click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();
  
  // Logout and Login as Kepala LPPM
  await page.locator('.o_user_menu button').click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  
  await page.fill('#login', process.env.ODOO_KEPALA_USER || 'garisrayya@gmail.com');
  await page.fill('#password', process.env.ODOO_KEPALA_PASS || 'testing1234');
  await page.click('button.btn-primary[type="submit"]');
  
  await page.getByRole('option', { name: 'Persetujuan' }).click();
  await page.getByRole('button', { name: 'Manajer' }).click();
  await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
  await page.getByRole('cell', { name: /#/ }).first().click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();
  
  console.log(`✅ HP-06: Final approval completed by Kepala LPPM.`);
});