import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestData } from './fixtures/data-generator';

const faculties = [
  { 
    name: 'FTIK', 
    user: process.env.ODOO_FTIK_USER || 'xiaoxaniel@gmail.com', 
    pass: process.env.ODOO_FTIK_PASS || 'ftik1234',
    prodi: 'Teknik Informatika'
  },
  { 
    name: 'FS', 
    user: process.env.ODOO_FS_USER || 'rayyarabbani26@gmail.com', 
    pass: process.env.ODOO_FS_PASS || 'testing1234',
    prodi: 'Teknik Sipil'
  }
];

for (const faculty of faculties) {
  test.describe(`Happy Path - Faculty ${faculty.name}`, () => {
    let data: any;

    test.beforeAll(() => {
      data = generateTestData();
    });
    
    test(`Create & Submit Project`, async ({ page }) => {
      // 1. Login as Tendik LPPM to create record
      await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
      await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
      await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
      await page.click('button.btn-primary');
      
      await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
      await page.getByRole('button', { name: 'Baru' }).click();
      await page.getByRole('textbox', { name: 'Name...' }).fill(data.projectName);
      await page.getByRole('textbox', { name: 'Perihal/Judul :' }).fill(`Project ${faculty.name}: ${data.subject}`);
      
      const fileInput = page.locator('div[name="x_studio_upload_surat_pdf"] input.o_input_file, input.o_input_file').first();
      const pdfPath = path.resolve(__dirname, 'fixtures', 'dummy-surat.pdf');
      await fileInput.setInputFiles(pdfPath);
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Surat Diterima' }).click();

      // 2. Detailing & Submit to Faculty
      await page.getByRole('textbox', { name: 'No. Surat Mitra :' }).fill(data.letterNumber);
      const fakultasInput = page.locator('div[name="x_studio_fakultas"] input, #x_studio_fakultas_0').first();
      await fakultasInput.fill(faculty.name);
      await page.waitForTimeout(2000);
      await page.locator('.o-autocomplete--dropdown-menu li').first().click();
      
      await page.getByRole('button', { name: `Ajukan Persetujuan (${faculty.name})` }).click();
      await page.waitForTimeout(2000);

      // Submit in Approvals
      await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/approvals');
      await page.getByRole('button', { name: 'Persetujuan Saya' }).click();
      await page.getByRole('menuitem', { name: 'Permintaan Saya' }).click();
      await page.getByRole('link', { name: /Akan Diajukan/ }).first().click();
      await page.getByRole('button', { name: 'Menyerahkan' }).click();
      
      console.log(`✅ Project ${data.projectName} submitted to ${faculty.name}`);
      
      // Logout
      await page.locator('.o_user_menu button').click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();
    });

    test(`Approve & Assign Team`, async ({ page }) => {
      // Login as Faculty Manager
      await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
      await page.fill('#login', faculty.user);
      await page.fill('#password', faculty.pass);
      await page.click('button.btn-primary');

      // Approve
      await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/approvals');
      await page.getByRole('button', { name: 'Manajer' }).click();
      await page.getByRole('menuitem', { name: 'Persetujuan untuk ditinjau' }).click();
      await page.getByRole('cell', { name: data.projectName }).first().click();
      await page.getByRole('button', { name: 'Setujui', exact: true }).click();
      
      // Assign Team (Like HP-04)
      await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/action-895');
      await page.getByRole('cell', { name: data.projectName }).first().click();
      
      await page.getByRole('button', { name: 'Tambahkan baris' }).click();
      await page.getByRole('textbox', { name: 'Name...' }).fill(data.teamName);
      await page.getByRole('combobox', { name: 'Ketua Tim' }).click();
      await page.getByRole('option', { name: 'Cari lebih...' }).click();
      await page.getByRole('cell', { name: 'Nanindya', exact: true }).click();
      await page.getByRole('textbox', { name: 'Program Studi' }).fill(faculty.prodi);
      await page.getByRole('button', { name: 'Simpan & Tutup' }).click();
      
      await page.getByRole('button', { name: 'Tugaskan Ketua Tim' }).click();
      await expect(page.getByText('Tugaskan Ketua Tim')).not.toBeVisible();
      
      console.log(`✅ Faculty ${faculty.name} approved and assigned team for ${data.projectName}`);
    });
  });
}
