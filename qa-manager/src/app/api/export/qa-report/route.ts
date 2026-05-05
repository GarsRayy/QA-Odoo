import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { QAReportTemplate } from '@/components/reports/QAReportTemplate';
import { createClient } from '@supabase/supabase-js';
import { gemini } from '@/lib/gemini';

// Initialize Supabase Client
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
    // 1. Fetch Test Run Data from Supabase
    const { data: runData, error: runError } = await supabase
      .from('test_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (runError || !runData) {
      console.error('Fetch error:', runError);
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }

    // 2. Fetch Individual Test Case Results
    const { data, error: casesError } = await supabase
      .from('test_results')
      .select('*')
      .eq('run_id', runId);

    if (casesError) {
      console.error('Fetch cases error:', casesError);
      return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 });
    }

    // 3. Prepare data for the template with AI Analysis
    const testCases = await Promise.all((data || []).map(async (tc: any) => {
      let aiAnalysis = undefined;
      
      // Only trigger AI analysis for failed tests
      if (tc.status === 'failed' && tc.error_message) {
        aiAnalysis = await gemini.analyzeError(tc.error_message);
      }

      return {
        id: tc.id.toString(),
        name: tc.scenario_name || tc.name,
        status: tc.status as 'passed' | 'failed' | 'skipped',
        duration: tc.duration || 'N/A',
        error: tc.error_message,
        aiAnalysis: aiAnalysis
      };
    }));

    const reportData = {
      runId: runData.id.toString(),
      projectName: 'Odoo LPPM QA Automation',
      timestamp: new Date(runData.created_at).toLocaleString('id-ID'),
      executedBy: runData.executed_by || 'System Automated',
      testCases: testCases
    };

    // 4. Render PDF to Stream
    const stream = await renderToStream(React.createElement(QAReportTemplate, reportData) as any);
    
    // 5. Return PDF Stream
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="QA-Report-${runId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
