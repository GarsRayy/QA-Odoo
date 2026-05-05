import { test, expect } from '@playwright/test';

/**
 * TEMPLATE: Happy Path (HP)
 * 
 * Gunakan file ini sebagai dasar setelah melakukan recording via `npm run test:record`.
 * Ganti [ID-JUDUL] dengan kode test Anda (misal: HP-05: Buat Pengajuan).
 */

test('[ID-JUDUL]', async ({ page }) => {
  // Ambil URL dari environment atau default
  const odooUrl = process.env.ODOO_URL || 'https://edu-pusatpengabdianlppm.odoo.com';
  
  // 1. Navigasi
  await page.goto(odooUrl + '/web/login');
  
  // 2. Login (Gunakan kredensial dari .env)
  await page.fill('#login', process.env.ODOO_USERNAME || '');
  await page.fill('#password', process.env.ODOO_PASSWORD || '');
  await page.click('button.btn-primary[type="submit"]');

  // PASTE HASIL RECORDING ANDA DI BAWAH INI
  // ======================================
  
  
  
  // ======================================

  // 3. Verifikasi Akhir (Contoh)
  // await expect(page).toHaveURL(/.*dashboard/);
  
  console.log('✅ Test Berhasil Selesai');
});
