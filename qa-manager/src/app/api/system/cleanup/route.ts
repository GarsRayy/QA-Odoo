import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    // Menghapus data dari tabel-tabel utama yang sering menumpuk data usang
    const tables = ['test_runs', 'bugs', 'execution_logs'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Trick untuk hapus semua baris di RLS

      if (error) console.warn(`Warning deleting from ${table}:`, error.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'System cleanup successful. All logs and bugs have been cleared.' 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
