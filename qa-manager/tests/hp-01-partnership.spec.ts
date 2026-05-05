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
    
    await page.click('button.btn-primary[type="submit"]');
    
    // Verify redirected to dashboard
    await expect(page).toHaveURL(/.*\/odoo|.*\/web/, { timeout: 15000 });
    await expect(page.locator('body')).toHaveClass(/.*o_web_client.*/, { timeout: 15000 });
    
    console.log(`✅ Login berhasil: ${role.name} — QA: Garis Rayya Rabbani`);
  });
}
