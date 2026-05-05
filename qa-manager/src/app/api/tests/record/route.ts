import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: Request) {
  try {
    const { url } = await req.json().catch(() => ({}));
    const targetUrl = url || 'https://edu-pusatpengabdianlppm.odoo.com';
    
    // Launch playwright codegen in background
    // Note: Since the app is running locally, this will open the browser on the user's desktop
    console.log(`🚀 Launching recorder for: ${targetUrl}`);
    
    // Use npx to ensure it finds the playwright binary
    exec(`npx playwright codegen ${targetUrl}`, (error) => {
      if (error) {
        console.error(`Error launching recorder: ${error.message}`);
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Recorder launched on your desktop' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
