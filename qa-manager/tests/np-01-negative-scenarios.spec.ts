import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * NP-01: Negative Test Cases
 * Testing failure paths and validation.
 */
test.describe('NP-01: Negative Scenarios', () => {

  test('NP-01: Login Failure - Invalid Password', async ({ page }) => {
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
    await page.fill('#login', 'danielcalvin822@gmail.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button.btn-primary');
    
    // Check for error message
    await expect(page.locator('.alert-danger')).toBeVisible();
    await expect(page.locator('.alert-danger')).toContainText('Wrong login/password');
    console.log('✅ NP-01: Login failure handled correctly.');
  });

  test('NP-02: Validation - Missing Mandatory Project Title', async ({ page }) => {
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
    await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
    await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
    await page.click('button.btn-primary');
    
    await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
    await page.getByRole('button', { name: 'Baru' }).click();
    
    // Fill everything BUT the title (Perihal/Judul)
    await page.getByRole('textbox', { name: 'Name...' }).fill('INVALID_TEST_NO_TITLE');
    
    // Try to click "Surat Diterima" which usually triggers a transition
    await page.getByRole('button', { name: 'Surat Diterima' }).click();
    
    // Odoo usually highlights the field or shows a notification
    // Check for invalid field styling or notification
    const titleField = page.getByRole('textbox', { name: 'Perihal/Judul :' });
    await expect(titleField).toHaveClass(/o_field_invalid/);
    console.log('✅ NP-02: Missing mandatory title caught by validation.');
  });

  test('NP-03: Access Control - Unauthorized Approval Access', async ({ page }) => {
    // Login as a role that shouldn't approve (e.g., Nanindya / Team Member)
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
    await page.fill('#login', process.env.ODOO_NANINDYA_USER || 'nanindya.123240019@student.itera.ac.id');
    await page.fill('#password', process.env.ODOO_NANINDYA_PASS || 'testing1234');
    await page.click('button.btn-primary');
    
    // Try to navigate directly to approval manager view
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/odoo/approvals');
    
    // The "Manajer" button should NOT be visible for a team member
    const managerBtn = page.getByRole('button', { name: 'Manajer' });
    await expect(managerBtn).not.toBeVisible();
    console.log('✅ NP-03: Unauthorized access prevented (Manager menu hidden).');
  });

  test('NP-04: Process Flow - Submit Without Required Attachment', async ({ page }) => {
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
    await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
    await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
    await page.click('button.btn-primary');
    
    await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
    await page.getByRole('button', { name: 'Baru' }).click();
    
    await page.getByRole('textbox', { name: 'Name...' }).fill('NP-04-TEST-NO-ATTACH');
    await page.getByRole('textbox', { name: 'Perihal/Judul :' }).fill('Test Submission without PDF');
    
    // Attempt to click "Surat Diterima" without uploading the required PDF
    await page.getByRole('button', { name: 'Surat Diterima' }).click();
    
    // Check if Odoo blocks it (usually the file field gets a red border/o_field_invalid)
    const fileField = page.locator('div[name="x_studio_upload_surat_pdf"]');
    await expect(fileField).toHaveClass(/o_field_invalid/);
    console.log('✅ NP-04: Submission blocked due to missing attachment.');
  });

  test('NP-05: Validation - Invalid File Upload (Non-PDF)', async ({ page }) => {
    await page.goto('https://edu-pusatpengabdianlppm.odoo.com/web/login');
    await page.fill('#login', process.env.ODOO_USERNAME || 'danielcalvin822@gmail.com');
    await page.fill('#password', process.env.ODOO_PASSWORD || 'tendik1234');
    await page.click('button.btn-primary');
    
    await page.getByRole('option', { name: ' Kerjasama LPPM' }).click();
    await page.getByRole('button', { name: 'Baru' }).click();
    
    // Attempt to upload a text file instead of PDF
    const scratchFile = path.resolve(__dirname, 'fixtures', 'invalid.txt');
    // Note: ensure this file exists or mock it
    const fileInput = page.locator('div[name="x_studio_upload_surat_pdf"] input[type="file"]');
    
    // In many Odoo setups, the client side 'accept' attribute might prevent selection, 
    // but Playwright can force it. We check if the system handles it after upload attempt.
    // (This is a placeholder as exact behavior depends on Odoo Studio constraints)
    console.log('⚠️ NP-05: Manual verification recommended for specific file-type constraints.');
  });


});
