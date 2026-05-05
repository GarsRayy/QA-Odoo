import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gemini } from '@/lib/gemini';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');

  if (!runId) {
    return NextResponse.json({ error: 'Run ID is required' }, { status: 400 });
  }

  try {
    // Fetch the specific test run from test_runs table
    const { data: runData, error: runError } = await supabase
      .from('test_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !runData) {
      console.error('Fetch error:', runError);
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }

    // Run AI analysis if test failed
    let aiAnalysis = '';
    if (runData.status === 'failed' && runData.error_message) {
      try {
        aiAnalysis = await gemini.analyzeError(runData.error_message);
      } catch (e) {
        aiAnalysis = 'AI analysis unavailable.';
      }
    }

    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const runTime = new Date(runData.created_at).toLocaleString('id-ID');
    const duration = runData.duration_ms ? `${(runData.duration_ms / 1000).toFixed(1)}s` : 'N/A';

    // Generate a well-structured HTML report as PDF-compatible response
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>QA Report — ${runData.test_case_id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; }
    .header { background: #991b1b; color: white; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.7; }
    .body { padding: 32px; }
    .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:bold; }
    .passed { background:#dcfce7; color:#15803d; }
    .failed { background:#fee2e2; color:#b91c1c; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size:14px; color:#991b1b; border-bottom:1px solid #fecaca; padding-bottom:4px; margin-bottom:12px; }
    .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .meta-item label { display:block; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#9ca3af; font-weight:bold; }
    .meta-item span { display:block; font-size:14px; font-weight:600; color:#111827; margin-top:2px; }
    .error-box { background:#fff1f2; border-left:4px solid #ef4444; padding:16px; border-radius:4px; font-family:monospace; font-size:12px; white-space:pre-wrap; word-break:break-word; }
    .ai-box { background:#eff6ff; border-left:4px solid #3b82f6; padding:16px; border-radius:4px; font-size:13px; line-height:1.6; white-space:pre-wrap; }
    .footer { margin-top:40px; text-align:center; font-size:10px; color:#9ca3af; border-top:1px solid #f3f4f6; padding-top:16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>QA Test Run Report</h1>
    <p>Sistem Tata Kelola Kerjasama LPPM ITERA — Generated: ${today}</p>
  </div>
  <div class="body">
    <div class="section">
      <h2>Run Summary</h2>
      <div class="meta-grid">
        <div class="meta-item"><label>Test Case ID</label><span>${runData.test_case_id}</span></div>
        <div class="meta-item"><label>Status</label><span><span class="badge ${runData.status}">${runData.status?.toUpperCase()}</span></span></div>
        <div class="meta-item"><label>Scenario Title</label><span>${runData.title}</span></div>
        <div class="meta-item"><label>Duration</label><span>${duration}</span></div>
        <div class="meta-item"><label>Executed By</label><span>${runData.executed_by || 'System'}</span></div>
        <div class="meta-item"><label>Execution Time</label><span>${runTime}</span></div>
        <div class="meta-item"><label>Run ID</label><span style="font-family:monospace;font-size:11px;">${runData.id}</span></div>
      </div>
    </div>
    ${runData.error_message ? `
    <div class="section">
      <h2>Error Details</h2>
      <div class="error-box">${runData.error_message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    </div>` : ''}
    ${aiAnalysis ? `
    <div class="section">
      <h2>AI Forensic Analysis (Gemini)</h2>
      <div class="ai-box">${aiAnalysis.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    </div>` : ''}
    <div class="footer">
      QA Management System — LPPM ITERA | Run ID: ${runId} | ${today}
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="QA-Report-${runData.test_case_id}.html"`,
      },
    });

  } catch (error) {
    console.error('QA Report Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


