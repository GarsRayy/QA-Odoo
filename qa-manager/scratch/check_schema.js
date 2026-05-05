const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("Attempting to insert with only 'name'...");
  const { data, error } = await supabase
    .from('test_scenarios')
    .insert([{ name: 'TEST-FIX' }])
    .select();

  if (error) {
    console.error("Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data);
  }
}
test();
