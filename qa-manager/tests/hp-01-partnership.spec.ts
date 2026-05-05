import { test, expect } from '@playwright/test';

/**
 * HP-01: Login Test Semua Akun
 * 
 * QA: Garis Rayya Rabbani
 * 
 * Verifikasi bahwa semua akun role bisa login ke Odoo berhasil.
 */

const roles = [
  { name: 'Tendik LPPM', user: process.env.ODOO_USERNAME, pass: process.env.ODOO_PASSWORD },
  { name: 'Keuangan Itera', user: process.env.ODOO_KEUANGAN_USER, pass: process.env.ODOO_KEUANGAN_PASS },
  { name: 'Fakultas FTI', user: process.env.ODOO_FTI_USER, pass: process.env.ODOO_FTI_PASS },
  { name: 'Fakultas FTIK', user: process.env.ODOO_FTIK_USER, pass: process.env.ODOO_FTIK_PASS },
  { name: 'Fakultas FS', user: process.env.ODOO_FS_USER, pass: process.env.ODOO_FS_PASS },
  { name: 'Kepala LPPM', user: process.env.ODOO_KEPALA_USER, pass: process.env.ODOO_KEPALA_PASS },
  { name: 'Sekre LPPM', user: process.env.ODOO_SEKRE_USER, pass: process.env.ODOO_SEKRE_PASS },
  { name: 'LPPM Keuangan', user: process.env.ODOO_LPPM_KEU_USER, pass: process.env.ODOO_LPPM_KEU_PASS },
  { name: 'Tim Pelaksana (Nanindya)', user: process.env.ODOO_NANINDYA_USER, pass: process.env.ODOO_NANINDYA_PASS },
];

for (const role of roles) {
  test(`HP-01: Login Test — ${role.name}`, async ({ page }) => {
    const odooUrl = process.env.ODOO_URL || 'https://edu-pusatpengabdianlppm.odoo.com';
    
    await page.goto(odooUrl + '/web/login');
    
    await page.fill('#login', role.user || '');
    await page.fill('#password', role.pass || '');
    
    // Press Enter to submit - often more reliable than clicking the button in Odoo
    await page.keyboard.press('Enter');
    
    // Wait for the Odoo Main Navbar to appear - this is the definitive proof of successful login
    // We increase timeout because Odoo dashboard can be heavy
    try {
      await page.waitForSelector('.o_main_navbar', { timeout: 30000 });
      console.log(`✅ Dashboard detected for ${role.name}`);
    } catch (e) {
      // Fallback: check if we are still on login page
      if (await page.locator('.alert-danger').isVisible()) {
        const errorMsg = await page.locator('.alert-danger').innerText();
        throw new Error(`Login failed for ${role.name}: ${errorMsg}`);
      }
      throw e;
    }
    
    // Double check with body class
    const body = page.locator('body');
    await expect(body).toHaveClass(/.*o_web_client.*/, { timeout: 15000 });
    
    console.log(`✅ Login berhasil: ${role.name} — QA: Garis Rayya Rabbani`);
  });
}
