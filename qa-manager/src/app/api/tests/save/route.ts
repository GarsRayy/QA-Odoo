import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code, name, content, category, description, roles, steps, expectedResult } = await req.json();
    
    if (!code || !name || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Standardize file name: hp-05-upload-proposal.spec.ts
    const sanitizedName = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with hyphen
      .replace(/-+/g, '-')        // collapse multiple hyphens
      .replace(/^-|-$/g, '');     // trim leading/trailing hyphens

    const fileName = `${code.toLowerCase()}-${sanitizedName}.spec.ts`;
    const testsDir = path.join(process.cwd(), 'tests');
    const filePath = path.join(testsDir, fileName);

    // Ensure tests directory exists
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    // Wrap the content if it doesn't already have the test structure
    let finalContent = content;
    if (!content.includes('import { test')) {
      finalContent = `import { test, expect } from '@playwright/test';
import { generateTestData } from './fixtures/data-generator';

/**
 * ${code.toUpperCase()}: ${name}
 * Generated via QA Web Studio
 */
test('${code.toUpperCase()}: ${name}', async ({ page }) => {
  const data = generateTestData();
${content}
});
`;
    }

    fs.writeFileSync(filePath, finalContent, 'utf8');

    // Sync with Supabase test_scenarios
    const { error: supabaseError } = await supabase
      .from('test_scenarios')
      .upsert({
        code: code.toUpperCase(),
        name: name,
        category: category || 'Happy Path',
        description: description || '',
        roles: roles || [],
        steps: steps || [],
        expected_result: expectedResult || '',
        file_path: fileName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'code' });

    if (supabaseError) {
      console.error('Supabase Sync Error:', supabaseError);
      return NextResponse.json({ 
        success: true, 
        message: `Test saved to file, but Supabase sync failed: ${supabaseError.message}`,
        fileName 
      });
    }

    console.log(`✅ Saved and synced test case: ${fileName}`);

    return NextResponse.json({ 
      success: true, 
      message: `Test case ${code} saved and synced successfully!`,
      fileName 
    });
  } catch (error: any) {
    console.error('Error saving test file:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
