import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build CSV content
    const headers = ['Test Case ID', 'Title', 'Status', 'Duration (s)', 'Error Message', 'Executed By', 'Date'];
    const rows = (data || []).map(run => [
      run.test_case_id || '',
      `"${(run.title || '').replace(/"/g, '""')}"`,
      run.status || '',
      run.duration_ms ? (run.duration_ms / 1000).toFixed(1) : '',
      `"${(run.error_message || '').replace(/"/g, '""')}"`,
      run.executed_by || '',
      run.created_at ? new Date(run.created_at).toLocaleString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const today = new Date().toISOString().slice(0, 10);
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="QA-Report-${today}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 });
  }
}
