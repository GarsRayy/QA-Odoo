import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

/**
 * HP-02: Registrasi Dynamic Project
 * QA: Garis Rayya Rabbani
 */
test('HP-02: Registrasi Dynamic Project', async ({ page }) => {
  const data = generateTestData();
  await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
  await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
  await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
  await page.click('button.btn-primary');
  
  await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
  await page.getByRole('button', { name: 'Baru' }).click();
  await page.getByRole('textbox', { name: 'Name...' }).fill(data.projectName);
  await page.getByRole('textbox', { name: 'Perihal/Judul :' }).fill(data.subject);
  await page.getByRole('combobox', { name: 'Kontak Mitra:' }).click();
  await page.getByRole('combobox', { name: 'Kontak Mitra:' }).fill(data.partnerName);
  await page.getByRole('option', { name: `Buat "${data.partnerName}"` }).click();
  
  const fileInput = page.locator('div[name="x_studio_upload_surat_pdf"] input.o_input_file, input.o_input_file').first();
  const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
  await fileInput.setInputFiles(pdfPath);
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Surat Diterima' }).click();
  await expect(page.getByText('Surat Diterima')).toBeVisible();
  
  console.log(`✅ Record created: ${data.projectName}`);
});
