import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use server-side client to bypass RLS if needed
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { test_code, title, status, error_message, screenshot_url, video_url, duration, executed_by } = body;

    if (!test_code || !status) {
      return NextResponse.json({ error: 'Missing required fields: test_code and status' }, { status: 400 });
    }

    // Write to test_runs — the table read by all frontend pages (dashboard, logs, test-cases)
    const { data, error } = await supabase
      .from('test_runs')
      .insert([
        { 
          test_case_id: test_code,
          title: title || test_code,
          status,
          error_message: error_message || null,
          screenshot_path: screenshot_url || null,
          video_path: video_url || null,
          duration_ms: duration ? Math.round(duration) : null,
          executed_by: executed_by || 'Playwright API',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    // Auto-create bug report for failed tests
    if (status === 'failed' && error_message) {
      await supabase.from('bugs').insert([{
        test_code,
        title: `[Auto-Bug] ${title || test_code} Failed`,
        description: `Automation failure via /api/logs.\n\nError: ${error_message}`,
        severity: test_code?.startsWith('HP') ? 'High' : 'Medium',
        status: 'Open',
        screenshot_url: screenshot_url || null,
        reported_by: executed_by || 'Playwright API'
      }]);
    }

    return NextResponse.json({ message: 'Log recorded successfully to test_runs', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET endpoint to retrieve recent logs — useful for external tools polling status
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
