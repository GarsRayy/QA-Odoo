import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { test_code, status, error_message, screenshot_url, duration } = body;

    if (!test_code || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('execution_logs')
      .insert([
        { 
          test_code, 
          status, 
          error_message, 
          screenshot_url,
          executed_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ message: 'Log recorded successfully', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
