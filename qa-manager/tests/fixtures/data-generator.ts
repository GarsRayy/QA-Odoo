/**
 * Data Generator Utility
 * Generates random data for Odoo QA tests to ensure dynamic test runs.
 */

export const generateTestData = () => {
  const timestamp = Date.now().toString().slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  return {
    projectName: `#${timestamp} PROJECT ${randomStr}`,
    subject: `Kerjasama Research & Development ${randomStr}`,
    partnerName: `MITRA_${randomStr}_GLOBAL`,
    letterNumber: `${randomStr}/${timestamp}/LPPM/2026`,
    teamName: `TIM_${randomStr}_DEV`,
    prodi: ['Teknik Arsitektur', 'Teknik Informatika', 'Teknik Sipil'][Math.floor(Math.random() * 3)]
  };
};

export type TestData = ReturnType<typeof generateTestData>;
