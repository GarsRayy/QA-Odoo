import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-11: Mulai Pelaksanaan (RAB Final)
 * QA: Garis Rayya Rabbani
 * //NOTES: Penambahan pengisian Nilai RAB dan penanganan bug 'Gagal Kirim' dengan memastikan sinkronisasi data.
 */
test('HP-11: Mulai Pelaksanaan (RAB Final)', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_NANINDYA_USER || 'nanindya.123240019@student.itera.ac.id');
  await page.fill('#password', process.env.ODOO_NANINDYA_PASS || 'testing1234');
  await page.click('button.btn-primary');
  
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
  await page.getByRole('cell', { name: /#/ }).first().click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('tab', { name: 'Keuangan (RAB + LPJ)' }).click();
  await page.waitForTimeout(2000);

  // HAPUS BARIS LAMA (Jika ada untuk menghindari duplikasi/bug gagal kirim)
  const existingRow = page.locator('.o_list_renderer .o_data_row').first();
  if (await existingRow.count() > 0) {
    const deleteBtn = existingRow.locator('.o_list_record_remove, .fa-trash-o').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Klik Tambahkan baris di tabel Keuangan
  await page.getByRole('button', { name: 'Tambahkan baris' }).click();
  await page.waitForTimeout(2000);
  
  // Isi detail di Dialog/Pop-up
  await page.getByRole('textbox', { name: 'Tipe RAB' }).click();
  await page.getByText('Final', { exact: true }).click();
  
  await page.getByRole('textbox', { name: 'Name...' }).fill(`RAB Final ${data.projectName}`);
  
  // Isi NILAI RAB
  await page.getByRole('textbox', { name: 'Nilai RAB' }).fill('150000000');
  
  // OTOMATISASI UNGGAH
  const fileInput = page.locator('label.o_select_file_button input[type="file"]').first();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  // Currency IDR
  await page.getByRole('combobox', { name: 'IDR IDR' }).click();
  await page.getByRole('option', { name: 'IDR' }).click();
  
  await page.getByRole('textbox', { name: 'Catatan' }).fill(`Penyelesaian RAB Final ${data.projectName} - OK`);
  await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
  
  // TUNGGU STABIL: Penting agar Odoo tidak 'Gagal Kirim' karena data belum sinkron
  await page.waitForTimeout(3000);
  
  // Simpan secara manual untuk memastikan state tersimpan di server
  const manualSave = page.locator('.o_form_button_save, button[data-tooltip="Save manually"]').first();
  if (await manualSave.isVisible()) {
    await manualSave.click();
    await page.waitForTimeout(3000);
  }
  
  // Klik tombol aksi utama
  const submitBtn = page.getByRole('button', { name: 'Submit RAB Final' }).first();
  await submitBtn.waitFor({ state: 'visible', timeout: 15000 });
  await submitBtn.click();
  
  await page.waitForTimeout(4000);
  await expect(page.getByRole('button', { name: 'Submit RAB Final' })).not.toBeVisible();
  
  console.log(`✅ HP-11: RAB Final submitted for ${data.projectName}`);
});